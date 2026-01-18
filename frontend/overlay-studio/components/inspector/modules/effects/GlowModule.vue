<template>
  <div class="glow-module">
    <!-- Enable Toggle -->
    <div class="inline-field">
      <label>Effet glow</label>
      <USwitch
        :model-value="modelValue.enabled"
        size="sm"
        @update:model-value="(v: boolean) => updateField('enabled', v)"
      />
    </div>

    <template v-if="modelValue.enabled">
      <!-- Glow Color -->
      <div class="field">
        <label>Couleur</label>
        <div class="color-input-wrapper">
          <input
            type="color"
            :value="modelValue.color"
            class="color-picker"
            @input="handleColorInput"
          />
          <UInput
            :model-value="modelValue.color"
            size="xs"
            class="color-text"
            :ui="inputUi"
            @update:model-value="(v: string | number) => updateField('color', String(v))"
          />
        </div>
      </div>

      <!-- Color Presets -->
      <div class="color-presets">
        <button
          v-for="preset in colorPresets"
          :key="preset.value"
          class="preset-color"
          :class="{ active: modelValue.color === preset.value }"
          :style="{ backgroundColor: preset.value, boxShadow: `0 0 10px ${preset.value}` }"
          :title="preset.label"
          @click="updateField('color', preset.value)"
        />
      </div>

      <!-- Intensity -->
      <div class="slider-field">
        <div class="slider-header">
          <label>Intensité</label>
          <span class="slider-value">{{ modelValue.intensity.toFixed(1) }}</span>
        </div>
        <URange
          :model-value="modelValue.intensity"
          :min="0.1"
          :max="3"
          :step="0.1"
          size="sm"
          @update:model-value="(v: number) => updateField('intensity', v)"
        />
      </div>

      <!-- Spread -->
      <div class="slider-field">
        <div class="slider-header">
          <label>Étendue</label>
          <span class="slider-value">{{ modelValue.spread }}px</span>
        </div>
        <URange
          :model-value="modelValue.spread"
          :min="5"
          :max="50"
          :step="1"
          size="sm"
          @update:model-value="(v: number) => updateField('spread', v)"
        />
      </div>

      <!-- Animation -->
      <div v-if="showAnimation" class="field">
        <label>Animation</label>
        <USelect
          :model-value="modelValue.animation || 'none'"
          :items="animationOptions"
          size="xs"
          @update:model-value="(v: string) => updateField('animation', v)"
        />
      </div>

      <!-- Animation Speed -->
      <div v-if="showAnimation && modelValue.animation && modelValue.animation !== 'none'" class="slider-field">
        <div class="slider-header">
          <label>Vitesse</label>
          <span class="slider-value">{{ (modelValue.animationSpeed || 1).toFixed(1) }}s</span>
        </div>
        <URange
          :model-value="modelValue.animationSpeed || 1"
          :min="0.5"
          :max="5"
          :step="0.1"
          size="sm"
          @update:model-value="(v: number) => updateField('animationSpeed', v)"
        />
      </div>

      <!-- Preview -->
      <div v-if="showPreview" class="glow-preview">
        <div
          class="preview-box"
          :style="previewStyle"
          :class="{ 'animate-pulse': modelValue.animation === 'pulse', 'animate-breathe': modelValue.animation === 'breathe' }"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface GlowConfig {
  enabled: boolean;
  color: string;
  intensity: number;
  spread: number;
  animation?: string;
  animationSpeed?: number;
}

const props = withDefaults(
  defineProps<{
    modelValue: GlowConfig;
    showAnimation?: boolean;
    showPreview?: boolean;
  }>(),
  {
    showAnimation: true,
    showPreview: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: GlowConfig];
}>();

const inputUi = {
  root: "ring-0 border-0 rounded-lg overflow-hidden",
  base: "px-2 py-1.5 bg-neutral-100 text-neutral-700 placeholder:text-neutral-400 rounded-lg text-xs",
};

const colorPresets = [
  { label: "Bleu néon", value: "#00d4ff" },
  { label: "Rose néon", value: "#ff00ff" },
  { label: "Vert néon", value: "#00ff88" },
  { label: "Jaune néon", value: "#ffff00" },
  { label: "Orange néon", value: "#ff8800" },
  { label: "Rouge néon", value: "#ff0044" },
  { label: "Violet néon", value: "#aa00ff" },
  { label: "Blanc", value: "#ffffff" },
  { label: "Or", value: "#ffd700" },
  { label: "Argent", value: "#c0c0c0" },
];

const animationOptions = [
  { label: "Aucune", value: "none" },
  { label: "Pulsation", value: "pulse" },
  { label: "Respiration", value: "breathe" },
  { label: "Clignotement", value: "blink" },
];

const previewStyle = computed(() => {
  const { color, intensity, spread } = props.modelValue;
  const glowSize = spread * intensity;
  return {
    boxShadow: `
      0 0 ${glowSize * 0.5}px ${color},
      0 0 ${glowSize}px ${color},
      0 0 ${glowSize * 1.5}px ${color}
    `,
    borderColor: color,
    animationDuration: `${props.modelValue.animationSpeed || 1}s`,
  };
});

const handleColorInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateField("color", target.value);
};

const updateField = <K extends keyof GlowConfig>(
  field: K,
  value: GlowConfig[K],
) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [field]: value,
  });
};
</script>

<style scoped>
.glow-module {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.inline-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.inline-field label {
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

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-picker {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-neutral-300);
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  background: transparent;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-picker::-webkit-color-swatch {
  border-radius: 4px;
  border: none;
}

.color-text {
  flex: 1;
}

.color-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.preset-color {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-color:hover {
  transform: scale(1.1);
}

.preset-color.active {
  border-color: white;
  outline: 2px solid var(--color-primary-500);
}

.glow-preview {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: #1a1a2e;
  border-radius: 8px;
}

.preview-box {
  width: 60px;
  height: 40px;
  background: #1a1a2e;
  border: 2px solid;
  border-radius: 8px;
}

.preview-box.animate-pulse {
  animation: pulse-glow var(--animation-duration, 1s) ease-in-out infinite;
}

.preview-box.animate-breathe {
  animation: breathe-glow var(--animation-duration, 1s) ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.7;
    filter: brightness(1.3);
  }
}

@keyframes breathe-glow {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>
