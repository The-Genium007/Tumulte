import { BaseSchema } from '@adonisjs/lucid/schema'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

interface TwitchUserInfo {
  id: string
  login: string
  display_name: string
  broadcaster_type: string
}

/**
 * Migration to fix broadcaster_type for existing streamers
 *
 * This is a retry of migration 1770600000000 with better error handling.
 * The previous migration failed with HTTP 400 due to potential null/empty IDs.
 *
 * This migration:
 * - Filters out null/empty twitch_user_ids before making API calls
 * - Logs detailed error information for debugging
 * - Ensures backward compatibility for accounts created before
 *   the broadcaster_type field was properly populated.
 */
export default class extends BaseSchema {
  async up() {
    // Get all streamers with empty or null broadcaster_type
    const streamersToUpdate = await this.db.rawQuery<{
      rows: Array<{ id: string; twitch_user_id: string; twitch_display_name: string }>
    }>(`
      SELECT id, twitch_user_id, twitch_display_name
      FROM streamers
      WHERE (broadcaster_type IS NULL OR broadcaster_type = '')
        AND twitch_user_id IS NOT NULL
        AND twitch_user_id != ''
    `)

    const streamers = streamersToUpdate.rows
    if (streamers.length === 0) {
      logger.info('[Migration] No streamers need broadcaster_type update')
      return
    }

    logger.info(`[Migration] Found ${streamers.length} streamers to update broadcaster_type`)

    // Get Twitch credentials
    const clientId = env.get('TWITCH_CLIENT_ID')
    const clientSecret = env.get('TWITCH_CLIENT_SECRET')

    if (!clientId || !clientSecret) {
      logger.warn(
        '[Migration] Missing Twitch credentials - skipping broadcaster_type update. ' +
          'Streamers will be updated on their next login.'
      )
      return
    }

    try {
      // Get App Access Token
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      })

      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.text().catch(() => 'Unknown error')
        logger.error(
          `[Migration] Failed to get Twitch app token: ${tokenResponse.status} - ${tokenError}`
        )
        return
      }

      const tokenData = (await tokenResponse.json()) as { access_token: string }
      const accessToken = tokenData.access_token

      logger.info('[Migration] Successfully obtained Twitch app access token')

      // Process streamers in batches of 100 (Twitch API limit)
      const batchSize = 100
      let updatedCount = 0
      let affiliateCount = 0
      let partnerCount = 0
      let skippedCount = 0

      for (let i = 0; i < streamers.length; i += batchSize) {
        const batch = streamers.slice(i, i + batchSize)

        // Filter out any null/empty twitch_user_ids (extra safety)
        const validStreamers = batch.filter(
          (s) => s.twitch_user_id && s.twitch_user_id.trim() !== ''
        )
        const twitchUserIds = validStreamers.map((s) => s.twitch_user_id)

        if (twitchUserIds.length === 0) {
          logger.warn(`[Migration] Batch ${Math.floor(i / batchSize) + 1} has no valid Twitch IDs`)
          skippedCount += batch.length
          continue
        }

        logger.info(
          `[Migration] Processing batch ${Math.floor(i / batchSize) + 1}: ${twitchUserIds.length} users`
        )

        // Fetch user info from Twitch API
        const params = twitchUserIds.map((id) => `id=${encodeURIComponent(id)}`).join('&')
        const url = `https://api.twitch.tv/helix/users?${params}`

        const usersResponse = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': clientId,
          },
        })

        if (!usersResponse.ok) {
          const errorBody = await usersResponse.text().catch(() => 'Unable to read error body')
          logger.error(
            `[Migration] Failed to fetch Twitch users batch ${Math.floor(i / batchSize) + 1}: ` +
              `HTTP ${usersResponse.status} - ${errorBody}`
          )
          skippedCount += validStreamers.length
          continue
        }

        const usersData = (await usersResponse.json()) as { data: TwitchUserInfo[] }

        logger.info(`[Migration] Twitch API returned ${usersData.data.length} users`)

        // Create a map of twitch_user_id -> broadcaster_type
        const broadcasterTypes = new Map(
          usersData.data.map((user) => [user.id, user.broadcaster_type || ''])
        )

        // Update each streamer in this batch
        for (const streamer of validStreamers) {
          const broadcasterType = broadcasterTypes.get(streamer.twitch_user_id)

          if (broadcasterType !== undefined) {
            await this.db.rawQuery(`UPDATE streamers SET broadcaster_type = ? WHERE id = ?`, [
              broadcasterType,
              streamer.id,
            ])
            updatedCount++

            if (broadcasterType === 'affiliate') affiliateCount++
            if (broadcasterType === 'partner') partnerCount++

            logger.info(
              `[Migration] Updated ${streamer.twitch_display_name}: broadcaster_type = '${broadcasterType || '(empty)'}'`
            )
          } else {
            // User might have been deleted from Twitch or ID changed
            logger.warn(
              `[Migration] Could not find Twitch user for streamer ${streamer.twitch_display_name} ` +
                `(ID: ${streamer.twitch_user_id})`
            )
            skippedCount++
          }
        }

        // Small delay between batches to respect rate limits
        if (i + batchSize < streamers.length) {
          await new Promise((resolve) => setTimeout(resolve, 100))
        }
      }

      logger.info(
        `[Migration] Completed! Updated: ${updatedCount}/${streamers.length}, ` +
          `Affiliates: ${affiliateCount}, Partners: ${partnerCount}, ` +
          `Non-affiliated: ${updatedCount - affiliateCount - partnerCount}, ` +
          `Skipped: ${skippedCount}`
      )
    } catch (error) {
      logger.error(
        `[Migration] Error updating broadcaster_type: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
          'Streamers will be updated on their next login.'
      )
    }
  }

  async down() {
    // No rollback needed - we're just populating missing data
    logger.info('[Migration] Rollback not needed for broadcaster_type update')
  }
}
