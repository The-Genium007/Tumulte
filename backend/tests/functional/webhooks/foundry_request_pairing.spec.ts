import { test } from '@japa/runner'
import testUtils from '#tests/helpers/database'
import redis from '@adonisjs/redis/services/main'

test.group('Foundry Webhook - Request Pairing', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  // Clean up Redis after each test
  group.each.teardown(async () => {
    const keys = await redis.keys('pairing:*')
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  })

  test('POST /webhooks/foundry/request-pairing should generate pairing code with valid params', async ({
    assert,
    client,
  }) => {
    const response = await client.post('/webhooks/foundry/request-pairing').json({
      worldId: 'test-world-123',
      worldName: 'My Test World',
      gmUserId: 'gm-user-456',
      moduleVersion: '2.0.2',
    })

    response.assertStatus(200)
    assert.property(response.body(), 'success')
    assert.property(response.body(), 'code')
    assert.property(response.body(), 'expiresIn')
    assert.property(response.body(), 'expiresAt')
    assert.property(response.body(), 'serverUrl')

    // Verify code format (ABC-123)
    const code = response.body().code
    assert.match(code, /^[A-Z0-9]{3}-[A-Z0-9]{3}$/)

    // Verify expiry is 5 minutes (300 seconds)
    assert.equal(response.body().expiresIn, 300)
  })

  test('POST /webhooks/foundry/request-pairing should store pairing in Redis', async ({
    assert,
    client,
  }) => {
    const worldId = 'redis-test-world-' + Date.now()

    const response = await client.post('/webhooks/foundry/request-pairing').json({
      worldId,
      worldName: 'Redis Test World',
    })

    response.assertStatus(200)
    const code = response.body().code

    // Verify Redis has the pairing by code
    const pairingByCode = await redis.get(`pairing:code:${code}`)
    assert.isNotNull(pairingByCode)

    const parsedByCode = JSON.parse(pairingByCode!)
    assert.equal(parsedByCode.worldId, worldId)
    assert.equal(parsedByCode.worldName, 'Redis Test World')

    // Verify Redis has the pairing by worldId
    const pairingByWorld = await redis.get(`pairing:world:${worldId}`)
    assert.isNotNull(pairingByWorld)
  })

  test('POST /webhooks/foundry/request-pairing should reject missing worldId', async ({
    client,
  }) => {
    const response = await client.post('/webhooks/foundry/request-pairing').json({
      worldName: 'Test World',
    })

    response.assertStatus(400)
    response.assertBodyContains({ error: 'Missing required parameters: worldId, worldName' })
  })

  test('POST /webhooks/foundry/request-pairing should reject missing worldName', async ({
    client,
  }) => {
    const response = await client.post('/webhooks/foundry/request-pairing').json({
      worldId: 'test-world-123',
    })

    response.assertStatus(400)
    response.assertBodyContains({ error: 'Missing required parameters: worldId, worldName' })
  })

  test('POST /webhooks/foundry/request-pairing should use default values for optional params', async ({
    assert,
    client,
  }) => {
    const response = await client.post('/webhooks/foundry/request-pairing').json({
      worldId: 'optional-test-world',
      worldName: 'Optional Test World',
      // gmUserId and moduleVersion are optional
    })

    response.assertStatus(200)

    // Verify Redis has correct defaults
    const code = response.body().code
    const pairingData = await redis.get(`pairing:code:${code}`)
    const parsed = JSON.parse(pairingData!)

    assert.equal(parsed.gmUserId, 'unknown')
    assert.equal(parsed.moduleVersion, '2.0.0')
  })

  test('POST /webhooks/foundry/request-pairing code should not contain confusing characters', async ({
    assert,
    client,
  }) => {
    // Test multiple times to ensure consistent code generation
    for (let i = 0; i < 5; i++) {
      const response = await client.post('/webhooks/foundry/request-pairing').json({
        worldId: `code-test-world-${i}`,
        worldName: 'Code Test World',
      })

      response.assertStatus(200)
      const code = response.body().code

      // Should not contain I, O, 0, 1 (confusing characters)
      assert.notMatch(code, /[IO01]/)
    }
  })
})
