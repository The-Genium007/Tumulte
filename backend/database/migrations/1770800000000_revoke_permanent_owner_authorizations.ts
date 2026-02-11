import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Migration to revoke permanent poll authorizations for campaign owners.
 *
 * Previously, campaign owners were given a 100-year authorization when creating a campaign.
 * This migration revokes those permanent authorizations so that owners must now activate
 * a 12-hour authorization like regular streamers.
 *
 * Impact:
 * - All owners with authorization expiring > 1 year from now will have their auth revoked
 * - They will need to reactivate their 12h authorization via the streamer dashboard
 * - Regular streamers with normal 12h authorizations are unaffected
 */
export default class extends BaseSchema {
  async up() {
    // Identify owner memberships with permanent authorization (100 years = > 1 year from now)
    // and revoke their authorization so they must reactivate manually
    await this.db.rawQuery(`
      UPDATE campaign_memberships cm
      SET
        poll_authorization_granted_at = NULL,
        poll_authorization_expires_at = NULL
      FROM campaigns c, streamers s, users u
      WHERE cm.campaign_id = c.id
        AND cm.streamer_id = s.id
        AND s.user_id = u.id
        AND u.id = c.owner_id
        AND cm.poll_authorization_expires_at > NOW() + INTERVAL '1 year'
    `)
  }

  async down() {
    // No automatic rollback - owners will need to reactivate manually
    // This is intentional as we cannot distinguish which owners had permanent auth
  }
}
