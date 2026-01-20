import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaign_memberships'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Nullable: null = use system default overlay
      table
        .uuid('overlay_config_id')
        .nullable()
        .references('id')
        .inTable('overlay_configs')
        .onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('overlay_config_id')
    })
  }
}
