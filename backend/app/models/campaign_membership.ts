import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Campaign from './campaign.js'
import Streamer from './streamer.js'

type MembershipStatus = 'PENDING' | 'ACTIVE'

export default class CampaignMembership extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare campaignId: string

  @column()
  declare streamerId: string

  @column()
  declare status: MembershipStatus

  @column.dateTime()
  declare invitedAt: DateTime

  @column.dateTime()
  declare acceptedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Campaign, {
    foreignKey: 'campaignId',
  })
  declare campaign: BelongsTo<typeof Campaign>

  @belongsTo(() => Streamer, {
    foreignKey: 'streamerId',
  })
  declare streamer: BelongsTo<typeof Streamer>
}
