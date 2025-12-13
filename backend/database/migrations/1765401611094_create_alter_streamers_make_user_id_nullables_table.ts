import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'streamers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Rendre user_id nullable pour permettre la création de streamers avant connexion OAuth
      table.uuid('user_id').nullable().alter()

      // Rendre les tokens nullable aussi car un streamer peut ne pas avoir de tokens au début
      table.text('access_token_encrypted').nullable().alter()
      table.text('refresh_token_encrypted').nullable().alter()
      table.jsonb('scopes').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Revenir à not null (attention: peut échouer s'il y a des données null)
      table.uuid('user_id').notNullable().alter()
      table.text('access_token_encrypted').notNullable().alter()
      table.text('refresh_token_encrypted').notNullable().alter()
      table.jsonb('scopes').notNullable().alter()
    })
  }
}
