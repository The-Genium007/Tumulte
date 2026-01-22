import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

/**
 * Mail configuration for Resend
 *
 * Resend is used for:
 * - Email verification
 * - Password reset
 * - Transactional emails
 */
const mailConfig = defineConfig({
  default: env.get('NODE_ENV') === 'production' ? 'resend' : 'smtp',

  /**
   * Email sender defaults
   */
  from: {
    address: env.get('MAIL_FROM_ADDRESS', 'noreply@tumulte.app'),
    name: env.get('MAIL_FROM_NAME', 'Tumulte'),
  },

  /**
   * Mailers configuration
   */
  mailers: {
    /**
     * Resend mailer (production)
     * https://resend.com
     */
    resend: transports.resend({
      key: env.get('RESEND_API_KEY', ''),
      baseUrl: 'https://api.resend.com',
    }),

    /**
     * SMTP mailer (fallback/development)
     * Can be used with services like Mailhog for local testing
     */
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', 'localhost'),
      port: env.get('SMTP_PORT', '1025'),
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}
