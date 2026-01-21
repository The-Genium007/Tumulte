import { test } from '@japa/runner'
import testUtils from '#tests/helpers/database'
import {
  createTestUser,
  createTestVttProvider,
  createTestVttConnection,
} from '#tests/helpers/test_utils'
import VttConnection from '#models/vtt_connection'
import { faker } from '@faker-js/faker'

test.group('Foundry Webhook - Ping (Heartbeat)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /webhooks/foundry/ping should update lastHeartbeatAt with valid credentials', async ({
    assert,
    client,
  }) => {
    const user = await createTestUser()
    const provider = await createTestVttProvider()
    const connection = await createTestVttConnection({
      userId: user.id,
      vttProviderId: provider.id,
      status: 'active',
    })

    const response = await client.post('/webhooks/foundry/ping').json({
      connectionId: connection.id,
      apiKey: connection.apiKey,
    })

    response.assertStatus(200)
    assert.property(response.body(), 'success')
    assert.property(response.body(), 'timestamp')
    assert.isTrue(response.body().success)

    // Verify lastHeartbeatAt was updated
    const updatedConnection = await VttConnection.findOrFail(connection.id)
    assert.isNotNull(updatedConnection.lastHeartbeatAt)
  })

  test('POST /webhooks/foundry/ping should reject missing connectionId', async ({ client }) => {
    const fakeKey = 'ta_' + faker.string.alphanumeric(32)
    const response = await client.post('/webhooks/foundry/ping').json({
      apiKey: fakeKey,
    })

    response.assertStatus(400)
    response.assertBodyContains({ error: 'Missing required parameters: connectionId, apiKey' })
  })

  test('POST /webhooks/foundry/ping should reject missing apiKey', async ({ client }) => {
    const response = await client.post('/webhooks/foundry/ping').json({
      connectionId: faker.string.uuid(),
    })

    response.assertStatus(400)
    response.assertBodyContains({ error: 'Missing required parameters: connectionId, apiKey' })
  })

  test('POST /webhooks/foundry/ping should reject invalid apiKey', async ({ assert, client }) => {
    const user = await createTestUser()
    const provider = await createTestVttProvider()
    const connection = await createTestVttConnection({
      userId: user.id,
      vttProviderId: provider.id,
      status: 'active',
    })

    const wrongKey = 'ta_' + faker.string.alphanumeric(32)
    const response = await client.post('/webhooks/foundry/ping').json({
      connectionId: connection.id,
      apiKey: wrongKey,
    })

    response.assertStatus(404)
    assert.equal(response.body().error, 'Connection not found or invalid API key')
  })

  test('POST /webhooks/foundry/ping should reject non-existent connectionId', async ({
    assert,
    client,
  }) => {
    const fakeKey = 'ta_' + faker.string.alphanumeric(32)
    const response = await client.post('/webhooks/foundry/ping').json({
      connectionId: faker.string.uuid(),
      apiKey: fakeKey,
    })

    response.assertStatus(404)
    assert.equal(response.body().error, 'Connection not found or invalid API key')
  })
})
