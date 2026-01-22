import type { HttpContext } from '@adonisjs/core/http'
import { loginValidator } from '#validators/auth/auth_validators'
import emailAuthService from '#services/auth/email_auth_service'
import { formatUserResponse } from '#utils/user_response'

/**
 * Controller for email/password login
 */
export default class LoginController {
  /**
   * Login with email and password
   */
  async handle({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(loginValidator)

    const result = await emailAuthService.validateCredentials(data.email, data.password)

    if (result.error || !result.user) {
      return response.unauthorized({ error: result.error ?? 'Erreur de connexion.' })
    }

    const user = result.user

    // Create session with optional "Remember Me"
    await auth.use('web').login(user, data.rememberMe ?? false)

    return response.ok({
      message: 'Connexion réussie',
      user: await formatUserResponse(user),
    })
  }
}
