import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'poll_results'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      // Lien vers le sondage de la session
      table.uuid('poll_id').notNullable().references('id').inTable('polls').onDelete('CASCADE')

      // Campagne associée
      table
        .uuid('campaign_id')
        .notNullable()
        .references('id')
        .inTable('campaigns')
        .onDelete('CASCADE')

      // Statut du sondage
      table.string('status').notNullable().defaultTo('PENDING') // PENDING, RUNNING, COMPLETED, FAILED

      // Données Twitch (pour chaque streamer)
      table.jsonb('twitch_polls').notNullable().defaultTo('{}') // { streamer_id: { twitch_poll_id, status, votes } }

      // Résultats agrégés
      table.integer('total_votes').notNullable().defaultTo(0)
      table.jsonb('votes_by_option').notNullable().defaultTo('{}') // { "Option 1": 50, "Option 2": 30, ... }

      // Timestamps
      table.timestamp('started_at', { useTz: true }).nullable()
      table.timestamp('ended_at', { useTz: true }).nullable()
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
