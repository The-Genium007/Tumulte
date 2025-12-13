import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'polls'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('session_id')
        .notNullable()
        .references('id')
        .inTable('poll_sessions')
        .onDelete('CASCADE')
      table.string('question').notNullable()
      table.jsonb('options').notNullable()
      table.string('type').notNullable().defaultTo('STANDARD')
      table.integer('order_index').notNullable().defaultTo(0)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
