import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/auth/auth_validators'
import emailAuthService from '#services/auth/email_auth_service'

/**
 * Controller for user registration
 */
export default class RegisterController {
  /**
   * Register a new user with email and password
   */
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const result = await emailAuthService.register({
      email: data.email,
      password: data.password,
      displayName: data.displayName,
    })

    if (result.error || !result.user) {
      return response.conflict({ error: result.error ?? 'Erreur lors de la création du compte.' })
    }

    const user = result.user

    return response.created({
      message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    })
  }
}
