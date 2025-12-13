import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'polls'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('channel_points_enabled').notNullable().defaultTo(false)
      table.integer('channel_points_amount').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('channel_points_enabled')
      table.dropColumn('channel_points_amount')
    })
  }
}
