import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'poll_sessions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('owner_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('campaign_id').nullable().references('id').inTable('campaigns').onDelete('CASCADE')
      table.string('name').notNullable()
      table.integer('default_duration_seconds').notNullable()

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
