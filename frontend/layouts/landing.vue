<template>
  <div class="min-h-screen bg-subtle flex flex-col">
    <!-- Navigation - Sticky avec effet de transparence -->
    <header
      class="sticky top-0 z-50 transition-all duration-300"
      :class="[
        isScrolled
          ? 'bg-subtle/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent',
      ]"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-4">
        <nav class="flex items-center justify-between">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-3 sm:gap-4 group">
            <img
              src="~/assets/images/logo.png"
              alt="Tumulte"
              class="size-10 sm:size-12 transition-transform group-hover:scale-105"
            />
            <h1 class="text-lg sm:text-2xl font-bold text-primary hidden sm:block">Tumulte</h1>
          </NuxtLink>

          <!-- CTA -->
          <div class="flex items-center gap-2 sm:gap-3">
            <UButton
              variant="ghost"
              to="/login"
              size="sm"
              class="hidden sm:inline-flex"
            >
              Connexion
            </UButton>
            <UButton to="/register" size="sm" class="cta-glow">
              <span class="hidden sm:inline">S'inscrire</span>
              <span class="sm:hidden">Rejoindre</span>
            </UButton>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import AppFooter from '@/components/AppFooter.vue'

const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 20)
</script>
