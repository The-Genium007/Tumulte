<template>
  <section class="py-16 lg:py-24 bg-white/50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <!-- Header -->
      <div v-motion-fade-up class="text-center space-y-4 mb-12">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold">
          Chroniques des
          <span class="text-secondary-500">Aventuriers</span>
        </h2>
        <p class="text-lg text-muted max-w-2xl mx-auto">
          Les récits de ceux qui ont forgé des légendes avec leurs communautés
        </p>
      </div>

      <!-- Placeholder pour les témoignages -->
      <div v-motion-scale-up class="max-w-3xl mx-auto">
        <UCard class="text-center">
          <div class="py-8 space-y-4">
            <div
              class="size-16 mx-auto rounded-full bg-secondary-100 flex items-center justify-center"
            >
              <UIcon name="i-lucide-quote" class="size-8 text-secondary-400" />
            </div>
            <p class="text-muted italic">
              Bientôt, les récits de ceux qui ont forgé des légendes...
            </p>
            <p class="text-sm text-primary-400">
              Cette section accueillera les témoignages de MJ et streamers
            </p>
          </div>
        </UCard>
      </div>

      <!-- Template pour futurs témoignages (commenté pour référence)
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="testimonial in testimonials" :key="testimonial.name" class="card-hover">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <img
                :src="testimonial.avatar"
                :alt="testimonial.name"
                class="size-12 rounded-full"
              />
              <div>
                <p class="font-medium">{{ testimonial.name }}</p>
                <p class="text-sm text-muted">{{ testimonial.role }}</p>
              </div>
            </div>
            <p class="text-muted italic">"{{ testimonial.quote }}"</p>
          </div>
        </UCard>
      </div>
      -->
    </div>
  </section>
</template>

<script setup lang="ts">
// Préparé pour de futurs témoignages
// const testimonials = [
//   {
//     name: 'StreamerName',
//     role: 'Maître du Jeu',
//     avatar: '/images/testimonials/avatar1.webp',
//     quote: 'Tumulte a transformé nos sessions...',
//   },
// ]
</script>
