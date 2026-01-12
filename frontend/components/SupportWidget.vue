<template>
  <!-- Alertes feedback (toujours en bas à droite) -->
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
    <UAlert
      v-if="feedback.type === 'success'"
      icon="i-lucide-check-circle-2"
      color="success"
      variant="soft"
      :description="feedback.message"
      class="max-w-sm shadow-xl"
      @close="feedback = { type: '', message: '' }"
      closable
    />

    <UAlert
      v-if="feedback.type === 'error'"
      icon="i-lucide-alert-triangle"
      color="error"
      variant="soft"
      :description="feedback.message"
      class="max-w-sm shadow-xl"
      @close="feedback = { type: '', message: '' }"
      closable
    />
  </div>

  <!-- Modal Support (pleine page sur mobile, card sur desktop) -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="closeSupport"
        />

        <!-- Card -->
        <UCard
          class="relative w-full sm:w-lg sm:max-w-[95vw] max-h-dvh sm:max-h-[90vh] overflow-y-auto bg-elevated border border-default shadow-2xl rounded-t-2xl sm:rounded-2xl"
        >
          <div class="space-y-4">
            <header>
              <h2 class="text-xl font-semibold">{{ modalTitle }}</h2>
              <p class="text-sm text-muted mt-1">
                Envoi automatique vers les salons Discord de tickets.
              </p>
              <div v-if="actionTypeLabel" class="mt-2">
                <UBadge color="warning" variant="soft" size="sm">
                  <UIcon name="i-lucide-alert-circle" class="mr-1 size-3" />
                  {{ actionTypeLabel }}
                </UBadge>
              </div>
            </header>

            <div class="space-y-3">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-secondary">
                  Décris le problème <span class="text-error-400">*</span>
                </label>
                <UTextarea
                  v-model="description"
                  :rows="6"
                  placeholder="Ce qui s'est passé, étapes pour reproduire..."
                  class="w-full"
                  :ui="{
                    root: 'ring-0 border-0 rounded-lg overflow-hidden',
                    base: 'px-3.5 py-2.5 bg-primary-100 text-primary-500 placeholder:text-primary-400 rounded-lg',
                  }"
                />
              </div>

              <div class="space-y-1">
                <UCheckbox
                  v-model="includeDiagnostics"
                  label="Joindre automatiquement les logs et métadonnées"
                />
                <p class="text-xs text-muted pl-8">
                  Logs front, erreurs JS, snapshot de store, contexte navigateur, compte connecté et traces côté backend.
                </p>
              </div>

              <div class="rounded-2xl border border-default bg-muted p-4 space-y-3">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-clipboard-list" class="text-brand-500 size-5" />
                  <p class="text-sm font-semibold">Ce qui sera envoyé</p>
                </div>
                <ul class="space-y-2 text-sm text-secondary">
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-dot" class="text-brand-500 mt-1 shrink-0" />
                    <span>Métadonnées navigateur (URL, UA, locale, viewport, timezone) + session {{ sessionId }}</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-dot" class="text-brand-500 mt-1 shrink-0" />
                    <span>Contexte utilisateur (id, rôle, email, streamer éventuel) + compte connecté : {{ userLabel }}</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-dot" class="text-brand-500 mt-1 shrink-0" />
                    <span>Snapshot store (auth + contrôles de sondage) et performances récentes</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-dot" class="text-brand-500 mt-1 shrink-0" />
                    <span>Derniers logs console et erreurs JS tamponnés (50/20 max)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-dot" class="text-brand-500 mt-1 shrink-0" />
                    <span>Contexte backend (IP, méthode, env, campagnes/membres liés à ton compte)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <span class="text-xs text-muted order-2 sm:order-1 text-center sm:text-left">
                Les tokens/mots de passe ne sont jamais inclus.
              </span>
              <div class="flex gap-2 order-1 sm:order-2">
                <UButton
                  color="neutral"
                  variant="ghost"
                  label="Annuler"
                  class="flex-1 sm:flex-none"
                  @click="closeSupport"
                  :disabled="isSending"
                />
                <UButton
                  color="primary"
                  :loading="isSending"
                  :disabled="!canSend"
                  icon="i-lucide-send"
                  label="Envoyer"
                  class="flex-1 sm:flex-none"
                  @click="handleSend"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSupportReporter } from "@/composables/useSupportReporter";
import { useSupportWidget } from "@/composables/useSupportWidget";
import { getSupportSnapshot } from "@/utils/supportTelemetry";
import { ACTION_TYPE_LABELS } from "@/utils/supportErrorMessages";

const authStore = useAuthStore();
const { sendSupportReport } = useSupportReporter();
const {
  isSupportWidgetOpen: open,
  prefillMessage,
  prefillActionType,
  closeSupport,
} = useSupportWidget();
const router = useRouter();
const description = ref("");
const includeDiagnostics = ref(true);
const isSending = ref(false);
const feedback = ref<{ type: "success" | "error" | ""; message: string }>({
  type: "",
  message: "",
});

// Titre dynamique selon si c'est une erreur auto-détectée ou non
const modalTitle = computed(() =>
  prefillActionType.value ? "Signaler une erreur" : "Déclarer un bug"
);

// Label du badge pour le type d'erreur
const actionTypeLabel = computed(() =>
  prefillActionType.value ? ACTION_TYPE_LABELS[prefillActionType.value] : null
);

const sessionId = computed(() => getSupportSnapshot().sessionId || "n/a");
const userLabel = computed(() => {
  if (authStore.user?.displayName) return authStore.user.displayName;
  if (authStore.user?.streamer?.twitchDisplayName) {
    return authStore.user.streamer.twitchDisplayName;
  }
  return "Inconnu";
});

const canSend = computed(() => description.value.trim().length > 5 && !isSending.value);

onMounted(async () => {
  if (!authStore.user) {
    try {
      await authStore.fetchMe();
    } catch {
      // ignore, l'appel renverra 401 si non connecté
    }
  }
});

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    // Refermer si on change de page
    closeSupport();
  },
);

// Watch pour remplir la description quand un prefill arrive
watch(
  prefillMessage,
  (newMessage) => {
    if (newMessage) {
      description.value = newMessage;
    }
  },
  { immediate: true },
);

const handleSend = async () => {
  if (!canSend.value) return;

  isSending.value = true;
  feedback.value = { type: "", message: "" };

  try {
    await sendSupportReport(description.value, { includeDiagnostics: includeDiagnostics.value });
    feedback.value = { type: "success", message: "Ticket envoyé sur Discord." };
    description.value = "";
    closeSupport();
  } catch (error: unknown) {
    feedback.value = {
      type: "error",
      message: (error as Error)?.message || "Envoi impossible pour le moment.",
    };
  } finally {
    isSending.value = false;
  }
};
</script>
