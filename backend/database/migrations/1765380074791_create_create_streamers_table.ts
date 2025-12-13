import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streamers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('twitch_user_id').notNullable().unique()
      table.string('twitch_login').notNullable()
      table.string('twitch_display_name').notNullable()
      table.text('access_token_encrypted').notNullable()
      table.text('refresh_token_encrypted').notNullable()
      table.jsonb('scopes').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
