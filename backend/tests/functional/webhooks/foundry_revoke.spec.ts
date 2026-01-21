import { test } from '@japa/runner'
import testUtils from '#tests/helpers/database'
import {
  createTestUser,
  createTestVttProvider,
  createTestVttConnection,
} from '#tests/helpers/test_utils'
import VttConnection from '#models/vtt_connection'
import { faker } from '@faker-js/faker'

test.group('Foundry Webhook - Revoke', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('POST /webhooks/foundry/revoke should revoke connection with valid credentials', async ({
    assert,
    client,
  }) => {
    const user = await createTestUser()
    const provider = await createTestVttProvider()
    const connection = await createTestVttConnection({
      userId: user.id,
      vttProviderId: provider.id,
      status: 'active',
      tokenVersion: 1,
    })

    const response = await client.post('/webhooks/foundry/revoke').json({
      connectionId: connection.id,
      apiKey: connection.apiKey,
      reason: 'User requested revocation',
    })

    response.assertStatus(200)
    assert.isTrue(response.body().success)
    assert.equal(response.body().message, 'Connection revoked successfully')

    // Verify connection status changed
    const updatedConnection = await VttConnection.findOrFail(connection.id)
    assert.equal(updatedConnection.status, 'revoked')
    assert.equal(updatedConnection.tunnelStatus, 'disconnected')
  })

  test('POST /webhooks/foundry/revoke should increment tokenVersion', async ({
    assert,
    client,
  }) => {
    const user = await createTestUser()
    const provider = await createTestVttProvider()
    const connection = await createTestVttConnection({
      userId: user.id,
      vttProviderId: provider.id,
      status: 'active',
      tokenVersion: 5,
    })

    await client.post('/webhooks/foundry/revoke').json({
      connectionId: connection.id,
      apiKey: connection.apiKey,
      reason: 'Token version test',
    })

    // Verify tokenVersion was incremented
    const updatedConnection = await VttConnection.findOrFail(connection.id)
    assert.equal(updatedConnection.tokenVersion, 6)
  })

  test('POST /webhooks/foundry/revoke should be idempotent for already revoked connection', async ({
    assert,
    client,
  }) => {
    const user = await createTestUser()
    const provider = await createTestVttProvider()
    const connection = await createTestVttConnection({
      userId: user.id,
      vttProviderId: provider.id,
      status: 'revoked', // Already revoked
      tokenVersion: 3,
    })

    const response = await client.post('/webhooks/foundry/revoke').json({
      connectionId: connection.id,
      apiKey: connection.apiKey,
      reason: 'Duplicate revocation',
    })

    response.assertStatus(200)
    assert.isTrue(response.body().success)
    assert.equal(response.body().message, 'Connection already revoked')
  })

  test('POST /webhooks/foundry/revoke should reject missing connectionId', async ({ client }) => {
    const fakeKey = 'ta_' + faker.string.alphanumeric(32)
    const response = await client.post('/webhooks/foundry/revoke').json({
      apiKey: fakeKey,
      reason: 'Test',
    })

    response.assertStatus(400)
    response.assertBodyContains({ error: 'Missing required parameters: connectionId, apiKey' })
  })

  test('POST /webhooks/foundry/revoke should reject missing apiKey', async ({ client }) => {
    const response = await client.post('/webhooks/foundry/revoke').json({
      connectionId: faker.string.uuid(),
      reason: 'Test',
    })

    response.assertStatus(400)
    response.assertBodyContains({ error: 'Missing required parameters: connectionId, apiKey' })
  })

  test('POST /webhooks/foundry/revoke should reject invalid apiKey', async ({ assert, client }) => {
    const user = await createTestUser()
    const provider = await createTestVttProvider()
    const connection = await createTestVttConnection({
      userId: user.id,
      vttProviderId: provider.id,
      status: 'active',
    })

    const wrongKey = 'ta_' + faker.string.alphanumeric(32)
    const response = await client.post('/webhooks/foundry/revoke').json({
      connectionId: connection.id,
      apiKey: wrongKey,
      reason: 'Test',
    })

    response.assertStatus(404)
    assert.equal(response.body().error, 'Connection not found or invalid API key')
  })

  test('POST /webhooks/foundry/revoke should work without reason parameter', async ({
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

    const response = await client.post('/webhooks/foundry/revoke').json({
      connectionId: connection.id,
      apiKey: connection.apiKey,
      // No reason provided - should use default
    })

    response.assertStatus(200)
    assert.isTrue(response.body().success)
  })
})
