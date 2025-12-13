<template>
  <div class="flex items-center gap-3">
    <div class="flex items-center gap-2">
      <UIcon
        name="i-lucide-shield"
        class="size-5"
        :class="!isStreamerMode ? 'text-purple-500' : 'text-gray-500'"
      />
      <USwitch
        v-model="isStreamerMode"
        :disabled="switching"
        size="lg"
        @update:model-value="handleToggle"
      />
      <UIcon
        name="i-lucide-video"
        class="size-5"
        :class="isStreamerMode ? 'text-blue-500' : 'text-gray-500'"
      />
    </div>
    <div class="flex flex-col">
      <span class="text-xs font-medium text-gray-400">Mode</span>
      <span class="text-sm font-semibold" :class="isStreamerMode ? 'text-blue-400' : 'text-purple-400'">
        {{ isStreamerMode ? 'Streamer' : 'MJ' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const { user, switchRole } = useAuth();
const toast = useToast();
const switching = ref(false);
const isStreamerMode = ref(false);

// Synchroniser isStreamerMode avec la route ET le rôle de l'utilisateur
watch(
  [() => user.value?.role, () => route.path],
  ([role, path]) => {
    // Prioriser la route actuelle pour la synchronisation
    if (path?.startsWith("/streamer")) {
      isStreamerMode.value = true;
    } else if (path?.startsWith("/mj")) {
      isStreamerMode.value = false;
    } else {
      // Sinon, se baser sur le rôle
      isStreamerMode.value = role === "STREAMER";
    }
  },
  { immediate: true }
);

const handleToggle = async (value: boolean) => {
  const newRole = value ? "STREAMER" : "MJ";
  switching.value = true;

  try {
    await switchRole(newRole);
    toast.add({
      title: "Rôle changé",
      description: `Vous êtes maintenant en mode ${newRole}`,
      color: "green",
    });
  } catch (error: any) {
    toast.add({
      title: "Erreur",
      description: error.data?.message || "Impossible de changer de rôle",
      color: "red",
    });
    // Revenir à l'état précédent en cas d'erreur
    isStreamerMode.value = user.value?.role === "STREAMER";
  } finally {
    switching.value = false;
  }
};
</script>
