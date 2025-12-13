<template>
  <DefaultLayout>
    <div class="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/10 to-gray-950 p-6">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Header -->
        <UCard>
          <div class="flex items-center gap-4">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              to="/streamer"
            />
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-white">Mes Campagnes</h1>
              <p class="text-gray-400 mt-1">Gérez vos invitations et campagnes actives</p>
            </div>
          </div>
        </UCard>

        <!-- Invitations en attente -->
        <UCard v-if="loading">
          <div class="text-center py-12">
            <UIcon name="i-lucide-loader" class="size-12 text-primary-500 animate-spin mx-auto" />
            <p class="text-gray-400 mt-4">Chargement...</p>
          </div>
        </UCard>

        <UCard v-else-if="invitations.length > 0">
          <template #header>
            <div class="flex items-center gap-3">
              <div class="bg-yellow-500/10 p-2 rounded-lg">
                <UIcon name="i-lucide-mail" class="size-6 text-yellow-500" />
              </div>
              <h2 class="text-xl font-semibold text-white">Invitations en attente</h2>
              <UBadge color="warning" variant="soft">{{ invitations.length }}</UBadge>
              <UBadge
                v-if="isDev && invitations[0]?.id.startsWith('mock-')"
                color="info"
                variant="soft"
                size="xs"
              >
                📋 Données de test
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <UCard
              v-for="invitation in invitations"
              :key="invitation.id"
              variant="outline"
              class="bg-gray-800/30"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="bg-purple-500/10 p-2 rounded-lg">
                      <UIcon name="i-lucide-folder-kanban" class="size-5 text-purple-400" />
                    </div>
                    <h3 class="font-semibold text-lg text-white">{{ invitation.campaign.name }}</h3>
                  </div>
                  <p v-if="invitation.campaign.description" class="text-gray-400 text-sm mb-3">
                    {{ invitation.campaign.description }}
                  </p>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <UIcon name="i-lucide-user" class="size-4" />
                    <span>Invité par <strong class="text-gray-300">{{ invitation.campaign.owner_name }}</strong></span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <UIcon name="i-lucide-calendar" class="size-3" />
                    <span>{{ formatDate(invitation.invited_at) }}</span>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <UButton
                    color="success"
                    size="sm"
                    icon="i-lucide-check"
                    label="Accepter"
                    @click="handleAccept(invitation.id)"
                  />
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-x"
                    label="Refuser"
                    @click="handleDecline(invitation.id)"
                  />
                </div>
              </div>
            </UCard>
          </div>
        </UCard>

        <!-- Campagnes actives -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div class="bg-green-500/10 p-2 rounded-lg">
                <UIcon name="i-lucide-folder-check" class="size-6 text-green-500" />
              </div>
              <h2 class="text-xl font-semibold text-white">Campagnes actives</h2>
              <UBadge v-if="activeCampaigns.length > 0" color="success" variant="soft">
                {{ activeCampaigns.length }}
              </UBadge>
            </div>
          </template>

          <div v-if="loading" class="text-center py-12">
            <UIcon name="i-lucide-loader" class="size-10 text-primary-500 animate-spin mx-auto" />
          </div>

          <div v-else-if="activeCampaigns.length === 0" class="text-center py-12">
            <div class="bg-gray-800/50 p-4 rounded-2xl mb-4 inline-block">
              <UIcon name="i-lucide-folder-x" class="size-12 text-gray-600" />
            </div>
            <p class="text-gray-400 mb-2">Aucune campagne active</p>
            <p class="text-sm text-gray-500">
              Vous apparaîtrez ici une fois que vous aurez accepté une invitation
            </p>
          </div>

          <div v-else class="space-y-4">
            <UCard
              v-for="campaign in activeCampaigns"
              :key="campaign.id"
              variant="outline"
              class="bg-gray-800/30"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <div class="bg-green-500/10 p-2 rounded-lg">
                      <UIcon name="i-lucide-folder-check" class="size-5 text-green-400" />
                    </div>
                    <h3 class="font-semibold text-lg text-white">{{ campaign.name }}</h3>
                    <UBadge color="success" variant="soft" size="xs">Actif</UBadge>
                  </div>
                  <p v-if="campaign.description" class="text-gray-400 text-sm mb-3">
                    {{ campaign.description }}
                  </p>
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 text-sm text-gray-500">
                      <UIcon name="i-lucide-crown" class="size-4" />
                      <span>Maître du jeu : <strong class="text-gray-300">{{ campaign.owner_name }}</strong></span>
                    </div>
                    <div class="flex items-center gap-2 text-xs text-gray-500">
                      <UIcon name="i-lucide-calendar-check" class="size-3" />
                      <span>Rejoint le {{ formatDate(campaign.joined_at!) }}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <UButton
                    color="error"
                    variant="soft"
                    size="sm"
                    icon="i-lucide-log-out"
                    label="Quitter"
                    @click="handleLeave(campaign.id, campaign.name)"
                  />
                </div>
              </div>
            </UCard>
          </div>
        </UCard>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { useCampaigns } from "@/composables/useCampaigns";
