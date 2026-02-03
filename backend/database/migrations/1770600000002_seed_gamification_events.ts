import { BaseSchema } from '@adonisjs/lucid/schema'
import logger from '@adonisjs/core/services/logger'

/**
 * Migration to seed gamification events
 *
 * This migration ensures the "Inversion de dé" event exists in the database.
 * It uses ON CONFLICT DO NOTHING to be idempotent and safe for:
 * - Staging: Creates the event if it doesn't exist
 * - Production: Skips if the event already exists (from seeder)
 *
 * This replaces the dependency on manual seeder execution.
 */
export default class extends BaseSchema {
  async up() {
    // Check if event already exists
    const existing = await this.db.rawQuery<{ rows: Array<{ id: string }> }>(`
      SELECT id FROM gamification_events WHERE slug = 'dice-invert' LIMIT 1
    `)

    if (existing.rows.length > 0) {
      logger.info('[Migration] Gamification event "dice-invert" already exists, skipping')
      return
    }

    // Insert the event
    await this.db.rawQuery(`
      INSERT INTO gamification_events (
        id,
        name,
        slug,
        description,
        type,
        trigger_type,
        trigger_config,
        action_type,
        action_config,
        default_cost,
        default_objective_coefficient,
        default_minimum_objective,
        default_duration,
        cooldown_type,
        cooldown_config,
        reward_color,
        is_system_event,
        created_by_id,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        'Inversion de dé',
        'dice-invert',
        'Permet aux viewers de se cotiser pour inverser le résultat d''un jet critique. Une réussite critique devient un échec critique, et vice-versa. Parfait pour créer des retournements de situation dramatiques !',
        'individual',
        'dice_critical',
        '{"criticalSuccess": {"enabled": true, "threshold": 20, "diceType": "d20"}, "criticalFailure": {"enabled": true, "threshold": 1, "diceType": "d20"}}',
        'dice_invert',
        '{"diceInvert": {"trollMessage": "🎭 Le chat a inversé le destin ! C''est leur faute...", "deleteOriginal": true}}',
        100,
        0.3,
        3,
        60,
        'time',
        '{"durationSeconds": 300}',
        '#FF6B6B',
        true,
        NULL,
        NOW(),
        NOW()
      )
    `)

    logger.info('[Migration] Created gamification event "Inversion de dé"')
  }

  async down() {
    // Only delete if it's a system event (to avoid deleting user-created events)
    await this.db.rawQuery(`
      DELETE FROM gamification_events
      WHERE slug = 'dice-invert'
        AND is_system_event = true
    `)

    logger.info('[Migration] Removed gamification event "Inversion de dé"')
  }
}
