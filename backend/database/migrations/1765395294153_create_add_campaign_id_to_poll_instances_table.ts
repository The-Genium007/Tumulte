import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'poll_instances'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('campaign_id').nullable().references('id').inTable('campaigns').onDelete('CASCADE')
      table.index('campaign_id')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex('campaign_id')
      table.dropColumn('campaign_id')
    })
  }
}
