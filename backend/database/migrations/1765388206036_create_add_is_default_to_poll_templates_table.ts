import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'poll_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_default').defaultTo(false).notNullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('is_default')
    })
  }
}
