<template>
  <div class="border-radius-module">
    <!-- Mode Toggle -->
    <div class="mode-toggle">
      <button
        class="mode-button"
        :class="{ active: !individualCornersEnabled }"
        @click="individualCornersEnabled = false"
      >
        <UIcon name="i-lucide-square" class="size-4" />
        <span>Uniforme</span>
      </button>
      <button
        class="mode-button"
        :class="{ active: individualCornersEnabled }"
        @click="individualCornersEnabled = true"
      >
        <UIcon name="i-lucide-scan" class="size-4" />
        <span>Coins</span>
      </button>
    </div>

    <!-- Uniform Radius -->
    <div v-if="!individualCornersEnabled" class="slider-field">
      <div class="slider-header">
        <label>Rayon</label>
        <span class="slider-value">{{ uniformRadius }}px</span>
      </div>
      <URange
        :model-value="uniformRadius"
        :min="0"
        :max="maxRadius"
        :step="1"
        size="sm"
        @update:model-value="updateUniformRadius"
      />
    </div>

    <!-- Individual Corners -->
    <div v-else class="corners-grid">
      <div class="corner-field top-left">
        <UInput
          :model-value="modelValue.topLeft"
          type="number"
          size="xs"
          :min="0"
          :max="maxRadius"
          :ui="cornerInputUi"
          @update:model-value="(v: string | number) => updateCorner('topLeft', Number(v))"
        />
      </div>
      <div class="corner-field top-right">
        <UInput
          :model-value="modelValue.topRight"
          type="number"
          size="xs"
          :min="0"
          :max="maxRadius"
          :ui="cornerInputUi"
          @update:model-value="(v: string | number) => updateCorner('topRight', Number(v))"
        />
      </div>
      <div class="preview-center">
        <div
          class="preview-box"
          :style="previewStyle"
        />
      </div>
      <div class="corner-field bottom-left">
        <UInput
          :model-value="modelValue.bottomLeft"
          type="number"
          size="xs"
          :min="0"
          :max="maxRadius"
          :ui="cornerInputUi"
          @update:model-value="(v: string | number) => updateCorner('bottomLeft', Number(v))"
        />
      </div>
      <div class="corner-field bottom-right">
        <UInput
          :model-value="modelValue.bottomRight"
          type="number"
          size="xs"
          :min="0"
          :max="maxRadius"
          :ui="cornerInputUi"
          @update:model-value="(v: string | number) => updateCorner('bottomRight', Number(v))"
        />
      </div>
    </div>

    <!-- Quick Presets -->
    <div v-if="showPresets" class="presets">
      <button
        v-for="preset in presets"
        :key="preset.label"
        class="preset-button"
        :class="{ active: isPresetActive(preset) }"
        @click="applyPreset(preset)"
      >
        <div class="preset-preview" :style="preset.style" />
        <span>{{ preset.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

export interface BorderRadiusConfig {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

interface RadiusPreset {
  label: string;
  values: BorderRadiusConfig;
  style: Record<string, string>;
}

const props = withDefaults(
  defineProps<{
    modelValue: BorderRadiusConfig;
    maxRadius?: number;
    showPresets?: boolean;
  }>(),
  {
    maxRadius: 50,
    showPresets: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: BorderRadiusConfig];
}>();

const individualCornersEnabled = ref(false);

const cornerInputUi = {
  root: "w-14",
  base: "text-center text-xs",
};

const presets: RadiusPreset[] = [
  {
    label: "Carré",
    values: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
    style: { borderRadius: "0" },
  },
  {
    label: "Léger",
    values: { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4 },
    style: { borderRadius: "4px" },
  },
  {
    label: "Moyen",
    values: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 },
    style: { borderRadius: "8px" },
  },
  {
    label: "Arrondi",
    values: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 },
    style: { borderRadius: "16px" },
  },
  {
    label: "Pill",
    values: { topLeft: 50, topRight: 50, bottomRight: 50, bottomLeft: 50 },
    style: { borderRadius: "50px" },
  },
];

const uniformRadius = computed(() => {
  const { topLeft, topRight, bottomRight, bottomLeft } = props.modelValue;
  // Retourne la valeur si tous les coins sont égaux, sinon la moyenne
  if (topLeft === topRight && topRight === bottomRight && bottomRight === bottomLeft) {
    return topLeft;
  }
  return Math.round((topLeft + topRight + bottomRight + bottomLeft) / 4);
});

const previewStyle = computed(() => ({
  borderTopLeftRadius: `${props.modelValue.topLeft}px`,
  borderTopRightRadius: `${props.modelValue.topRight}px`,
  borderBottomRightRadius: `${props.modelValue.bottomRight}px`,
  borderBottomLeftRadius: `${props.modelValue.bottomLeft}px`,
}));

const updateUniformRadius = (value: number) => {
  emit("update:modelValue", {
    topLeft: value,
    topRight: value,
    bottomRight: value,
    bottomLeft: value,
  });
};

const updateCorner = (corner: keyof BorderRadiusConfig, value: number) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [corner]: Math.max(0, Math.min(value, props.maxRadius)),
  });
};

const isPresetActive = (preset: RadiusPreset) => {
  const { topLeft, topRight, bottomRight, bottomLeft } = props.modelValue;
  return (
    topLeft === preset.values.topLeft &&
    topRight === preset.values.topRight &&
    bottomRight === preset.values.bottomRight &&
    bottomLeft === preset.values.bottomLeft
  );
};

const applyPreset = (preset: RadiusPreset) => {
  emit("update:modelValue", { ...preset.values });
};
</script>

<style scoped>
.border-radius-module {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mode-toggle {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: var(--color-neutral-100);
  border-radius: 8px;
}

.mode-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.mode-button:hover {
  color: var(--color-text-primary);
}

.mode-button.active {
  background: white;
  color: var(--color-text-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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

.corners-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto auto auto;
  gap: 0.5rem;
  align-items: center;
  justify-items: center;
}

.corner-field.top-left {
  grid-column: 1;
  grid-row: 1;
}

.corner-field.top-right {
  grid-column: 3;
  grid-row: 1;
}

.preview-center {
  grid-column: 2;
  grid-row: 2;
  padding: 0.5rem;
}

.corner-field.bottom-left {
  grid-column: 1;
  grid-row: 3;
}

.corner-field.bottom-right {
  grid-column: 3;
  grid-row: 3;
}

.preview-box {
  width: 48px;
  height: 32px;
  background: var(--color-primary-500);
  transition: border-radius 0.15s ease;
}

.presets {
  display: flex;
  gap: 0.375rem;
  flex-wrap: wrap;
}

.preset-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: 1px solid var(--color-neutral-200);
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-button:hover {
  border-color: var(--color-neutral-300);
  background: var(--color-neutral-50);
}

.preset-button.active {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.preset-preview {
  width: 24px;
  height: 16px;
  background: var(--color-neutral-400);
}

.preset-button span {
  font-size: 0.625rem;
  color: var(--color-text-muted);
}

.preset-button.active span {
  color: var(--color-primary-600);
}
</style>
