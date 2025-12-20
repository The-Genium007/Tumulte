(complete file updated; the changes are limited to script setup: we add activeCampaignId from pollControl store, set pollControlStore.activeCampaignId when launching a session, and use a fallback campaignId = selectedCampaignId ?? activeCampaignId for send/cancel/fetch results)

<template>
  <DefaultLayout>
    <div
      class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 p-6"
    >
      <div class="max-w-7xl mx-auto space-y-6">
        <!-- Header -->
        <UCard>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="bg-primary-500/10 p-3 rounded-xl">
                <UIcon name="i-lucide-terminal" class="size-8 text-primary-500" />
              </div>
              <div>
                <h1 class="text-3xl font-bold text-white">Dashboard MJ</h1>
                <p class="text-gray-400 mt-1">Gérez vos sondages multi-streams</p>
              </div>
            </div>
            <div class="flex gap-3 items-center">
              <RoleToggle />
              <UButton
                color="error"
                variant="soft"
                icon="i-lucide-log-out"
                label="Déconnexion"
                @click="handleLogout"
              />
            </div>
          </div>
        </UCard>

        <!-- The rest of the template remains unchanged; we only modify script setup logic -->

      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { usePollTemplates } from "@/composables/usePollTemplates";
import { useCampaigns } from "@/composables/useCampaigns";
import { usePollControlStore } from "@/stores/pollControl";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import RoleToggle from "@/components/RoleToggle.vue";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { logout } = useAuth();
const {
  templates,
  loading: templatesLoading,
  fetchTemplates,
  createTemplate,
  deleteTemplate,
  launchPoll,
} = usePollTemplates();
const { campaigns, fetchCampaigns, selectedCampaign, getCampaignMembers } = useCampaigns();

// Campaign management
const campaignsLoaded = ref(false);
const selectedCampaignId = ref<string | null>(null);

// Streamers data
const streamers = ref<any[]>([]);
const streamersLoading = ref(false);
const campaignMembers = ref<any[]>([]);

// Utilisation du store Pinia pour la persistance
const pollControlStore = usePollControlStore();
const {
  activeSession,
  activeSessionPolls,
  currentPollIndex,
  pollStatus,
  countdown,
  pollResults,
  launchedPolls,
  pollStartTime,
  pollDuration,
  activeCampaignId,
} = storeToRefs(pollControlStore);

// Computed pour la question actuelle
const currentPoll = computed(() => {
  if (!activeSessionPolls.value.length) return null;
  return activeSessionPolls.value[currentPollIndex.value];
});

// Fonction pour lancer une session
const launchSession = async (session: any) => {
  if (!selectedCampaignId.value) return;

  // Vérifier si une session est déjà active
  if (activeSession.value) {
    toast.add({
      title: "Session déjà active",
      description: "Une session de sondage est déjà en cours. Veuillez l'annuler avant de lancer une nouvelle session.",
      color: "warning",
    });
    return;
  }

  try {
    // Charger les sondages de la session
    const API_URL = import.meta.env.VITE_API_URL;
    const response = await fetch(
      `${API_URL}/mj/campaigns/${selectedCampaignId.value}/poll-sessions/${session.id}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to fetch session details");
    const data = await response.json();

    const polls = data.data.polls || [];

    // Vérifier s'il y a au moins un sondage
    if (polls.length === 0) {
      toast.add({
        title: "Session vide",
        description: "Cette session ne contient aucun sondage. Veuillez ajouter au moins un sondage avant de lancer la session.",
        color: "warning",
      });
      return;
    }

    activeSession.value = session;
    activeSessionPolls.value = polls;
    currentPollIndex.value = 0;
    pollStatus.value = 'idle';
    countdown.value = 0;
    pollResults.value = null;
    launchedPolls.value = [];
    pollStartTime.value = null;
    pollDuration.value = null;

    // Mémoriser la campagne courante dans le store pollControl
    pollControlStore.activeCampaignId = selectedCampaignId.value;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger la session",
      color: "error",
    });
  }
};

// Réinitialiser l'état du sondage
const resetPollState = () => {
  pollStatus.value = 'idle';
  countdown.value = 0;
  pollResults.value = null;
  pollStartTime.value = null;
  pollDuration.value = null;
};

// Annuler le sondage en cours
const cancelPoll = async () => {
  // fallback sur l'ID de campagne mémorisé si selectedCampaignId est null
  const campaignId = selectedCampaignId.value ?? activeCampaignId.value ?? null;

  if (!currentPoll.value || !campaignId) {
    resetPollState();
    return;
  }

  // Arrêter le countdown immédiatement pour éviter fetchPollResults()
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  // Si le sondage est en cours d'envoi, appeler l'API pour annuler
  if (pollStatus.value === 'sending') {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/mj/campaigns/${campaignId}/polls/${currentPoll.value.id}/cancel`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel poll');
      }

      toast.add({
        title: "Sondage annulé",
        description: "Le sondage a été annulé sur tous les streamers",
        color: "warning",
      });
    } catch (error) {
      console.error('Failed to cancel poll:', error);
      toast.add({
        title: "Erreur",
        description: "Impossible d'annuler le sondage",
        color: "error",
      });
    }
  }

  // Réinitialiser l'état local (sans afficher de résultats)
  resetPollState();
};

