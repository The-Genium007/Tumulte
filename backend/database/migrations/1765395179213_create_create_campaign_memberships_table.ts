import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaign_memberships'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table
        .uuid('campaign_id')
        .notNullable()
        .references('id')
        .inTable('campaigns')
        .onDelete('CASCADE')
      table
        .uuid('streamer_id')
        .notNullable()
        .references('id')
        .inTable('streamers')
        .onDelete('CASCADE')
      table.enum('status', ['PENDING', 'ACTIVE']).defaultTo('PENDING').notNullable()
      table.timestamp('invited_at', { useTz: true }).notNullable()
      table.timestamp('accepted_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      table.unique(['campaign_id', 'streamer_id'])
      table.index(['campaign_id', 'status'])
      table.index(['streamer_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
