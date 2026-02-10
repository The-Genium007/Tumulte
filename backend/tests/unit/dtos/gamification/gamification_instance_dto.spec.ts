import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { GamificationInstanceDto } from '#dtos/gamification/gamification_instance_dto'
import type GamificationInstance from '#models/gamification_instance'
import type GamificationEvent from '#models/gamification_event'

/**
 * Unit tests for GamificationInstanceDto
 *
 * Focuses on the fromModel() serialization, especially the armedAt/isArmed
 * fields added for the armed status display in the MJ campaign UI.
 */

function createMockEvent(overrides: Partial<GamificationEvent> = {}): Partial<GamificationEvent> {
  return {
    id: 'event-123',
    slug: 'dice_critical',
    name: 'Dé Critique',
    type: 'individual',
    triggerType: 'dice_critical',
    actionType: 'dice_invert',
    rewardColor: '#FF0000',
    ...overrides,
  }
}

function createMockInstance(
  overrides: Partial<GamificationInstance> = {}
): Partial<GamificationInstance> {
  const now = DateTime.now()
  return {
    id: 'instance-456',
    campaignId: 'campaign-123',
    eventId: 'event-123',
    type: 'individual',
    status: 'active',
    triggerData: null,
    objectiveTarget: 50,
    currentProgress: 25,
    duration: 300,
    startsAt: now,
    expiresAt: now.plus({ minutes: 5 }),
    completedAt: null,
    resultData: null,
    cooldownEndsAt: null,
    streamerId: 'streamer-123',
    viewerCountAtStart: 100,
    streamerSnapshots: null,
    armedAt: null,
    createdAt: now,
    updatedAt: now,
    event: createMockEvent() as any,
    get isActive() {
      return this.status === 'active'
    },
    get isArmed() {
      return this.status === 'armed'
    },
    get isObjectiveReached() {
      return (this.currentProgress ?? 0) >= (this.objectiveTarget ?? 0)
    },
    get progressPercentage() {
      if (!this.objectiveTarget) return 100
      return Math.min(100, Math.round(((this.currentProgress ?? 0) / this.objectiveTarget) * 100))
    },
    get remainingSeconds() {
      if (this.status !== 'active') return 0
      return Math.max(
        0,
        Math.round((this.expiresAt as DateTime).diff(DateTime.now(), 'seconds').seconds)
      )
    },
    ...overrides,
  }
}

test.group('GamificationInstanceDto - fromModel', () => {
  test('should serialize active instance with isArmed=false and armedAt=null', async ({
    assert,
  }) => {
    const instance = createMockInstance({ status: 'active', armedAt: null })
    const dto = GamificationInstanceDto.fromModel(instance as GamificationInstance)

    assert.equal(dto.status, 'active')
    assert.isFalse(dto.isArmed)
    assert.isNull(dto.armedAt)
    assert.isTrue(dto.isActive)
  })

  test('should serialize armed instance with isArmed=true and armedAt set', async ({ assert }) => {
    const armedTime = DateTime.now().minus({ minutes: 1 })
    const instance = createMockInstance({
      status: 'armed',
      armedAt: armedTime,
      currentProgress: 50,
      objectiveTarget: 50,
    })

    const dto = GamificationInstanceDto.fromModel(instance as GamificationInstance)

    assert.equal(dto.status, 'armed')
    assert.isTrue(dto.isArmed)
    assert.isNotNull(dto.armedAt)
    assert.equal(dto.armedAt, armedTime.toISO())
  })

  test('should serialize completed instance with isArmed=false', async ({ assert }) => {
    const instance = createMockInstance({
      status: 'completed',
      completedAt: DateTime.now(),
      currentProgress: 50,
      objectiveTarget: 50,
      armedAt: DateTime.now().minus({ minutes: 2 }), // Was armed before completion
    })

    const dto = GamificationInstanceDto.fromModel(instance as GamificationInstance)

    assert.equal(dto.status, 'completed')
    assert.isFalse(dto.isArmed)
    // armedAt is still serialized even after completion (historical data)
    assert.isNotNull(dto.armedAt)
    assert.isNotNull(dto.completedAt)
  })

  test('should include all expected fields in DTO', async ({ assert }) => {
    const instance = createMockInstance()
    const dto = GamificationInstanceDto.fromModel(instance as GamificationInstance)

    // Verify key fields exist
    assert.exists(dto.id)
    assert.exists(dto.campaignId)
    assert.exists(dto.eventId)
    assert.exists(dto.type)
    assert.exists(dto.status)
    assert.exists(dto.objectiveTarget)
    assert.exists(dto.currentProgress)
    assert.exists(dto.progressPercentage)
    assert.exists(dto.duration)
    assert.exists(dto.startsAt)
    assert.exists(dto.expiresAt)
    assert.exists(dto.createdAt)
    assert.exists(dto.updatedAt)
    // Armed-specific fields
    assert.property(dto, 'isArmed')
    assert.property(dto, 'armedAt')
    // Event relation
    assert.isNotNull(dto.event)
    assert.equal(dto.event!.name, 'Dé Critique')
  })

  test('should handle fromModelArray correctly', async ({ assert }) => {
    const instances = [
      createMockInstance({ id: 'inst-1', status: 'active' }),
      createMockInstance({ id: 'inst-2', status: 'armed', armedAt: DateTime.now() }),
      createMockInstance({ id: 'inst-3', status: 'completed' }),
    ]

    const dtos = GamificationInstanceDto.fromModelArray(instances as GamificationInstance[])

    assert.lengthOf(dtos, 3)
    assert.isFalse(dtos[0].isArmed)
    assert.isTrue(dtos[1].isArmed)
    assert.isFalse(dtos[2].isArmed)
  })
})
