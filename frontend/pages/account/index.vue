<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <UButton icon="i-lucide-arrow-left" variant="ghost" size="sm" to="/streamer" />
      <h1 class="text-2xl font-bold">Mon compte</h1>
    </div>

    <!-- Profil -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Profil</h2>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Avatar et nom -->
        <div class="flex items-center gap-4">
          <UAvatar
            :src="user?.avatarUrl ?? undefined"
            :alt="user?.displayName"
            size="xl"
            class="ring-2 ring-primary/20"
          />
          <div>
            <p class="font-semibold text-lg">{{ user?.displayName }}</p>
            <p class="text-sm text-muted">{{ user?.email }}</p>
            <UBadge
              v-if="user?.tier"
              :color="tierColors[user.tier]"
              variant="subtle"
              class="mt-1"
            >
              {{ tierLabels[user.tier] }}
            </UBadge>
          </div>
        </div>

        <!-- Email verification status -->
        <UAlert
          v-if="user?.email && !user.emailVerifiedAt"
          color="warning"
          variant="soft"
          icon="i-lucide-alert-triangle"
        >
          <template #title>Email non vérifié</template>
          <template #description>
            <p class="mb-2">Veuillez vérifier votre adresse email pour accéder à toutes les fonctionnalités.</p>
            <UButton size="xs" variant="outline" @click="handleResendVerification" :loading="resending">
              Renvoyer l'email
            </UButton>
          </template>
        </UAlert>
      </div>
    </UCard>

    <!-- Méthodes de connexion -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Méthodes de connexion</h2>
      </template>

      <div class="space-y-4">
        <!-- Email/Password -->
        <div class="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-default flex items-center justify-center">
              <UIcon name="i-lucide-mail" class="size-5" />
            </div>
            <div>
              <p class="font-medium">Email & mot de passe</p>
              <p class="text-sm text-muted">
                {{ user?.hasPassword ? user?.email : 'Non configuré' }}
              </p>
            </div>
          </div>
          <UButton
            v-if="user?.hasPassword"
            variant="ghost"
            size="sm"
            to="/account/password"
          >
            Modifier
          </UButton>
          <UButton v-else variant="outline" size="sm" to="/account/password">
            Configurer
          </UButton>
        </div>

        <!-- OAuth Providers -->
        <div
          v-for="provider in oauthProviders"
          :key="provider.id"
          class="flex items-center justify-between p-3 rounded-lg bg-muted/50"
        >
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-lg bg-default flex items-center justify-center">
              <UIcon :name="provider.icon" :class="['size-5', provider.iconColor]" />
            </div>
            <div>
              <p class="font-medium">{{ provider.label }}</p>
              <p class="text-sm text-muted">
                {{ getProviderStatus(provider.id) }}
              </p>
            </div>
          </div>
          <UButton
            v-if="isProviderLinked(provider.id)"
            variant="ghost"
            size="sm"
            color="error"
            :disabled="!canUnlinkProvider"
            @click="handleUnlinkProvider(provider.id)"
          >
            Délier
          </UButton>
          <UButton
            v-else
            variant="outline"
            size="sm"
            @click="handleLinkProvider(provider.id)"
          >
            Lier
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Abonnement -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">Abonnement</h2>
      </template>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium">Plan actuel</p>
            <p class="text-sm text-muted">{{ tierLabels[user?.tier ?? 'free'] }}</p>
          </div>
          <UBadge :color="tierColors[user?.tier ?? 'free']" variant="subtle" size="lg">
            {{ tierLabels[user?.tier ?? 'free'] }}
          </UBadge>
        </div>

        <UButton
          v-if="user?.tier === 'free'"
          block
          variant="outline"
          disabled
        >
          Passer à Premium (bientôt disponible)
        </UButton>
      </div>
    </UCard>

    <!-- Zone de danger -->
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold text-error">Zone de danger</h2>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-muted">
          La suppression de votre compte est irréversible. Toutes vos données seront perdues.
        </p>
        <UButton variant="outline" color="error" disabled>
          Supprimer mon compte (bientôt disponible)
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import type { UserTier } from '@/types'

definePageMeta({
  layout: 'authenticated' as const,
  middleware: 'auth',
})

const { user, resendVerificationEmail } = useAuth()
const toast = useToast()
const config = useRuntimeConfig()

function showSuccess(message: string) {
  toast.add({ title: message, color: 'success', icon: 'i-lucide-check-circle' })
}

function showError(message: string) {
  toast.add({ title: message, color: 'error', icon: 'i-lucide-alert-circle' })
}

const resending = ref(false)

const tierLabels: Record<UserTier, string> = {
  free: 'Gratuit',
  premium: 'Premium',
  admin: 'Admin',
}

const tierColors: Record<UserTier, 'neutral' | 'primary' | 'error'> = {
  free: 'neutral',
  premium: 'primary',
  admin: 'error',
}

const oauthProviders = [
  { id: 'twitch', label: 'Twitch', icon: 'i-simple-icons-twitch', iconColor: 'text-[#9146FF]' },
  { id: 'google', label: 'Google', icon: 'i-simple-icons-google', iconColor: 'text-[#4285F4]' },
]

const isProviderLinked = (providerId: string) => {
  return user.value?.authProviders?.some((p) => p.provider === providerId)
}

const getProviderStatus = (providerId: string) => {
  const provider = user.value?.authProviders?.find((p) => p.provider === providerId)
  if (provider) {
    return provider.providerDisplayName || provider.providerEmail || 'Connecté'
  }
  return 'Non lié'
}

const canUnlinkProvider = computed(() => {
  const linkedCount = user.value?.authProviders?.length ?? 0
  const hasPassword = user.value?.hasPassword ?? false
  // Must have at least one login method remaining
  return linkedCount > 1 || (linkedCount === 1 && hasPassword)
})

async function handleResendVerification() {
  resending.value = true
  const result = await resendVerificationEmail()
  resending.value = false

  if (result.success) {
    showSuccess('Email de vérification envoyé !')
  } else {
    showError(result.error?.error || 'Une erreur est survenue')
  }
}

function handleLinkProvider(providerId: string) {
  // Redirect to OAuth with link mode
  window.location.href = `${config.public.apiBase}/auth/link/${providerId}`
}

async function handleUnlinkProvider(providerId: string) {
  try {
    const response = await fetch(`${config.public.apiBase}/auth/unlink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ provider: providerId }),
    })

    if (response.ok) {
      showSuccess('Compte délié avec succès')
      // Refresh user data
      window.location.reload()
    } else {
      const result = await response.json()
      showError(result.error || 'Une erreur est survenue')
    }
  } catch {
    showError('Une erreur est survenue')
  }
}
</script>
