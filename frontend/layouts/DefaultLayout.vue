<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <slot />
    <DevModeIndicator />
  </div>
</template>

<script setup lang="ts">
import DevModeIndicator from '@/components/DevModeIndicator.vue'
</script>
