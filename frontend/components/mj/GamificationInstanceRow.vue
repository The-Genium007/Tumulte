<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { GamificationInstance } from '@/types/api'

const props = defineProps<{
  instance: GamificationInstance
  // Test mode props (DEV/STAGING only)
  isDev?: boolean
}>()

const emit = defineEmits<{
  cancel: [instanceId: string]
  forceComplete: [instanceId: string]
}>()

// Timer for countdown
const timeRemaining = ref(0)
const cancelling = ref(false)
let timerInterval: ReturnType<typeof setInterval> | null = null

const startTimer = () => {
  stopTimer()
  updateTimeRemaining()
  timerInterval = setInterval(updateTimeRemaining, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

onMounted(() => {
  if (isActive.value) {
    startTimer()
  } else {
    updateTimeRemaining()
  }
})

onUnmounted(() => {
  stopTimer()
})

// Stop the timer when the instance is no longer active
watch(
  () => props.instance.status,
  (newStatus) => {
    if (newStatus !== 'active') {
      stopTimer()
      cancelling.value = false
    }
  }
)

const updateTimeRemaining = () => {
  const now = new Date().getTime()
  const expires = new Date(props.instance.expiresAt).getTime()
  timeRemaining.value = Math.max(0, Math.floor((expires - now) / 1000))
}

// Computed
const progressPercentage = computed(() => {
  return Math.min(100, props.instance.progressPercentage)
})

const isComplete = computed(() => props.instance.isObjectiveReached)

const isActive = computed(() => props.instance.status === 'active')

const isArmed = computed(() => props.instance.status === 'armed')

const eventName = computed(() => props.instance.event?.name ?? 'Événement')

const eventColor = computed(() => props.instance.event?.rewardColor ?? '#9146FF')

const instanceTypeBadge = computed(() => {
  return props.instance.type === 'individual'
    ? { label: 'Individuel', color: 'info' as const }
    : { label: 'Groupe', color: 'warning' as const }
})

// Format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Handle cancel
const handleCancel = () => {
  cancelling.value = true
  emit('cancel', props.instance.id)
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-lg border transition-all"
    :class="
      isComplete
        ? 'border-success-500 bg-success-light'
        : isArmed
          ? 'border-amber-500 bg-amber-500/5'
          : 'border-muted bg-elevated'
    "
  >
    <!-- Progress bar background -->
    <div
      class="absolute inset-0 transition-all duration-300"
      :style="{
        width: `${progressPercentage}%`,
        backgroundColor: isComplete ? 'rgb(34 197 94 / 0.2)' : eventColor + '20',
      }"
    />

    <!-- Content -->
    <div class="relative flex items-center justify-between gap-4 p-4">
      <!-- Left: Info -->
      <div class="flex items-center gap-3 min-w-0">
        <!-- Icon -->
        <div
          class="size-10 rounded-lg flex items-center justify-center shrink-0"
          :style="{ backgroundColor: eventColor + '30' }"
        >
          <UIcon v-if="isComplete" name="i-lucide-check" class="size-5 text-success-500" />
          <UIcon
            v-else-if="isArmed"
            name="i-lucide-shield-alert"
            class="size-5 animate-pulse text-amber-500"
          />
          <UIcon
            v-else
            name="i-lucide-zap"
            class="size-5 animate-pulse"
            :style="{ color: eventColor }"
          />
        </div>

        <!-- Info -->
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-semibold text-primary truncate">{{ eventName }}</h4>
            <UBadge :color="instanceTypeBadge.color" variant="soft" size="xs">
              {{ instanceTypeBadge.label }}
            </UBadge>
          </div>

          <!-- Progress info -->
          <div class="flex items-center gap-3 mt-1 text-sm">
            <span class="text-muted">
              <span class="font-semibold text-primary">{{ instance.currentProgress }}</span>
              / {{ instance.objectiveTarget }} clics
            </span>
            <template v-if="isArmed">
              <span class="text-muted">•</span>
              <span class="text-amber-500 font-medium"> En attente d'un jet critique </span>
            </template>
            <template v-else-if="isActive">
              <span class="text-muted">•</span>
              <span :class="timeRemaining <= 10 ? 'text-error-500 font-semibold' : 'text-muted'">
                {{ formatTime(timeRemaining) }}
              </span>
            </template>
          </div>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Progress percentage -->
        <div class="hidden sm:block text-right mr-2">
          <p class="text-lg font-bold" :class="isComplete ? 'text-success-500' : 'text-primary'">
            {{ Math.round(progressPercentage) }}%
          </p>
        </div>

        <!-- Force complete button (DEV/STAGING only, if active) -->
        <UButton
          v-if="isDev && isActive"
          icon="i-lucide-zap"
          label="Forcer succès"
          color="warning"
          variant="soft"
          size="sm"
          @click="emit('forceComplete', instance.id)"
        />

        <!-- Cancel button (active or armed) -->
        <UButton
          v-if="isActive || isArmed"
          icon="i-lucide-x"
          color="error"
          variant="soft"
          size="sm"
          :loading="cancelling"
          aria-label="Annuler l'événement"
          @click="handleCancel"
        />

        <!-- Armed status indicator -->
        <UBadge v-if="isArmed" color="warning" variant="solid" size="lg">
          <UIcon name="i-lucide-shield-alert" class="size-4 mr-1" />
          En attente
        </UBadge>

        <!-- Status indicator (when not active and not armed) -->
        <UBadge
          v-else-if="!isActive"
          :color="isComplete ? 'success' : instance.status === 'cancelled' ? 'error' : 'neutral'"
          variant="solid"
          size="lg"
        >
          <UIcon
            :name="
              isComplete
                ? 'i-lucide-check'
                : instance.status === 'cancelled'
                  ? 'i-lucide-x'
                  : 'i-lucide-clock'
            "
            class="size-4 mr-1"
          />
          {{ isComplete ? 'Réussi' : instance.status === 'cancelled' ? 'Annulé' : 'Expiré' }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
