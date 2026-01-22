import type { HttpContext } from '@adonisjs/core/http'
import {
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  setPasswordValidator,
} from '#validators/auth/auth_validators'
import passwordResetService from '#services/auth/password_reset_service'
import emailAuthService from '#services/auth/email_auth_service'

/**
 * Controller for password management
 */
export default class PasswordController {
  /**
   * Request password reset email
   */
  async forgotPassword({ request, response }: HttpContext) {
    const data = await request.validateUsing(forgotPasswordValidator)

    // Always send same response to prevent email enumeration
    await passwordResetService.sendResetEmail(data.email)

    return response.ok({
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    })
  }

  /**
   * Validate reset token (check if it's valid before showing form)
   */
  async validateResetToken({ request, response }: HttpContext) {
    const token = request.input('token')

    if (!token || typeof token !== 'string' || token.length !== 64) {
      return response.badRequest({ valid: false })
    }

    const user = await passwordResetService.validateToken(token)

    return response.ok({ valid: user !== null })
  }

  /**
   * Reset password with token
   */
  async resetPassword({ request, response }: HttpContext) {
    const data = await request.validateUsing(resetPasswordValidator)

    const result = await passwordResetService.resetPassword(data.token, data.password)

    // Token invalid or expired
    if (result === null) {
      return response.badRequest({
        error: 'Le lien de réinitialisation est invalide ou a expiré.',
      })
    }

    // Password validation failed (weak, compromised, etc.)
    if (result.error) {
      return response.badRequest({
        error: result.error,
      })
    }

    return response.ok({
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    })
  }

  /**
   * Change password (authenticated user)
   */
  async changePassword({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(changePasswordValidator)

    const result = await emailAuthService.changePassword(
      user,
      data.currentPassword,
      data.newPassword
    )

    if (!result.success) {
      return response.badRequest({ error: result.error })
    }

    return response.ok({
      message: 'Mot de passe modifié avec succès.',
    })
  }

  /**
   * Set password for OAuth-only user
   */
  async setPassword({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const data = await request.validateUsing(setPasswordValidator)

    const result = await emailAuthService.setPassword(user, data.password)

    if (!result.success) {
      return response.badRequest({ error: result.error })
    }

    return response.ok({
      message: 'Mot de passe défini avec succès.',
    })
  }
}
