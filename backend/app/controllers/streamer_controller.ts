import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import TwitchAuthService from '#services/twitch_auth_service'
import jwt from 'jsonwebtoken'

export default class StreamerController {
  private readonly twitchAuthService: TwitchAuthService

  constructor() {
    this.twitchAuthService = new TwitchAuthService()
  }

  /**
   * Génère et retourne l'URL de l'overlay OBS avec le token
   */
  async getOverlayUrl({ auth, response }: HttpContext) {
    const user = auth.user!

    // Charger le streamer associé
    await user.load('streamer')

    if (!user.streamer) {
      return response.notFound({ error: 'Streamer not found' })
    }

    const streamer = user.streamer

    // Générer un token JWT pour l'overlay (valide 1 an)
    const overlayToken = jwt.sign(
      {
        streamer_id: streamer.id,
        twitch_user_id: streamer.twitchUserId,
        type: 'overlay',
      },
      env.get('APP_KEY'),
      {
        expiresIn: '365d',
      }
    )

    // Construire l'URL complète de l'overlay
    const overlayUrl = `${env.get('FRONTEND_URL')}/overlay/${streamer.id}?token=${overlayToken}`

    logger.info(`Overlay URL generated for streamer ${streamer.id}`)

    return response.ok({
      data: {
        overlay_url: overlayUrl,
        streamer_id: streamer.id,
        twitch_display_name: streamer.twitchDisplayName,
      },
    })
  }

  /**
   * Révoque l'accès du streamer et désactive son compte
   */
  async revokeAccess({ auth, response }: HttpContext) {
    const user = auth.user!

    // Charger le streamer associé
    await user.load('streamer')

    if (!user.streamer) {
      return response.notFound({ error: 'Streamer not found' })
    }

    const streamer = user.streamer

    try {
      // Récupérer le token non chiffré
      const accessToken = await streamer.getDecryptedAccessToken()

      // Révoquer le token côté Twitch
      await this.twitchAuthService.revokeToken(accessToken)

      // Désactiver le streamer
      streamer.isActive = false
      await streamer.save()

      logger.info(`Access revoked for streamer ${streamer.id}`)

      return response.ok({
        message: 'Access revoked successfully',
      })
    } catch (error) {
      logger.error(`Failed to revoke access for streamer ${streamer.id}: ${error.message}`)
      return response.internalServerError({
        error: 'Failed to revoke access',
      })
    }
  }
}
