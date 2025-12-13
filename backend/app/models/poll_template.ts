import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Campaign from './campaign.js'

export default class PollTemplate extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare ownerId: string

  @column()
  declare campaignId: string | null

  @column()
  declare label: string

  @column()
  declare title: string

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare options: string[]

  @column()
  declare durationSeconds: number

  @column()
  declare isDefault: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => User, {
    foreignKey: 'ownerId',
  })
  declare owner: BelongsTo<typeof User>

  @belongsTo(() => Campaign, {
    foreignKey: 'campaignId',
  })
  declare campaign: BelongsTo<typeof Campaign>
}
