import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import type { UserRole } from '#models/user'

/**
 * Role middleware is used to restrict access to routes based on user role
 */
export default class RoleMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: {
      role: UserRole
    }
  ) {
    const user = ctx.auth.user

    if (!user) {
      return ctx.response.unauthorized({ error: 'Unauthorized' })
    }

    if (user.role !== options.role) {
      return ctx.response.forbidden({ error: 'Access denied: insufficient permissions' })
    }

    return next()
  }
}
