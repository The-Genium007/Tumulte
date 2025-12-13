import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'poll_results'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Ajouter un champ pour tracer qui a annulé le sondage
      table.uuid('cancelled_by').nullable().references('id').inTable('users').onDelete('SET NULL')

      // Ajouter un champ pour distinguer FAILED (échec) de CANCELLED (annulé manuellement)
      table.timestamp('cancelled_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cancelled_by')
      table.dropColumn('cancelled_at')
    })
  }
}
