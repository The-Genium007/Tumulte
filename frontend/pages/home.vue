<template>
  <div>
    <LandingHero />
    <LandingProblem />
    <LandingSolution />
    <LandingFeatures />
    <LandingUseCases />
    <LandingTestimonials />
    <LandingCta />
  </div>
</template>

<script setup lang="ts">
import LandingHero from '~/components/landing/LandingHero.vue'
import LandingProblem from '~/components/landing/LandingProblem.vue'
import LandingSolution from '~/components/landing/LandingSolution.vue'
import LandingFeatures from '~/components/landing/LandingFeatures.vue'
import LandingUseCases from '~/components/landing/LandingUseCases.vue'
import LandingTestimonials from '~/components/landing/LandingTestimonials.vue'
import LandingCta from '~/components/landing/LandingCta.vue'

definePageMeta({
  layout: 'landing' as const,
})

// SEO
useSeoMeta({
  title: 'Tumulte - Forgez des Légendes avec vos Communautés',
  description:
    'Transformez vos viewers en acteurs de l\'aventure JDR. Sondages Twitch synchronisés sur plusieurs chaînes, décisions collectives, chaos mémorable.',
  ogTitle: 'Tumulte - Forgez des Légendes avec vos Communautés',
  ogDescription:
    'Transformez vos viewers en acteurs de l\'aventure JDR. Sondages Twitch synchronisés sur plusieurs chaînes.',
  ogType: 'website',
})
</script>
