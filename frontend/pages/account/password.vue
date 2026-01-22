<template>
  <div class="max-w-md mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <UButton icon="i-lucide-arrow-left" variant="ghost" size="sm" to="/account" />
      <h1 class="text-2xl font-bold">
        {{ user?.hasPassword ? 'Modifier le mot de passe' : 'Créer un mot de passe' }}
      </h1>
    </div>

    <UCard>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Current password (only if has password) -->
        <UFormField
          v-if="user?.hasPassword"
          label="Mot de passe actuel"
          name="currentPassword"
          :error="fieldErrors.currentPassword"
        >
          <UInput
            v-model="form.currentPassword"
            type="password"
            placeholder="Votre mot de passe actuel"
            icon="i-lucide-lock"
            size="lg"
            required
          />
        </UFormField>

        <UFormField label="Nouveau mot de passe" name="password" :error="fieldErrors.password">
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

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          :title="errorMessage"
          icon="i-lucide-alert-circle"
        />

        <UAlert
          v-if="successMessage"
          color="success"
          variant="soft"
          :title="successMessage"
          icon="i-lucide-check-circle"
        />

        <div class="flex gap-3 pt-2">
          <UButton type="submit" :loading="loading" :disabled="!isFormValid">
            {{ user?.hasPassword ? 'Modifier' : 'Créer' }}
          </UButton>
          <UButton variant="ghost" to="/account"> Annuler </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'authenticated' as const,
  middleware: 'auth',
})

const { user } = useAuth()
const config = useRuntimeConfig()

const loading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string | undefined>>({})

const form = reactive({
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
})

const isFormValid = computed(() => {
  const hasCurrentIfNeeded = user.value?.hasPassword ? form.currentPassword.length > 0 : true
  return (
    hasCurrentIfNeeded &&
    form.password.length >= 8 &&
    form.password === form.passwordConfirmation
  )
})

async function handleSubmit() {
  loading.value = true
  errorMessage.value = null
  successMessage.value = null
  Object.keys(fieldErrors).forEach((key) => (fieldErrors[key] = undefined))

  try {
    const endpoint = user.value?.hasPassword
      ? `${config.public.apiBase}/auth/change-password`
      : `${config.public.apiBase}/auth/set-password`

    const body = user.value?.hasPassword
      ? {
          currentPassword: form.currentPassword,
          newPassword: form.password,
        }
      : {
          password: form.password,
        }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })

    const result = await response.json()

    if (response.ok) {
      successMessage.value = user.value?.hasPassword
        ? 'Mot de passe modifié avec succès'
        : 'Mot de passe créé avec succès'
      form.currentPassword = ''
      form.password = ''
      form.passwordConfirmation = ''
    } else {
      errorMessage.value = result.error

      if (result.errors) {
        Object.entries(result.errors).forEach(([field, messages]) => {
          fieldErrors[field] = (messages as string[])[0]
        })
      }
    }
  } catch {
    errorMessage.value = 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>