import type { Campaign, CampaignInvitation } from "@/types";

const {
  fetchInvitations,
  acceptInvitation,
  declineInvitation,
  fetchActiveCampaigns,
  leaveCampaign,
} = useCampaigns();
const toast = useToast();

const invitations = ref<CampaignInvitation[]>([]);
const activeCampaigns = ref<Campaign[]>([]);
const loading = ref(false);

// Mode développement
const isDev = computed(() => import.meta.env.DEV);

// Données fictives pour le développement
const mockInvitations: CampaignInvitation[] = [
  {
    id: "mock-invitation-1",
    campaign: {
      id: "mock-campaign-1",
      name: "🎭 Campagne des Ombres Perdues",
      description: "Une aventure épique dans un monde de fantasy sombre où les héros doivent retrouver les fragments d'une ancienne relique.",
      owner_name: "MaitreJeu_Epic",
    },
    invited_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
  },
  {
    id: "mock-invitation-2",
    campaign: {
      id: "mock-campaign-2",
      name: "🚀 Space Opera: Les Confins de l'Univers",
      description: "Explorez les galaxies lointaines, combattez des aliens et découvrez les mystères de l'espace profond.",
      owner_name: "GM_Cosmos",
    },
    invited_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Il y a 5 heures
  },
  {
    id: "mock-invitation-3",
    campaign: {
      id: "mock-campaign-3",
      name: "⚔️ Donjons & Dragons : La Quête du Graal",
      description: null,
      owner_name: "DungeonMaster_Pro",
    },
    invited_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Il y a 30 minutes
  },
];

onMounted(async () => {
  await loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    const [invitationsData, campaignsData] = await Promise.all([
      fetchInvitations(),
      fetchActiveCampaigns(),
    ]);

    // En mode dev, ajouter les données fictives si pas d'invitations réelles
    if (isDev.value && invitationsData.length === 0) {
      invitations.value = mockInvitations;
    } else {
      invitations.value = invitationsData;
    }

    activeCampaigns.value = campaignsData;
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de charger les campagnes",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const handleAccept = async (id: string) => {
  try {
    await acceptInvitation(id);
    toast.add({
      title: "Succès",
      description: "Invitation acceptée ! Vous faites maintenant partie de cette campagne.",
      color: "success",
    });
    await loadData();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible d'accepter l'invitation",
      color: "error",
    });
  }
};

const handleDecline = async (id: string) => {
  if (!confirm("Êtes-vous sûr de vouloir refuser cette invitation ?")) {
    return;
  }

  try {
    await declineInvitation(id);
    toast.add({
      title: "Succès",
      description: "Invitation refusée",
      color: "success",
    });
    await loadData();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de refuser l'invitation",
      color: "error",
    });
  }
};

const handleLeave = async (id: string, name: string) => {
  if (!confirm(`Êtes-vous sûr de vouloir quitter la campagne "${name}" ?\n\nVous serez immédiatement retiré de tous les sondages en cours de cette campagne.`)) {
    return;
  }

  try {
    await leaveCampaign(id);
    toast.add({
      title: "Succès",
      description: "Vous avez quitté la campagne",
      color: "success",
    });
    await loadData();
  } catch (error) {
    toast.add({
      title: "Erreur",
      description: "Impossible de quitter la campagne",
      color: "error",
    });
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};
</script>
