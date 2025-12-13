import { ref, readonly, onUnmounted } from "vue";
import { Transmit } from "@adonisjs/transmit-client";
import type { PollStartEvent, PollUpdateEvent, PollEndEvent } from "@/types";

interface StreamerLeftCampaignEvent {
  campaign_id: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export const useWebSocket = () => {
  const transmit = ref<Transmit | null>(null);
  const connected = ref(false);

  /**
   * Initialise la connexion WebSocket
   */
  const connect = (): void => {
    if (transmit.value) {
      return;
    }

    transmit.value = new Transmit({
      baseUrl: API_URL,
    });

    connected.value = true;
  };

  /**
   * S'abonne à un canal de sondage
   */
  const subscribeToPoll = (
    pollInstanceId: string,
    callbacks: {
      onStart?: (data: PollStartEvent) => void;
      onUpdate?: (data: PollUpdateEvent) => void;
      onEnd?: (data: PollEndEvent) => void;
    },
  ): (() => void) => {
    if (!transmit.value) {
      connect();
    }

    const channel = `poll:${pollInstanceId}`;
    const subscription = transmit.value!.subscription(channel);

    // S'abonner au canal
    subscription.create();

    // Écouter les événements
    if (callbacks.onStart) {
      subscription.onMessage((message: any) => {
        if (message.event === "poll:start" && callbacks.onStart) {
          callbacks.onStart(message.data);
        }
      });
    }

    if (callbacks.onUpdate) {
      subscription.onMessage((message: any) => {
        if (message.event === "poll:update" && callbacks.onUpdate) {
          callbacks.onUpdate(message.data);
        }
      });
    }

    if (callbacks.onEnd) {
      subscription.onMessage((message: any) => {
        if (message.event === "poll:end" && callbacks.onEnd) {
          callbacks.onEnd(message.data);
        }
      });
    }

    // Retourner une fonction de nettoyage
    return () => {
      subscription.delete();
    };
  };

  /**
   * S'abonne au canal spécifique d'un streamer pour recevoir les événements de polls
   */
  const subscribeToStreamerPolls = (
    streamerId: string,
    callbacks: {
      onStart?: (data: PollStartEvent & { campaign_id?: string }) => void;
      onUpdate?: (data: PollUpdateEvent) => void;
      onEnd?: (data: PollEndEvent & { campaign_id?: string }) => void;
      onLeftCampaign?: (data: StreamerLeftCampaignEvent) => void;
    },
  ): (() => void) => {
    if (!transmit.value) {
      connect();
    }

    const channel = `streamer:${streamerId}:polls`;
    const subscription = transmit.value!.subscription(channel);

    // S'abonner au canal
    subscription.create();

    // Écouter tous les événements avec un seul onMessage
    subscription.onMessage((message: any) => {
      switch (message.event) {
        case "poll:start":
          if (callbacks.onStart) {
            callbacks.onStart(message.data);
          }
          break;
        case "poll:update":
          if (callbacks.onUpdate) {
            callbacks.onUpdate(message.data);
          }
          break;
        case "poll:end":
          if (callbacks.onEnd) {
            callbacks.onEnd(message.data);
          }
          break;
        case "streamer:left-campaign":
          if (callbacks.onLeftCampaign) {
            callbacks.onLeftCampaign(message.data);
          }
          break;
      }
    });

    // Retourner une fonction de nettoyage
    return () => {
      subscription.delete();
    };
  };

  /**
   * Ferme la connexion WebSocket
   */
  const disconnect = (): void => {
    if (transmit.value) {
      transmit.value.close();
      transmit.value = null;
      connected.value = false;
    }
  };

  // Nettoyer à la destruction du composable
  onUnmounted(() => {
    disconnect();
  });

  return {
    connected: readonly(connected),
    connect,
    subscribeToPoll,
    subscribeToStreamerPolls,
    disconnect,
  };
};
