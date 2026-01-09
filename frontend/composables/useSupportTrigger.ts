import { ref } from "vue";
import { useSupportWidget } from "./useSupportWidget";
import {
  SUPPORT_ERROR_MESSAGES,
  type SupportActionType,
} from "@/utils/supportErrorMessages";

// État global - rate limit 1 ouverture auto par minute
const lastAutoOpenTime = ref<number>(0);
const RATE_LIMIT_MS = 60_000;

/**
 * Types d'erreur à ignorer en mode offline
 * Ces erreurs sont attendues quand l'utilisateur est hors-ligne
 * et ne doivent pas déclencher le support
 */
const OFFLINE_IGNORED_ACTIONS: Set<SupportActionType> = new Set([
  // Lecture de données (fetch passif)
  "campaign_fetch",
  "campaign_fetch_detail",
  "campaign_members_fetch",
  "session_fetch",
  "template_fetch",
  "poll_fetch_results",
  "poll_fetch_live",
  "streamer_invitations_fetch",
  "streamer_campaigns_fetch",
  "authorization_status_fetch",
  "push_subscriptions_fetch",
  "overlay_url_fetch",
  "overlay_campaigns_fetch",
  "overlay_configs_fetch",
  "overlay_config_fetch",
  "auth_fetch_me",

  // Temps réel / WebSocket
  "websocket_connect",
  "websocket_subscribe",
  "websocket_reconnect",
  "websocket_message_parse",
  "overlay_poll_subscribe",

  // Health checks
  "health_check_global",
  "health_check_twitch",
  "health_check_redis",
  "health_check_tokens",

  // Génériques réseau
  "generic_network_error",
  "generic_timeout",

  // Processus de fond automatiques
  "token_refresh_auto",
  "poll_polling_cycle",
  "poll_aggregation",
  "push_notification_send",
]);

export const useSupportTrigger = () => {
  const { openWithPrefill } = useSupportWidget();

  /**
   * Vérifie si on peut ouvrir automatiquement le widget (rate limiting)
   */
  const canAutoOpen = (): boolean => {
    return Date.now() - lastAutoOpenTime.value >= RATE_LIMIT_MS;
  };

  /**
   * Vérifie si l'erreur doit être ignorée en mode offline
   */
  const shouldIgnoreOffline = (actionType: SupportActionType): boolean => {
    if (typeof navigator === "undefined") return false;
    return !navigator.onLine && OFFLINE_IGNORED_ACTIONS.has(actionType);
  };

  /**
   * Déclenche l'ouverture du widget de support avec un message pré-rempli
   * @param actionType - Type d'action qui a échoué
   * @param error - Erreur optionnelle pour contexte additionnel
   * @param additionalContext - Contexte additionnel optionnel
   * @returns true si le widget a été ouvert, false si rate limited ou ignoré offline
   */
  const triggerSupportForError = (
    actionType: SupportActionType,
    error?: Error | unknown,
    additionalContext?: string,
  ): boolean => {
    // Ignorer certaines erreurs en mode offline
    if (shouldIgnoreOffline(actionType)) {
      console.log(`[SupportTrigger] Offline - ignoring ${actionType} error`);
      return false;
    }

    if (!canAutoOpen()) {
      console.log("[SupportTrigger] Rate limited - widget not opened");
      return false;
    }

    lastAutoOpenTime.value = Date.now();

    let message = SUPPORT_ERROR_MESSAGES[actionType];

    // Ajouter le contexte additionnel si fourni
    if (additionalContext) {
      message += `\n\nContexte: ${additionalContext}`;
    }

    // Ajouter le message d'erreur technique si disponible
    if (error instanceof Error && error.message) {
      message += `\n\nErreur technique: ${error.message}`;
    }

    openWithPrefill(message, actionType);
    return true;
  };

  /**
   * Retourne le temps restant avant la prochaine ouverture auto possible (en ms)
   */
  const getRemainingCooldown = (): number => {
    return Math.max(0, RATE_LIMIT_MS - (Date.now() - lastAutoOpenTime.value));
  };

  /**
   * Reset le rate limit (utile pour les tests)
   */
  const resetRateLimit = (): void => {
    lastAutoOpenTime.value = 0;
  };

  return {
    canAutoOpen,
    triggerSupportForError,
    getRemainingCooldown,
    resetRateLimit,
    RATE_LIMIT_MS,
  };
};
