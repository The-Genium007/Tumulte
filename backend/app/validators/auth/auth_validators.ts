import vine from '@vinejs/vine'

/**
 * Validator for user registration
 */
export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(8).maxLength(100),
    displayName: vine.string().minLength(2).maxLength(50).trim(),
  })
)

/**
 * Validator for email/password login
 */
export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(1),
    rememberMe: vine.boolean().optional(),
  })
)

/**
 * Validator for forgot password request
 */
export const forgotPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().normalizeEmail(),
  })
)

/**
 * Validator for password reset
 */
export const resetPasswordValidator = vine.compile(
  vine.object({
    token: vine.string().minLength(64).maxLength(64),
    password: vine.string().minLength(8).maxLength(100),
  })
)

/**
 * Validator for email verification
 */
export const verifyEmailValidator = vine.compile(
  vine.object({
    token: vine.string().minLength(64).maxLength(64),
  })
)

/**
 * Validator for password change (authenticated user)
 */
export const changePasswordValidator = vine.compile(
  vine.object({
    currentPassword: vine.string().minLength(1),
    newPassword: vine.string().minLength(8).maxLength(100),
  })
)

/**
 * Validator for setting password (OAuth user adding password)
 */
export const setPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(8).maxLength(100),
  })
)