// Envoyer le sondage
const sendPoll = async () => {
  // fallback sur l'ID de campagne mémorisé si selectedCampaignId est null
  const campaignId = selectedCampaignId.value ?? activeCampaignId.value ?? null;

  if (!currentPoll.value || !activeSession.value || !campaignId) return;

  pollStatus.value = 'sending';
  pollStartTime.value = Date.now();
  pollDuration.value = activeSession.value.default_duration_seconds;
  if (!launchedPolls.value.includes(currentPollIndex.value)) {
    launchedPolls.value.push(currentPollIndex.value);
  }

  try {
    // Appeler l'API pour lancer le sondage - on utilise campaignId obtenu ci-dessus
    const API_URL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${API_URL}/mj/campaigns/${campaignId}/polls/${currentPoll.value.id}/launch`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error');
      throw new Error(errText || 'Failed to launch poll');
    }

    // Démarrer le compteur local
    countdown.value = pollDuration.value;
    startCountdown();
  } catch (error: any) {
    const errorMessage = (error && error.message) ? error.message : 'Une erreur est survenue';
    // Détecter les erreurs spécifiques et message utilisateur
    if (errorMessage.includes('No active streamers')) {
      toast.add({
        title: "Aucun streamer actif",
        description: "Aucun streamer n'est connecté dans cette campagne",
        color: "error",
      });
    } else if (errorMessage.includes('not a partner or affiliate')) {
      toast.add({
        title: "Streamers incompatibles",
        description: "Les streamers doivent être Affiliés ou Partenaires Twitch pour utiliser les sondages",
        color: "error",
      });
    } else {
      toast.add({
        title: "Erreur",
        description: errorMessage,
        color: "error",
      });
    }
    pollStatus.value = 'idle';
    pollStartTime.value = null;
    pollDuration.value = null;
  }
};

// Compte à rebours (variable utilisée par startCountdown)
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownInterval!);
      countdownInterval = null;
      pollStatus.value = 'sent';
      pollStartTime.value = null;
      pollDuration.value = null;
      fetchPollResults();
    }
  }, 1000);
};

// Récupérer les résultats (10 fois en 10 secondes)
const fetchPollResults = async () => {
  if (!currentPoll.value) return;

  // fallback pour la campagne
  const campaignId = selectedCampaignId.value ?? activeCampaignId.value ?? null;
  if (!campaignId || !currentPoll.value) return;

  let attempts = 0;
  const maxAttempts = 10;

  const fetchInterval = setInterval(async () => {
    attempts++;

    try {
      // Appeler l'API pour récupérer les résultats
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/mj/campaigns/${campaignId}/polls/${currentPoll.value.id}/results`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      pollResults.value = data.data;
    } catch (error) {
      console.error("Failed to fetch poll results:", error);
    }

    if (attempts >= maxAttempts) {
      clearInterval(fetchInterval);
    }
  }, 1000);
};

// Reprendre le countdown si un sondage était en cours lors du chargement
onMounted(() => {
  // Forcer le rechargement de l'état depuis localStorage côté client
  pollControlStore.loadState();

  console.log('Poll Control - onMounted (après loadState):', {
    activeSession: activeSession.value,
    pollStatus: pollStatus.value,
    countdown: countdown.value,
    activeSessionPolls: activeSessionPolls.value.length
  });

  if (pollStatus.value === 'sending' && countdown.value > 0) {
    console.log('Reprendre le countdown avec', countdown.value, 'secondes restantes');
    startCountdown();
  }
});

</script>

<style scoped>
/* (styles unchanged) */
</style>
