<template>
  <header class="sticky top-0 z-40 bg-elevated border-b border-default shadow-sm">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
      <div class="flex items-center justify-between">
        <!-- Logo et titre (lien désactivé temporairement) -->
        <div class="flex items-center gap-3 sm:gap-4">
          <div class="bg-brand-light p-2 sm:p-3 rounded-xl">
            <UIcon name="i-lucide-terminal" class="size-6 sm:size-8 text-brand-500" />
          </div>
          <div class="hidden sm:block">
            <h1 class="text-xl sm:text-2xl font-bold text-primary">Tumulte</h1>
            <p class="text-xs sm:text-sm text-muted hidden md:block">
              Gérez vos sondages Twitch multistream
            </p>
          </div>
        </div>

        <!-- User Menu -->
        <UserMenu />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import UserMenu from '@/components/UserMenu.vue'
</script>
