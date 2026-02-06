<template>
  <div class="error-page">
    <!-- Background gradient subtil -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-secondary-100/30 via-transparent to-transparent pointer-events-none"
    />

    <!-- Contenu principal centré -->
    <div class="container mx-auto px-4 max-w-2xl relative z-10">
      <div class="flex flex-col items-center justify-center min-h-screen py-12 space-y-8">
        <!-- Image du gobelin animé -->
        <div class="goblin-container">
          <img src="/images/gobelin.gif" alt="Gobelin perdu" class="goblin-image" />

          <!-- Effet glow derrière le gobelin -->
          <div
            class="absolute -inset-8 bg-gradient-to-r from-secondary-300/20 to-primary-300/20 blur-3xl -z-10 rounded-full"
          />
        </div>

        <!-- Le 404 -->
        <div class="error-code">
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-secondary-600 to-secondary-400"
          >
            404
          </span>
        </div>

        <!-- Message -->
        <div class="text-center space-y-3">
          <h1 class="error-title">Chemin Introuvable</h1>
          <p class="error-description">
            {{ errorMessage }}
          </p>
        </div>

        <!-- Bouton CTA unique -->
        <UButton
          to="/"
          size="xl"
          class="error-cta"
          trailing-icon="i-lucide-home"
          @click="handleGoHome"
        >
          Retour à l'Accueil
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as Sentry from '@sentry/nuxt'

interface NuxtError {
  statusCode?: number
  statusMessage?: string
  message?: string
  fatal?: boolean
  unhandled?: boolean
  data?: unknown
}

const props = defineProps<{
  error?: NuxtError
}>()

// Capture error to Sentry for 5xx errors (not 404s which are expected)
onMounted(() => {
  if (props.error && props.error.statusCode && props.error.statusCode >= 500) {
    Sentry.captureException(new Error(props.error.message || 'Unknown error'), {
      tags: {
        'error.statusCode': props.error.statusCode,
        'error.fatal': props.error.fatal,
        'error.unhandled': props.error.unhandled,
      },
      extra: {
        statusMessage: props.error.statusMessage,
        data: props.error.data,
      },
    })
  }
})

const errorMessage = computed(() => {
  if (props.error?.statusCode === 404) {
    return "Cette page s'est perdue dans les méandres du donjon... Mais pas d'inquiétude, l'aventure continue !"
  }
  if (props.error?.statusCode === 500) {
    return "Un sortilège s'est retourné contre nous... Nos mages travaillent à le dissiper."
  }
  return props.error?.message || "Une erreur inattendue s'est produite dans votre quête."
})

const handleGoHome = () => {
  clearError({ redirect: '/' })
}
</script>

<style scoped>
/* Page principale */
.error-page {
  min-height: 100dvh;
  background-color: var(--color-bg-page);
  position: relative;
  overflow: hidden;
}

/* Conteneur du gobelin */
.goblin-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

/* Image du gobelin */
.goblin-image {
  width: 400px;
  height: 400px;
  max-width: 90vw;
  max-height: 50vh;
  object-fit: contain;
  border-radius: 1rem;
  transition: transform 0.3s ease;
}

.goblin-image:hover {
  transform: scale(1.02);
}

/* Code d'erreur 404 */
.error-code {
  font-family: var(--font-heading);
  font-size: clamp(5rem, 15vw, 10rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: 0.05em;
  text-align: center;
  margin: 0;
}

/* Titre */
.error-title {
  font-family: var(--font-heading);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

/* Description */
.error-description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .goblin-image {
    width: 300px;
    height: 300px;
  }

  .error-code {
    margin-top: -1rem;
  }
}

/* Bouton CTA avec glow subtil */
:deep(.error-cta) {
  box-shadow:
    0 0 20px rgba(216, 183, 144, 0.3),
    0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

:deep(.error-cta:hover) {
  transform: translateY(-2px);
  box-shadow:
    0 0 30px rgba(216, 183, 144, 0.5),
    0 8px 16px rgba(0, 0, 0, 0.15);
}

:deep(.error-cta:active) {
  transform: translateY(0);
}
</style>
