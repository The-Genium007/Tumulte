import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'

/**
 * Configure Japa test runner plugins
 * - assert: Assertion library
 * - apiClient: HTTP client for functional tests
 * - pluginAdonisJS: AdonisJS integration (database transactions, encryption, etc.)
 */
export const plugins = [
  assert(),
  apiClient(),
  pluginAdonisJS(app, { baseURL: 'http://localhost:3334' }),
]

/**
 * Configure test suites - starts HTTP server for functional and e2e tests
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}

/**
 * Global test runner hooks
 */
export const runnerHooks = {
  setup: [
    async () => {
      // Run migrations to ensure auth_access_tokens table exists
      const ace = await import('@adonisjs/core/services/ace')
      await ace.default.exec('migration:run', [])

      console.log('✅ Test environment initialized')
    },
  ],
  teardown: [
    async () => {
      console.log('✅ Test environment cleaned up')
    },
  ],
}

/**
 * Configure test reporters
 */
export const reporters = {
  activated: ['spec'],
}

/**
 * Configure test suites
 */
export const suites = [
  {
    name: 'unit',
    files: ['tests/unit/**/*.spec.ts'],
    timeout: 5000,
  },
  {
    name: 'functional',
    files: ['tests/functional/**/*.spec.ts'],
    timeout: 30000,
  },
  {
    name: 'e2e',
    files: ['tests/e2e/**/*.spec.ts'],
    timeout: 60000,
  },
]
