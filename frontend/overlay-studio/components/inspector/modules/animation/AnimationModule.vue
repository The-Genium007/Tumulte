<template>
  <div class="animation-module">
    <!-- Entry Animation -->
    <div v-if="showEntry" class="animation-group">
      <div class="group-header">
        <UIcon name="i-lucide-log-in" class="size-4" />
        <span>Animation d'entrée</span>
      </div>

      <div class="field">
        <label>Type</label>
        <USelect
          :model-value="modelValue.entry.type"
          :items="entryAnimationOptions"
          size="xs"
          @update:model-value="(v: string) => updateEntry('type', v)"
        />
      </div>

      <div class="slider-field">
        <div class="slider-header">
          <label>Durée</label>
          <span class="slider-value">{{ modelValue.entry.duration.toFixed(1) }}s</span>
        </div>
        <URange
          :model-value="modelValue.entry.duration"
          :min="0.1"
          :max="3"
          :step="0.1"
          size="sm"
          @update:model-value="(v: number) => updateEntry('duration', v)"
        />
      </div>

      <div v-if="showDelay" class="slider-field">
        <div class="slider-header">
          <label>Délai</label>
          <span class="slider-value">{{ (modelValue.entry.delay || 0).toFixed(1) }}s</span>
        </div>
        <URange
          :model-value="modelValue.entry.delay || 0"
          :min="0"
          :max="5"
          :step="0.1"
          size="sm"
          @update:model-value="(v: number) => updateEntry('delay', v)"
        />
      </div>

      <div v-if="showEasing" class="field">
        <label>Easing</label>
        <USelect
          :model-value="modelValue.entry.easing || 'ease-out'"
          :items="easingOptions"
          size="xs"
          @update:model-value="(v: string) => updateEntry('easing', v)"
        />
      </div>
    </div>

    <!-- Exit Animation -->
    <div v-if="showExit" class="animation-group">
      <div class="group-header">
        <UIcon name="i-lucide-log-out" class="size-4" />
        <span>Animation de sortie</span>
      </div>

      <div class="field">
        <label>Type</label>
        <USelect
          :model-value="modelValue.exit.type"
          :items="exitAnimationOptions"
          size="xs"
          @update:model-value="(v: string) => updateExit('type', v)"
        />
      </div>

      <div class="slider-field">
        <div class="slider-header">
          <label>Durée</label>
          <span class="slider-value">{{ modelValue.exit.duration.toFixed(1) }}s</span>
        </div>
        <URange
          :model-value="modelValue.exit.duration"
          :min="0.1"
          :max="3"
          :step="0.1"
          size="sm"
          @update:model-value="(v: number) => updateExit('duration', v)"
        />
      </div>

      <div class="slider-field">
        <div class="slider-header">
          <label>Délai avant sortie</label>
          <span class="slider-value">{{ (modelValue.exit.delay || 0).toFixed(1) }}s</span>
        </div>
        <URange
          :model-value="modelValue.exit.delay || 0"
          :min="0"
          :max="10"
          :step="0.5"
          size="sm"
          @update:model-value="(v: number) => updateExit('delay', v)"
        />
      </div>

      <div v-if="showEasing" class="field">
        <label>Easing</label>
        <USelect
          :model-value="modelValue.exit.easing || 'ease-in'"
          :items="easingOptions"
          size="xs"
          @update:model-value="(v: string) => updateExit('easing', v)"
        />
      </div>
    </div>

    <!-- Preview Button -->
    <UButton
      v-if="showPreviewButton"
      color="neutral"
      variant="soft"
      icon="i-lucide-play"
      label="Prévisualiser"
      size="xs"
      block
      @click="$emit('preview')"
    />
  </div>
</template>

<script setup lang="ts">
export interface AnimationConfig {
  entry: {
    type: string;
    duration: number;
    delay?: number;
    easing?: string;
  };
  exit: {
    type: string;
    duration: number;
    delay?: number;
    easing?: string;
  };
}

const props = withDefaults(
  defineProps<{
    modelValue: AnimationConfig;
    showEntry?: boolean;
    showExit?: boolean;
    showDelay?: boolean;
    showEasing?: boolean;
    showPreviewButton?: boolean;
    customEntryOptions?: { label: string; value: string }[];
    customExitOptions?: { label: string; value: string }[];
  }>(),
  {
    showEntry: true,
    showExit: true,
    showDelay: true,
    showEasing: false,
    showPreviewButton: false,
    customEntryOptions: undefined,
    customExitOptions: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: AnimationConfig];
  preview: [];
}>();

// Options par défaut pour les animations d'entrée
const defaultEntryOptions = [
  { label: "Aucune", value: "none" },
  { label: "Fondu", value: "fade" },
  { label: "Glissement haut", value: "slide-up" },
  { label: "Glissement bas", value: "slide-down" },
  { label: "Glissement gauche", value: "slide-left" },
  { label: "Glissement droite", value: "slide-right" },
  { label: "Zoom", value: "zoom" },
  { label: "Bounce", value: "bounce" },
  { label: "Flip", value: "flip" },
  { label: "Rotation", value: "rotate" },
];

// Options par défaut pour les animations de sortie
const defaultExitOptions = [
  { label: "Aucune", value: "none" },
  { label: "Fondu", value: "fade" },
  { label: "Glissement haut", value: "slide-up" },
  { label: "Glissement bas", value: "slide-down" },
  { label: "Glissement gauche", value: "slide-left" },
  { label: "Glissement droite", value: "slide-right" },
  { label: "Zoom out", value: "zoom-out" },
  { label: "Shrink", value: "shrink" },
];

const easingOptions = [
  { label: "Linear", value: "linear" },
  { label: "Ease", value: "ease" },
  { label: "Ease In", value: "ease-in" },
  { label: "Ease Out", value: "ease-out" },
  { label: "Ease In Out", value: "ease-in-out" },
  { label: "Bounce", value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)" },
  { label: "Elastic", value: "cubic-bezier(0.68, -0.6, 0.32, 1.6)" },
];

const entryAnimationOptions = props.customEntryOptions || defaultEntryOptions;
const exitAnimationOptions = props.customExitOptions || defaultExitOptions;

const updateEntry = (key: string, value: string | number) => {
  emit("update:modelValue", {
    ...props.modelValue,
    entry: { ...props.modelValue.entry, [key]: value },
  });
};

const updateExit = (key: string, value: string | number) => {
  emit("update:modelValue", {
    ...props.modelValue,
    exit: { ...props.modelValue.exit, [key]: value },
  });
};
</script>

<style scoped>
.animation-module {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.animation-group {
  background: var(--color-neutral-100);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
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
</style>
