import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Campaign from './campaign.js'
import Poll from './poll.js'

export default class PollSession extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare ownerId: string

  @column()
  declare campaignId: string | null

  @column()
  declare name: string

  @column()
  declare defaultDurationSeconds: number

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

  @hasMany(() => Poll, {
    foreignKey: 'sessionId',
  })
  declare polls: HasMany<typeof Poll>
}
