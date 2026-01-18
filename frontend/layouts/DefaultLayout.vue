<template>
  <div class="min-h-screen bg-subtle">
    <slot />
    <SupportWidget />
  </div>
</template>

<script setup lang="ts">
import SupportWidget from '@/components/SupportWidget.vue'
</script>
