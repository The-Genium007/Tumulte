import { ref, onMounted, onUnmounted } from "vue";

/**
 * Interface pour l'API OBS Browser Source
 * @see https://github.com/obsproject/obs-browser
 */
interface OBSStudioAPI {
  pluginVersion: string;
  addEventListener: (
    event: string,
    callback: (event: CustomEvent) => void,
  ) => void;
  removeEventListener: (
    event: string,
    callback: (event: CustomEvent) => void,
  ) => void;
  getControlLevel: (callback: (level: number) => void) => void;
  getCurrentScene: (
    callback: (scene: { name: string; width: number; height: number }) => void,
  ) => void;
}

declare global {
  interface Window {
    obsstudio?: OBSStudioAPI;
  }
}

/**
 * Composable pour détecter et réagir aux events OBS Browser Source.
 * Permet de savoir quand la source devient visible/active et de récupérer l'état.
 */
export const useOBSEvents = () => {
  const isOBS = ref(false);
  const isSourceVisible = ref(true);
  const isSourceActive = ref(true);
  const pluginVersion = ref<string | null>(null);

  // Callbacks pour les changements de visibilité
  const visibilityCallbacks = new Set<(visible: boolean) => void>();
  const activeCallbacks = new Set<(active: boolean) => void>();

  // Handlers d'events
  const handleVisibilityChange = (event: CustomEvent) => {
    const visible = event.detail?.visible ?? true;
    isSourceVisible.value = visible;

    console.log("[OBS] Source visibility changed:", visible);

    visibilityCallbacks.forEach((callback) => {
      try {
        callback(visible);
      } catch (error) {
        console.error("[OBS] Error in visibility callback:", error);
      }
    });
  };

  const handleActiveChange = (event: CustomEvent) => {
    const active = event.detail?.active ?? true;
    isSourceActive.value = active;

    console.log("[OBS] Source active changed:", active);

    activeCallbacks.forEach((callback) => {
      try {
        callback(active);
      } catch (error) {
        console.error("[OBS] Error in active callback:", error);
      }
    });
  };

  /**
   * Enregistre un callback appelé quand la visibilité de la source change
   */
  const onVisibilityChange = (callback: (visible: boolean) => void) => {
    visibilityCallbacks.add(callback);
    return () => visibilityCallbacks.delete(callback);
  };

  /**
   * Enregistre un callback appelé quand l'état actif de la source change
   */
  const onActiveChange = (callback: (active: boolean) => void) => {
    activeCallbacks.add(callback);
    return () => activeCallbacks.delete(callback);
  };

  /**
   * Vérifie si on est dans un contexte OBS et initialise les listeners
   */
  const initialize = () => {
    if (typeof window !== "undefined" && window.obsstudio) {
      isOBS.value = true;
      pluginVersion.value = window.obsstudio.pluginVersion;

      console.log(
        "[OBS] Detected OBS Browser Source, plugin version:",
        pluginVersion.value,
      );

      // Écouter les changements de visibilité
      window.obsstudio.addEventListener(
        "obsSourceVisibleChanged",
        handleVisibilityChange,
      );
      window.obsstudio.addEventListener(
        "obsSourceActiveChanged",
        handleActiveChange,
      );

      // Récupérer le niveau de contrôle
      window.obsstudio.getControlLevel((level) => {
        console.log("[OBS] Control level:", level);
      });
    } else {
      console.log("[OBS] Not running in OBS Browser Source");
    }
  };

  /**
   * Nettoie les listeners
   */
  const cleanup = () => {
    if (typeof window !== "undefined" && window.obsstudio) {
      window.obsstudio.removeEventListener(
        "obsSourceVisibleChanged",
        handleVisibilityChange,
      );
      window.obsstudio.removeEventListener(
        "obsSourceActiveChanged",
        handleActiveChange,
      );
    }
    visibilityCallbacks.clear();
    activeCallbacks.clear();
  };

  onMounted(() => {
    initialize();
  });

  onUnmounted(() => {
    cleanup();
  });

  return {
    isOBS,
    isSourceVisible,
    isSourceActive,
    pluginVersion,
    onVisibilityChange,
    onActiveChange,
  };
};
