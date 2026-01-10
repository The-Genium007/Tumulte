<template>
  <div v-if="isDev" class="fixed bottom-4 left-4 z-50">
    <UCard class="bg-warning-light border-warning-light backdrop-blur-sm">
      <div class="flex items-center gap-3">
        <UIcon
          name="i-lucide-construction"
          class="size-5 text-warning-500 animate-pulse"
        />
        <div>
          <p class="text-sm font-semibold text-warning-500">Mode Développement</p>
          <p class="text-xs text-warning-400">Environnement de test actif</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const isDev = import.meta.env.MODE === "development";
</script>
