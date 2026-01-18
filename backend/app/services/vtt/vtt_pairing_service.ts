import { inject } from '@adonisjs/core'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'
import VttConnection from '#models/vtt_connection'
import TokenRevocationList from '#models/token_revocation_list'
import env from '#start/env'

export interface SessionTokens {
  sessionToken: string
  refreshToken: string
  expiresIn: number
}

@inject()
export default class VttPairingService {
  private readonly jwtSecret: string
  private readonly sessionTokenExpiry = 3600 // 1 hour in seconds
  private readonly refreshTokenExpiry = 604800 // 7 days in seconds

  constructor() {
    this.jwtSecret = env.get('APP_KEY')
  }

  /**
   * Public method to generate session tokens for a connection
   * Used by the code-based pairing flow
   */
  async generateSessionTokensForConnection(
    connectionId: string,
    userId: string,
    tokenVersion: number
  ): Promise<SessionTokens> {
    return this.generateSessionTokens(connectionId, userId, tokenVersion)
  }

  /**
   * Generate session and refresh tokens for VTT connection
   * Includes tokenVersion to enable instant invalidation of all tokens
   */
  private async generateSessionTokens(
    connectionId: string,
    userId: string,
    tokenVersion: number
  ): Promise<SessionTokens> {
    const now = Math.floor(Date.now() / 1000)

    // Generate JTI (JWT ID) for both tokens
    const sessionJti = randomBytes(16).toString('hex')
    const refreshJti = randomBytes(16).toString('hex')

    // Session token (short-lived) - includes tokenVersion for validation
    /* eslint-disable camelcase -- JWT payload uses snake_case by convention */
    const sessionToken = jwt.sign(
      {
        jti: sessionJti,
        sub: connectionId,
        user_id: userId,
        type: 'session',
        token_version: tokenVersion,
        iat: now,
        exp: now + this.sessionTokenExpiry,
      },
      this.jwtSecret,
      { algorithm: 'HS256' }
    )

    // Refresh token (long-lived) - includes tokenVersion for validation
    const refreshToken = jwt.sign(
      {
        jti: refreshJti,
        sub: connectionId,
        user_id: userId,
        type: 'refresh',
        token_version: tokenVersion,
        iat: now,
        exp: now + this.refreshTokenExpiry,
      },
      this.jwtSecret,
      { algorithm: 'HS256' }
    )
    /* eslint-enable camelcase */

    return {
      sessionToken,
      refreshToken,
      expiresIn: this.sessionTokenExpiry,
    }
  }

  /**
   * Refresh session token using refresh token
   * Validates tokenVersion to ensure token hasn't been invalidated
   */
  async refreshSessionToken(refreshToken: string): Promise<SessionTokens> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtSecret, {
        algorithms: ['HS256'],
      }) as any

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      // Check if revoked via revocation list
      const isRevoked = await TokenRevocationList.isRevoked(decoded.jti)
      if (isRevoked) {
        throw new Error('Refresh token has been revoked')
      }

      // Verify connection still exists and is active
      const connection = await VttConnection.findOrFail(decoded.sub)
      if (connection.status === 'revoked') {
        throw new Error('Connection has been revoked')
      }

      // Validate tokenVersion - if it doesn't match, all tokens are invalidated
      if (decoded.token_version !== connection.tokenVersion) {
        throw new Error('Token has been invalidated')
      }

      // Generate new session token with current tokenVersion
      return await this.generateSessionTokens(
        connection.id,
        decoded.user_id,
        connection.tokenVersion
      )
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error(`Invalid refresh token: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Revoke all tokens for a VTT connection
   * Increments tokenVersion to instantly invalidate all existing tokens
   */
  async revokeConnectionTokens(connectionId: string, _reason: string): Promise<void> {
    const connection = await VttConnection.find(connectionId)

    // Connection may already be deleted - that's fine, nothing to revoke
    if (!connection) {
      return
    }

    // Increment tokenVersion to invalidate all existing tokens instantly
    // This is more efficient than adding all tokens to revocation list
    connection.tokenVersion = (connection.tokenVersion || 1) + 1
    connection.status = 'revoked'
    connection.tunnelStatus = 'disconnected'
    await connection.save()
  }

  /**
   * Invalidate all tokens without revoking the connection
   * Useful for security events like password change or suspicious activity
   */
  async invalidateAllTokens(connectionId: string): Promise<void> {
    const connection = await VttConnection.findOrFail(connectionId)
    connection.tokenVersion = (connection.tokenVersion || 1) + 1
    await connection.save()
  }
}
