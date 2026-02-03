/*
|--------------------------------------------------------------------------
| Schedulers
|--------------------------------------------------------------------------
|
| This file is loaded automatically at application boot to start the
| various schedulers:
| - Token refresh: keeps Twitch tokens fresh
| - Authorization expiry: cleans up expired 12h authorizations
|
*/

import { TokenRefreshScheduler } from '#services/scheduler/token_refresh_scheduler'
import { AuthorizationExpiryScheduler } from '#services/scheduler/authorization_expiry_scheduler'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'

// Only start schedulers in web environment (not during tests or CLI commands)
if (app.getEnvironment() === 'web') {
  const tokenRefreshScheduler = new TokenRefreshScheduler()
  tokenRefreshScheduler.start()

  const authExpiryScheduler = new AuthorizationExpiryScheduler()
  authExpiryScheduler.start()

  // Graceful shutdown
  app.terminating(() => {
    logger.info('[Scheduler] Application terminating, stopping schedulers...')
    tokenRefreshScheduler.stop()
    authExpiryScheduler.stop()
  })
}
