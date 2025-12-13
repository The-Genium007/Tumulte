import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'poll_instances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table
        .uuid('template_id')
        .nullable()
        .references('id')
        .inTable('poll_templates')
        .onDelete('SET NULL')
      table.string('title').notNullable()
      table.jsonb('options').notNullable()
      table.integer('duration_seconds').notNullable()
      table.enum('status', ['PENDING', 'RUNNING', 'ENDED']).notNullable().defaultTo('PENDING')
      table.timestamp('started_at', { useTz: true }).nullable()
      table.timestamp('ended_at', { useTz: true }).nullable()
      table.uuid('created_by').notNullable().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
