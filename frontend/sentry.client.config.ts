import * as Sentry from "@sentry/nuxt";

// Event bus pour notifier les composants Vue d'une erreur capturée
type SentryEventCallback = () => void;
const sentryEventListeners: SentryEventCallback[] = [];

export const onSentryError = (callback: SentryEventCallback) => {
  sentryEventListeners.push(callback);
  return () => {
    const index = sentryEventListeners.indexOf(callback);
    if (index > -1) sentryEventListeners.splice(index, 1);
  };
};

const notifySentryError = () => {
  sentryEventListeners.forEach((cb) => cb());
};

// Variable pour stocker le sessionId (sera défini par supportTelemetry)
let cachedSessionId: string | null = null;

export const setSentrySessionId = (sessionId: string) => {
  cachedSessionId = sessionId;
  if (sessionId) {
    Sentry.setTag("sessionId", sessionId);
  }
};

// Récupérer le DSN depuis les variables d'environnement injectées au build
// Note: En mode SPA, les variables sont disponibles via import.meta.env
const dsn =
  import.meta.env.VITE_SENTRY_DSN ||
  import.meta.env.NUXT_PUBLIC_SENTRY_DSN ||
  "";
const environment = import.meta.env.MODE || "development";

if (dsn) {
  Sentry.init({
    dsn,
    environment,

    // Performance monitoring (10% en prod)
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Session Replay pour debug visuel
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    integrations: [Sentry.replayIntegration()],

    // Filtrer les erreurs non pertinentes
    ignoreErrors: [
      // Erreurs réseau (pas des bugs)
      "Network request failed",
      "Failed to fetch",
      "NetworkError",
      "Load failed",
      // Erreurs de navigation
      "ResizeObserver loop",
      "ResizeObserver loop limit exceeded",
      // Extensions navigateur
      "chrome-extension://",
      "moz-extension://",
      // Erreurs de chargement de chunks (refresh résout)
      "ChunkLoadError",
      "Loading chunk",
    ],

    beforeSend(event, hint) {
      // Ajouter sessionId pour corrélation avec Discord
      if (cachedSessionId) {
        event.tags = { ...event.tags, sessionId: cachedSessionId };
      }

      // Ne pas envoyer si c'est une erreur filtrée
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignorer les erreurs 4xx (erreurs utilisateur, pas bugs)
        if (error.message.includes("401") || error.message.includes("403")) {
          return null;
        }
      }

      // Notifier l'UI qu'une erreur a été capturée
      notifySentryError();

      return event;
    },
  });
}

export { Sentry };
