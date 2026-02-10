import { test } from '@japa/runner'
import { PollLifecycleService } from '#services/polls/poll_lifecycle_service'
import { pollInstance as PollInstance } from '#models/poll_instance'

/**
 * Tests unitaires pour PollLifecycleService
 *
 * Le service orchestre le cycle de vie des polls:
 * - launchPoll: Lance un poll (PENDING → RUNNING)
 * - cancelPoll: Annule un poll (RUNNING → CANCELLED)
 * - endPoll: Termine un poll (RUNNING → ENDED)
 */

function createMockPollInstance(overrides: Partial<PollInstance> = {}): Partial<PollInstance> {
  return {
    id: 'poll-instance-123',
    status: 'PENDING',
    title: 'Test Poll',
    options: ['Option A', 'Option B'],
    durationSeconds: 60,
    ...overrides,
  }
}

function createMockChannelLinkRepository() {
  return {
    completeAllByPollInstance: async () => 0,
    terminateAllByPollInstance: async () => 0,
  }
}

test.group('PollLifecycleService - launchPoll', () => {
  test('should launch a pending poll successfully', async ({ assert }) => {
    // Arrange
    const mockPollInstance = createMockPollInstance({ status: 'PENDING' })
    const updatedPollInstance = { ...mockPollInstance, status: 'RUNNING', startedAt: new Date() }
    let findByIdCallCount = 0

    const mockRepository = {
      findById: async () => {
        findByIdCallCount++
        return findByIdCallCount === 1 ? mockPollInstance : updatedPollInstance
      },
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    let createPollsOnTwitchCalled = false
    const mockCreationService = {
      createPollsOnTwitch: async () => {
        createPollsOnTwitchCalled = true
      },
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    let startPollingCalled = false
    const mockPollingService = {
      startPolling: async () => {
        startPollingCalled = true
      },
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: 'poll-instance-123',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act
    await service.launchPoll('poll-instance-123')

    // Assert
    assert.equal(findByIdCallCount, 2)
    assert.isTrue(createPollsOnTwitchCalled)
    assert.isTrue(startPollingCalled)
  })

  test('should throw error when poll instance not found', async ({ assert }) => {
    const mockRepository = {
      findById: async () => null,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: '',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act & Assert
    await assert.rejects(() => service.launchPoll('non-existent-id'), /Poll instance not found/)
  })

  test('should throw error when poll is not in PENDING status', async ({ assert }) => {
    const mockPollInstance = createMockPollInstance({ status: 'RUNNING' })

    const mockRepository = {
      findById: async () => mockPollInstance,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: '',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act & Assert
    await assert.rejects(
      () => service.launchPoll('poll-instance-123'),
      /Poll cannot be launched from status RUNNING/
    )
  })

  test('should throw error when poll status is ENDED', async ({ assert }) => {
    const mockPollInstance = createMockPollInstance({ status: 'ENDED' })

    const mockRepository = {
      findById: async () => mockPollInstance,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: '',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act & Assert
    await assert.rejects(
      () => service.launchPoll('poll-instance-123'),
      /Poll cannot be launched from status ENDED/
    )
  })
})

test.group('PollLifecycleService - cancelPoll', () => {
  test('should cancel a running poll successfully', async ({ assert }) => {
    // Arrange
    const mockPollInstance = createMockPollInstance({ status: 'RUNNING' })
    const aggregatedVotes = {
      pollInstanceId: 'poll-instance-123',
      votesByOption: { '0': 15, '1': 25 },
      totalVotes: 40,
      percentages: { '0': 37.5, '1': 62.5 },
    }

    let stopPollingCalled = false
    let terminatePollsOnTwitchCalled = false
    let setCancelledCalled = false
    let terminateAllByPollInstanceCalled = false
    let saveFinalResultsCalled = false
    let emitPollEndCalled = false
    let emitPollEndIsCancelled: boolean | null = null

    const mockRepository = {
      findById: async () => mockPollInstance,
      setStarted: async () => {},
      setCancelled: async () => {
        setCancelledCalled = true
      },
      setEnded: async () => {},
      saveFinalResults: async () => {
        saveFinalResultsCalled = true
      },
    }

    const mockChannelLinkRepository = {
      completeAllByPollInstance: async () => 0,
      terminateAllByPollInstance: async () => {
        terminateAllByPollInstanceCalled = true
        return 3 // 3 channel links terminated
      },
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {
        terminatePollsOnTwitchCalled = true
      },
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {
        stopPollingCalled = true
      },
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => aggregatedVotes,
    }

    const mockWebSocketService = {
      emitPollEnd: (_pollId: string, _votes: any, cancelled?: boolean) => {
        emitPollEndCalled = true
        emitPollEndIsCancelled = cancelled ?? null
      },
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      mockChannelLinkRepository as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act
    await service.cancelPoll('poll-instance-123')

    // Assert
    assert.isTrue(stopPollingCalled)
    assert.isTrue(terminatePollsOnTwitchCalled)
    assert.isTrue(setCancelledCalled)
    assert.isTrue(terminateAllByPollInstanceCalled)
    assert.isTrue(saveFinalResultsCalled)
    assert.isTrue(emitPollEndCalled)
    assert.isTrue(emitPollEndIsCancelled) // cancelled flag should be true
  })

  test('should throw error when poll instance not found', async ({ assert }) => {
    const mockRepository = {
      findById: async () => null,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: '',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act & Assert
    await assert.rejects(() => service.cancelPoll('non-existent-id'), /Poll instance not found/)
  })

  test('should throw error when poll is not in RUNNING status', async ({ assert }) => {
    const mockPollInstance = createMockPollInstance({ status: 'PENDING' })

    const mockRepository = {
      findById: async () => mockPollInstance,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: '',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act & Assert
    await assert.rejects(
      () => service.cancelPoll('poll-instance-123'),
      /Poll cannot be cancelled from status PENDING/
    )
  })

  test('should throw error when poll status is ENDED', async ({ assert }) => {
    const mockPollInstance = createMockPollInstance({ status: 'ENDED' })

    const mockRepository = {
      findById: async () => mockPollInstance,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: '',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act & Assert
    await assert.rejects(
      () => service.cancelPoll('poll-instance-123'),
      /Poll cannot be cancelled from status ENDED/
    )
  })

  test('should throw error when poll status is CANCELLED', async ({ assert }) => {
    const mockPollInstance = createMockPollInstance({ status: 'CANCELLED' })

    const mockRepository = {
      findById: async () => mockPollInstance,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: '',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act & Assert
    await assert.rejects(
      () => service.cancelPoll('poll-instance-123'),
      /Poll cannot be cancelled from status CANCELLED/
    )
  })

  test('should send cancellation message and save final results', async ({ assert }) => {
    const mockPollInstance = createMockPollInstance({ status: 'RUNNING' })
    const aggregatedVotes = {
      pollInstanceId: 'poll-instance-123',
      votesByOption: { '0': 10, '1': 20, '2': 5 },
      totalVotes: 35,
      percentages: { '0': 28.6, '1': 57.1, '2': 14.3 },
    }

    let sendCancellationMessageCalled = false
    let saveFinalResultsCalledWith: any = null

    const mockRepository = {
      findById: async () => mockPollInstance,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async (pollId: string, totalVotes: number, votesByOption: any) => {
        saveFinalResultsCalledWith = { pollId, totalVotes, votesByOption }
      },
    }

    const mockChannelLinkRepository = {
      completeAllByPollInstance: async () => 0,
      terminateAllByPollInstance: async () => 2,
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {
        sendCancellationMessageCalled = true
      },
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => aggregatedVotes,
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      mockChannelLinkRepository as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act
    await service.cancelPoll('poll-instance-123')

    // Assert
    assert.isTrue(sendCancellationMessageCalled)
    assert.isNotNull(saveFinalResultsCalledWith)
    assert.equal(saveFinalResultsCalledWith.pollId, 'poll-instance-123')
    assert.equal(saveFinalResultsCalledWith.totalVotes, 35)
    assert.deepEqual(saveFinalResultsCalledWith.votesByOption, { '0': 10, '1': 20, '2': 5 })
  })
})

test.group('PollLifecycleService - endPoll', () => {
  test('should end a poll and announce results', async ({ assert }) => {
    const mockPollInstance = createMockPollInstance({ status: 'RUNNING' }) as PollInstance
    const aggregatedVotes = {
      pollInstanceId: 'poll-instance-123',
      votesByOption: { '0': 20, '1': 30 },
      totalVotes: 50,
      percentages: { '0': 40, '1': 60 },
    }

    let setEndedCalled = false
    let saveFinalResultsCalled = false
    let emitPollEndCalled = false
    let announceResultsCalled = false
    let announceResultsCancelled: boolean | null = null

    const mockRepository = {
      findById: async () => mockPollInstance,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {
        setEndedCalled = true
      },
      saveFinalResults: async () => {
        saveFinalResultsCalled = true
      },
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async () => {},
    }

    let stopPollingCalled = false
    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {
        stopPollingCalled = true
      },
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => aggregatedVotes,
    }

    const mockWebSocketService = {
      emitPollEnd: () => {
        emitPollEndCalled = true
      },
    }

    const mockAnnouncementService = {
      announceResults: async (_instance: any, _votes: any, cancelled: boolean) => {
        announceResultsCalled = true
        announceResultsCancelled = cancelled
      },
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act
    await service.endPoll(mockPollInstance)

    // Assert
    assert.isTrue(stopPollingCalled)
    assert.isTrue(setEndedCalled)
    assert.isTrue(saveFinalResultsCalled)
    assert.isTrue(emitPollEndCalled)
    assert.isTrue(announceResultsCalled)
    assert.isFalse(announceResultsCancelled) // cancelled parameter should be false
  })
})

test.group('PollLifecycleService - removeStreamerFromCampaign', () => {
  test('should delegate to poll creation service', async ({ assert }) => {
    let removeStreamerCalled = false
    let calledStreamerId = ''
    let calledCampaignId = ''

    const mockRepository = {
      findById: async () => null,
      setStarted: async () => {},
      setCancelled: async () => {},
      setEnded: async () => {},
      saveFinalResults: async () => {},
    }

    const mockCreationService = {
      createPollsOnTwitch: async () => {},
      terminatePollsOnTwitch: async () => {},
      removeStreamerFromCampaignPolls: async (streamerId: string, campaignId: string) => {
        removeStreamerCalled = true
        calledStreamerId = streamerId
        calledCampaignId = campaignId
      },
    }

    const mockPollingService = {
      startPolling: async () => {},
      stopPolling: () => {},
      sendCancellationMessage: async () => {},
      setAggregationService: () => {},
      setOnPollEndCallback: () => {},
    }

    const mockAggregationService = {
      getAggregatedVotes: async () => ({
        pollInstanceId: '',
        votesByOption: {},
        totalVotes: 0,
        percentages: {},
      }),
    }

    const mockWebSocketService = {
      emitPollEnd: () => {},
    }

    const mockAnnouncementService = {
      announceResults: async () => {},
    }

    const service = new PollLifecycleService(
      mockRepository as any,
      createMockChannelLinkRepository() as any,
      mockCreationService as any,
      mockPollingService as any,
      mockAggregationService as any,
      mockWebSocketService as any,
      mockAnnouncementService as any
    )

    // Act
    await service.removeStreamerFromCampaign('streamer-123', 'campaign-456')

    // Assert
    assert.isTrue(removeStreamerCalled)
    assert.equal(calledStreamerId, 'streamer-123')
    assert.equal(calledCampaignId, 'campaign-456')
  })
})
