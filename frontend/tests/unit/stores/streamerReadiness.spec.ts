import { describe, test, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useStreamerReadinessStore } from "~/stores/streamerReadiness";
import type { CampaignReadiness, ReadinessChangeEvent } from "@/types";

// Helper to create mock readiness data
function createMockReadiness(
  overrides: Partial<CampaignReadiness> = {},
): CampaignReadiness {
  return {
    allReady: false,
    readyCount: 1,
    totalCount: 3,
    streamers: [
      {
        streamerId: "streamer-1",
        displayName: "Streamer One",
        profileImageUrl: "https://example.com/avatar1.png",
        isReady: true,
        issues: [],
      },
      {
        streamerId: "streamer-2",
        displayName: "Streamer Two",
        profileImageUrl: "https://example.com/avatar2.png",
        isReady: false,
        issues: ["not_authorized"],
      },
      {
        streamerId: "streamer-3",
        displayName: "Streamer Three",
        profileImageUrl: "https://example.com/avatar3.png",
        isReady: false,
        issues: ["offline"],
      },
    ],
    ...overrides,
  };
}

describe("Streamer Readiness Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("Initial State", () => {
    test("should initialize with null readiness", () => {
      const store = useStreamerReadinessStore();

      expect(store.readiness).toBeNull();
      expect(store.isLoading).toBe(false);
      expect(store.isModalOpen).toBe(false);
      expect(store.pendingSessionId).toBeNull();
      expect(store.pendingCampaignId).toBeNull();
    });
  });

  describe("Getters", () => {
    test("allReady should return false when readiness is null", () => {
      const store = useStreamerReadinessStore();

      expect(store.allReady).toBe(false);
    });

    test("allReady should return readiness.allReady value", () => {
      const store = useStreamerReadinessStore();
      store.setReadiness(createMockReadiness({ allReady: true }));

      expect(store.allReady).toBe(true);
    });

    test("readyCount should return 0 when readiness is null", () => {
      const store = useStreamerReadinessStore();

      expect(store.readyCount).toBe(0);
    });

    test("readyCount should return correct count", () => {
      const store = useStreamerReadinessStore();
      store.setReadiness(createMockReadiness({ readyCount: 2 }));

      expect(store.readyCount).toBe(2);
    });

    test("totalCount should return 0 when readiness is null", () => {
      const store = useStreamerReadinessStore();

      expect(store.totalCount).toBe(0);
    });

    test("totalCount should return correct count", () => {
      const store = useStreamerReadinessStore();
      store.setReadiness(createMockReadiness({ totalCount: 5 }));

      expect(store.totalCount).toBe(5);
    });

    test("unreadyStreamers should return empty array when readiness is null", () => {
      const store = useStreamerReadinessStore();

      expect(store.unreadyStreamers).toEqual([]);
    });

    test("unreadyStreamers should filter out ready streamers", () => {
      const store = useStreamerReadinessStore();
      store.setReadiness(createMockReadiness());

      expect(store.unreadyStreamers).toHaveLength(2);
      expect(store.unreadyStreamers[0].streamerId).toBe("streamer-2");
      expect(store.unreadyStreamers[1].streamerId).toBe("streamer-3");
    });

    test("readyStreamers should return empty array when readiness is null", () => {
      const store = useStreamerReadinessStore();

      expect(store.readyStreamers).toEqual([]);
    });

    test("readyStreamers should filter out unready streamers", () => {
      const store = useStreamerReadinessStore();
      store.setReadiness(createMockReadiness());

      expect(store.readyStreamers).toHaveLength(1);
      expect(store.readyStreamers[0].streamerId).toBe("streamer-1");
    });

    test("readyPercentage should return 0 when totalCount is 0", () => {
      const store = useStreamerReadinessStore();

      expect(store.readyPercentage).toBe(0);
    });

    test("readyPercentage should calculate correct percentage", () => {
      const store = useStreamerReadinessStore();
      store.setReadiness(createMockReadiness({ readyCount: 2, totalCount: 4 }));

      expect(store.readyPercentage).toBe(50);
    });

    test("readyPercentage should round to nearest integer", () => {
      const store = useStreamerReadinessStore();
      store.setReadiness(createMockReadiness({ readyCount: 1, totalCount: 3 }));

      expect(store.readyPercentage).toBe(33); // 33.33... rounded
    });
  });

  describe("Actions", () => {
    describe("setReadiness", () => {
      test("should set readiness data", () => {
        const store = useStreamerReadinessStore();
        const mockData = createMockReadiness();

        store.setReadiness(mockData);

        expect(store.readiness).toEqual(mockData);
      });
    });

    describe("updateStreamerStatus", () => {
      test("should do nothing when readiness is null", () => {
        const store = useStreamerReadinessStore();
        const event: ReadinessChangeEvent = {
          streamerId: "streamer-1",
          isReady: true,
          campaignId: "campaign-1",
        };

        // Should not throw
        store.updateStreamerStatus(event);

        expect(store.readiness).toBeNull();
      });

      test("should update streamer isReady status", () => {
        const store = useStreamerReadinessStore();
        store.setReadiness(createMockReadiness());

        const event: ReadinessChangeEvent = {
          streamerId: "streamer-2",
          isReady: true,
          campaignId: "campaign-1",
        };

        store.updateStreamerStatus(event);

        const streamer = store.readiness?.streamers.find(
          (s) => s.streamerId === "streamer-2",
        );
        expect(streamer?.isReady).toBe(true);
      });

      test("should clear issues when streamer becomes ready", () => {
        const store = useStreamerReadinessStore();
        store.setReadiness(createMockReadiness());

        const event: ReadinessChangeEvent = {
          streamerId: "streamer-2",
          isReady: true,
          campaignId: "campaign-1",
        };

        store.updateStreamerStatus(event);

        const streamer = store.readiness?.streamers.find(
          (s) => s.streamerId === "streamer-2",
        );
        expect(streamer?.issues).toEqual([]);
      });

      test("should recalculate readyCount after status update", () => {
        const store = useStreamerReadinessStore();
        store.setReadiness(createMockReadiness());

        expect(store.readiness?.readyCount).toBe(1);

        store.updateStreamerStatus({
          streamerId: "streamer-2",
          isReady: true,
          campaignId: "campaign-1",
        });

        expect(store.readiness?.readyCount).toBe(2);
      });

      test("should update allReady when all streamers become ready", () => {
        const store = useStreamerReadinessStore();
        store.setReadiness(createMockReadiness());

        expect(store.readiness?.allReady).toBe(false);

        store.updateStreamerStatus({
          streamerId: "streamer-2",
          isReady: true,
          campaignId: "campaign-1",
        });
        store.updateStreamerStatus({
          streamerId: "streamer-3",
          isReady: true,
          campaignId: "campaign-1",
        });

        expect(store.readiness?.allReady).toBe(true);
      });

      test("should not update if streamer not found", () => {
        const store = useStreamerReadinessStore();
        store.setReadiness(createMockReadiness());

        store.updateStreamerStatus({
          streamerId: "unknown-streamer",
          isReady: true,
          campaignId: "campaign-1",
        });

        // Should remain unchanged
        expect(store.readiness?.readyCount).toBe(1);
      });
    });

    describe("openModal", () => {
      test("should open modal with correct data", () => {
        const store = useStreamerReadinessStore();
        const mockData = createMockReadiness();

        store.openModal("campaign-123", "session-456", mockData);

        expect(store.pendingCampaignId).toBe("campaign-123");
        expect(store.pendingSessionId).toBe("session-456");
        expect(store.readiness).toEqual(mockData);
        expect(store.isModalOpen).toBe(true);
      });
    });

    describe("closeModal", () => {
      test("should close modal and reset state", () => {
        const store = useStreamerReadinessStore();
        store.openModal("campaign-123", "session-456", createMockReadiness());

        store.closeModal();

        expect(store.isModalOpen).toBe(false);
        expect(store.pendingSessionId).toBeNull();
        expect(store.pendingCampaignId).toBeNull();
        expect(store.readiness).toBeNull();
      });
    });

    describe("setLoading", () => {
      test("should set loading to true", () => {
        const store = useStreamerReadinessStore();

        store.setLoading(true);

        expect(store.isLoading).toBe(true);
      });

      test("should set loading to false", () => {
        const store = useStreamerReadinessStore();
        store.setLoading(true);

        store.setLoading(false);

        expect(store.isLoading).toBe(false);
      });
    });

    describe("reset", () => {
      test("should reset all state to initial values", () => {
        const store = useStreamerReadinessStore();

        // Set some state
        store.openModal("campaign-123", "session-456", createMockReadiness());
        store.setLoading(true);

        // Reset
        store.reset();

        expect(store.readiness).toBeNull();
        expect(store.isLoading).toBe(false);
        expect(store.isModalOpen).toBe(false);
        expect(store.pendingSessionId).toBeNull();
        expect(store.pendingCampaignId).toBeNull();
      });
    });
  });
});
