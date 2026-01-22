<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <div class="text-center space-y-3">
        <div class="flex justify-center">
          <img src="~/assets/images/logo.png" alt="Tumulte" class="size-24" />
        </div>
        <h1 class="text-3xl font-bold text-primary">Créer un compte</h1>
        <p class="text-sm text-muted">Rejoignez Tumulte gratuitement</p>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Formulaire d'inscription -->
      <form @submit.prevent="handleRegister" class="space-y-4">
        <UFormField label="Nom d'affichage" name="displayName" :error="fieldErrors.displayName">
          <UInput
            v-model="form.displayName"
            type="text"
            placeholder="Votre pseudo"
            icon="i-lucide-user"
            size="lg"
            required
          />
        </UFormField>

        <UFormField label="Email" name="email" :error="fieldErrors.email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="votre@email.com"
            icon="i-lucide-mail"
            size="lg"
            required
          />
        </UFormField>

        <UFormField label="Mot de passe" name="password" :error="fieldErrors.password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="Minimum 8 caractères"
            icon="i-lucide-lock"
            size="lg"
            required
          />
        </UFormField>

        <UFormField
          label="Confirmer le mot de passe"
          name="passwordConfirmation"
          :error="fieldErrors.passwordConfirmation"
        >
          <UInput
            v-model="form.passwordConfirmation"
            type="password"
            placeholder="Confirmez votre mot de passe"
            icon="i-lucide-lock"
            size="lg"
            required
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          :disabled="!isFormValid"
        >
          Créer mon compte
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
          <span class="bg-default px-2 text-muted">ou s'inscrire avec</span>
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
          @click="handleOAuthRegister('twitch')"
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
          @click="handleOAuthRegister('google')"
        >
          Google
        </UButton>
      </div>

      <!-- Lien connexion -->
      <p class="text-center text-sm text-muted">
        Déjà un compte ?
        <NuxtLink to="/login" class="text-primary hover:underline font-medium">
          Se connecter
        </NuxtLink>
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'auth' as const,
})

const router = useRouter()
const { register, loginWithOAuth, loading } = useAuth()

const form = reactive({
  displayName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
})

const errorMessage = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string | undefined>>({})

const isFormValid = computed(() => {
  return (
    form.displayName.length >= 2 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.password === form.passwordConfirmation
  )
})

async function handleRegister() {
  errorMessage.value = null
  Object.keys(fieldErrors).forEach((key) => (fieldErrors[key] = undefined))

  const result = await register(form)

  if (result.success) {
    router.push('/verify-email')
  } else if (result.error) {
    errorMessage.value = result.error.error

    // Map field-specific errors
    if (result.error.errors) {
      Object.entries(result.error.errors).forEach(([field, messages]) => {
        fieldErrors[field] = messages[0]
      })
    }
  }
}

function handleOAuthRegister(provider: 'twitch' | 'google') {
  loginWithOAuth(provider)
}
</script>
