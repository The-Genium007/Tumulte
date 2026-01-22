import hash from '@adonisjs/core/services/hash'
import logger from '@adonisjs/core/services/logger'
import User from '#models/user'
import emailVerificationService from './email_verification_service.js'

/**
 * Service for email/password authentication
 *
 * Handles:
 * - User registration with email/password
 * - Login validation
 * - Password changes
 */
class EmailAuthService {
  /**
   * Register a new user with email and password
   */
  async register(data: {
    email: string
    password: string
    displayName: string
  }): Promise<{ user: User; error?: never } | { user?: never; error: string }> {
    const normalizedEmail = data.email.toLowerCase().trim()

    // Check if email already exists
    const existingUser = await User.query().where('email', normalizedEmail).first()

    if (existingUser) {
      // If user exists but has no password, they registered via OAuth
      // They can set a password to enable email login
      if (!existingUser.password) {
        return {
          error:
            'Un compte existe déjà avec cet email (connecté via Google ou Twitch). Connectez-vous avec ce provider pour ajouter un mot de passe.',
        }
      }
      return { error: 'Un compte existe déjà avec cet email.' }
    }

    // Create user with hashed password
    const user = await User.create({
      email: normalizedEmail,
      password: await hash.make(data.password),
      displayName: data.displayName.trim(),
      tier: 'free',
    })

    // Send verification email
    try {
      await emailVerificationService.sendVerificationEmail(user)
    } catch (error) {
      logger.error({ userId: user.id, error }, 'Failed to send verification email on registration')
      // Don't fail registration if email fails - user can resend
    }

    logger.info({ userId: user.id, email: user.email }, 'New user registered via email')
    return { user }
  }

  /**
   * Validate login credentials
   * Returns user if valid, null otherwise
   */
  async validateCredentials(
    email: string,
    password: string
  ): Promise<{ user: User; error?: never } | { user?: never; error: string }> {
    const normalizedEmail = email.toLowerCase().trim()

    const user = await User.query().where('email', normalizedEmail).first()

    if (!user) {
      return { error: 'Email ou mot de passe incorrect.' }
    }

    // User registered via OAuth only (no password)
    if (!user.password) {
      return {
        error:
          'Ce compte a été créé via Google ou Twitch. Utilisez ce provider pour vous connecter.',
      }
    }

    // Verify password
    const isValid = await hash.verify(user.password, password)
    if (!isValid) {
      return { error: 'Email ou mot de passe incorrect.' }
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return { error: 'Veuillez vérifier votre email avant de vous connecter.' }
    }

    logger.info({ userId: user.id }, 'User logged in via email')
    return { user }
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(
    user: User,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    // If user has a password, verify current password
    if (user.password) {
      const isValid = await hash.verify(user.password, currentPassword)
      if (!isValid) {
        return { success: false, error: 'Mot de passe actuel incorrect.' }
      }
    }

    // Hash and save new password
    user.password = await hash.make(newPassword)
    await user.save()

    logger.info({ userId: user.id }, 'Password changed successfully')
    return { success: true }
  }

  /**
   * Set password for OAuth-only user
   * Allows users who registered via OAuth to add a password
   */
  async setPassword(
    user: User,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    if (user.password) {
      return {
        success: false,
        error: 'Ce compte a déjà un mot de passe. Utilisez "Changer le mot de passe".',
      }
    }

    user.password = await hash.make(newPassword)
    await user.save()

    logger.info({ userId: user.id }, 'Password set for OAuth user')
    return { success: true }
  }
}

export default new EmailAuthService()
