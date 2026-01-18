import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'dice_rolls'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Enriched flavor data from FlavorParser
      table.string('skill', 100).nullable() // Normalized skill key (e.g., 'acrobatics', 'perception')
      table.string('skill_raw', 255).nullable() // Raw skill name for display (e.g., 'Acrobatics', 'Perception')
      table.string('ability', 20).nullable() // Normalized ability key (e.g., 'dex', 'str', 'wis')
      table.string('ability_raw', 100).nullable() // Raw ability name for display (e.g., 'Dexterity', 'Force')
      table.specificType('modifiers', 'text[]').nullable() // Array of modifiers (e.g., ['+2', '-1'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('skill')
      table.dropColumn('skill_raw')
      table.dropColumn('ability')
      table.dropColumn('ability_raw')
      table.dropColumn('modifiers')
    })
  }
}
