import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Streamer from '#models/streamer'
import TwitchApiService from '#services/twitch_api_service'

export default class UpdateStreamerImages extends BaseCommand {
  static commandName = 'streamers:update-images'
  static description = 'Récupère les images de profil des streamers depuis Twitch'

  static options: CommandOptions = {}

  async run() {
    const streamers = await Streamer.query()
    const twitchApiService = new TwitchApiService()

    this.logger.info(`Mise à jour des images pour ${streamers.length} streamer(s)...`)

    const appAccessToken = await twitchApiService.getAppAccessToken()

    for (const streamer of streamers) {
      try {
        // Récupérer les infos Twitch
        const response = await fetch(
          `https://api.twitch.tv/helix/users?id=${streamer.twitchUserId}`,
          {
            headers: {
              'Authorization': `Bearer ${appAccessToken}`,
              'Client-Id': twitchApiService['clientId'],
            },
          }
        )

        if (!response.ok) {
          this.logger.warning(
            `Impossible de récupérer les infos pour ${streamer.twitchDisplayName}`
          )
          continue
        }

        const data = await response.json()

        if (data.data && data.data.length > 0) {
          const profileImageUrl = data.data[0].profile_image_url
          streamer.profileImageUrl = profileImageUrl
          await streamer.save()
          this.logger.success(`✓ ${streamer.twitchDisplayName}: ${profileImageUrl}`)
        }
      } catch (error) {
        this.logger.error(`Erreur pour ${streamer.twitchDisplayName}: ${error.message}`)
      }
    }

    this.logger.info('Terminé!')
  }
}
