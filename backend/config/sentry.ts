import env from '#start/env'
import * as Sentry from '@sentry/node'

const isEnabled = !!env.get('SENTRY_DSN')
const isProduction = env.get('NODE_ENV') === 'production'

if (isEnabled) {
  Sentry.init({
    dsn: env.get('SENTRY_DSN'),
    environment: env.get('NODE_ENV', 'development'),
    release: `tumulte-backend@${env.get('APP_VERSION', '0.3.0')}`,

    // Performance monitoring (10% en prod pour limiter les coûts)
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Filtrer les erreurs métier (pas des vrais bugs)
    ignoreErrors: [
      'E_UNAUTHORIZED_ACCESS',
      'E_VALIDATION_ERROR',
      'E_ROW_NOT_FOUND',
      'E_ROUTE_NOT_FOUND',
    ],

    // Ne pas envoyer les erreurs 4xx (erreurs client)
    beforeSend(event, hint) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status
        if (status >= 400 && status < 500) {
          return null
        }
      }
      return event
    },
  })
}

export { Sentry }
export const sentryEnabled = isEnabled
