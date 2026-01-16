<template>
  <div class="audio-module">
    <!-- Enable Toggle -->
    <div class="inline-field">
      <div class="enable-label">
        <UIcon name="i-lucide-volume-2" class="size-4" />
        <label>{{ label }}</label>
      </div>
      <USwitch
        :model-value="modelValue.enabled"
        size="sm"
        @update:model-value="(v: boolean) => updateField('enabled', v)"
      />
    </div>

    <template v-if="modelValue.enabled">
      <!-- Sound Selection -->
      <div v-if="soundOptions.length > 0" class="field">
        <label>Son</label>
        <USelect
          :model-value="modelValue.soundFile"
          :items="soundOptions"
          size="xs"
          @update:model-value="(v: string) => updateField('soundFile', v)"
        />
      </div>

      <!-- Volume -->
      <div class="slider-field">
        <div class="slider-header">
          <label>Volume</label>
          <span class="slider-value">{{ Math.round(modelValue.volume * 100) }}%</span>
        </div>
        <div class="volume-control">
          <button
            class="volume-button"
            @click="updateField('volume', 0)"
          >
            <UIcon name="i-lucide-volume-x" class="size-4" />
          </button>
          <URange
            :model-value="modelValue.volume"
            :min="0"
            :max="1"
            :step="0.05"
            size="sm"
            class="volume-slider"
            @update:model-value="(v: number) => updateField('volume', v)"
          />
          <button
            class="volume-button"
            @click="updateField('volume', 1)"
          >
            <UIcon name="i-lucide-volume-2" class="size-4" />
          </button>
        </div>
      </div>

      <!-- Preview Button -->
      <UButton
        v-if="showPreview"
        color="neutral"
        variant="soft"
        :icon="isPlaying ? 'i-lucide-square' : 'i-lucide-play'"
        :label="isPlaying ? 'Arrêter' : 'Tester le son'"
        size="xs"
        block
        @click="togglePreview"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from "vue";

export interface AudioConfig {
  enabled: boolean;
  soundFile?: string;
  volume: number;
}

const props = withDefaults(
  defineProps<{
    modelValue: AudioConfig;
    label?: string;
    soundOptions?: { label: string; value: string }[];
    showPreview?: boolean;
    previewUrl?: string;
  }>(),
  {
    label: "Son",
    soundOptions: () => [],
    showPreview: true,
    previewUrl: "",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: AudioConfig];
}>();

const isPlaying = ref(false);
let audioElement: HTMLAudioElement | null = null;

const updateField = <K extends keyof AudioConfig>(
  field: K,
  value: AudioConfig[K],
) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [field]: value,
  });
};

const togglePreview = () => {
  if (isPlaying.value) {
    stopPreview();
  } else {
    playPreview();
  }
};

const playPreview = () => {
  const soundUrl = props.previewUrl || props.modelValue.soundFile;
  if (!soundUrl) return;

  stopPreview();

  audioElement = new Audio(soundUrl);
  audioElement.volume = props.modelValue.volume;

  audioElement.onended = () => {
    isPlaying.value = false;
  };

  audioElement.onerror = () => {
    isPlaying.value = false;
    console.warn("Erreur de lecture audio");
  };

  audioElement.play();
  isPlaying.value = true;
};

const stopPreview = () => {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
    audioElement = null;
  }
  isPlaying.value = false;
};

onUnmounted(() => {
  stopPreview();
});
</script>

<style scoped>
.audio-module {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.inline-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.enable-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--color-text-muted);
}

.enable-label label {
  font-size: 0.75rem;
  font-weight: 500;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.slider-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-header label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.slider-value {
  font-size: 0.75rem;
  color: var(--color-text-primary);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--color-neutral-100);
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.volume-button:hover {
  background: var(--color-neutral-200);
  color: var(--color-text-primary);
}

.volume-slider {
  flex: 1;
}
</style>
