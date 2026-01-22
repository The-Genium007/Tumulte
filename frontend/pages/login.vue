<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <div class="text-center space-y-3">
        <div class="flex justify-center">
          <img src="~/assets/images/logo.png" alt="Tumulte" class="size-24" />
        </div>
        <h1 class="text-3xl font-bold text-primary">Tumulte</h1>
        <p class="text-sm text-muted">Système de sondages Twitch pour JDR</p>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Formulaire email/password -->
      <form @submit.prevent="handleEmailLogin" class="space-y-4">
        <UFormField label="Email" name="email">
          <UInput
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            icon="i-lucide-mail"
            size="lg"
            required
          />
        </UFormField>

        <UFormField label="Mot de passe" name="password">
          <UInput
            v-model="password"
            type="password"
            placeholder="Votre mot de passe"
            icon="i-lucide-lock"
            size="lg"
            required
          />
        </UFormField>

        <div class="flex justify-end">
          <NuxtLink to="/forgot-password" class="text-sm text-primary hover:underline">
            Mot de passe oublié ?
          </NuxtLink>
        </div>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          :disabled="!email || !password"
        >
          Se connecter
        </UButton>
      </form>

      <UAlert
        v-if="errorMessage"
        color="error"
        variant="soft"
        :title="errorMessage"
        icon="i-lucide-alert-circle"
      />

      <!-- Séparateur -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-default" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="bg-default px-2 text-muted">ou continuer avec</span>
        </div>
      </div>

      <!-- Boutons OAuth -->
      <div class="grid grid-cols-2 gap-3">
        <UButton
          block
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-simple-icons-twitch"
          class="hover:bg-[#9146FF]/10 hover:border-[#9146FF]"
          @click="handleOAuthLogin('twitch')"
        >
          Twitch
        </UButton>

        <UButton
          block
          size="lg"
          color="neutral"
          variant="outline"
          icon="i-simple-icons-google"
          class="hover:bg-[#4285F4]/10 hover:border-[#4285F4]"
          @click="handleOAuthLogin('google')"
        >
          Google
        </UButton>
      </div>

      <!-- Lien inscription -->
      <p class="text-center text-sm text-muted">
        Pas encore de compte ?
        <NuxtLink to="/register" class="text-primary hover:underline font-medium">
          Créer un compte
        </NuxtLink>
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'auth' as const,
})

const route = useRoute()
const router = useRouter()
const { login, loginWithOAuth, loading } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)

// Vérifier si une erreur est présente dans l'URL
onMounted(() => {
  const errorParam = route.query.error as string
  if (errorParam === 'invalid_state') {
    errorMessage.value = 'Erreur de validation CSRF. Veuillez réessayer.'
  } else if (errorParam === 'oauth_failed') {
    errorMessage.value = "Échec de l'authentification OAuth. Veuillez réessayer."
  } else if (errorParam === 'session_failed') {
    errorMessage.value = 'Erreur de session. Veuillez vous reconnecter.'
  } else if (errorParam === 'email_not_verified') {
    errorMessage.value = 'Veuillez vérifier votre email avant de vous connecter.'
  }
})

async function handleEmailLogin() {
  errorMessage.value = null
  const result = await login({ email: email.value, password: password.value })

  if (result.success) {
    router.push('/streamer')
  } else if (result.error) {
    errorMessage.value = result.error.error
  }
}

function handleOAuthLogin(provider: 'twitch' | 'google') {
  errorMessage.value = null
  loginWithOAuth(provider)
}
</script>
