import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PollInstance from './poll_instance.js'
import Streamer from './streamer.js'

export type PollChannelLinkStatus = 'CREATED' | 'RUNNING' | 'COMPLETED' | 'TERMINATED'

export default class PollChannelLink extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare pollInstanceId: string

  @column()
  declare streamerId: string

  @column()
  declare twitchPollId: string

  @column()
  declare status: PollChannelLinkStatus

  @column()
  declare totalVotes: number

  @column({
    prepare: (value: Record<string, number>) => JSON.stringify(value),
    consume: (value: string) => JSON.parse(value),
  })
  declare votesByOption: Record<string, number>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => PollInstance, {
    foreignKey: 'pollInstanceId',
  })
  declare pollInstance: BelongsTo<typeof PollInstance>

  @belongsTo(() => Streamer, {
    foreignKey: 'streamerId',
  })
  declare streamer: BelongsTo<typeof Streamer>
}
