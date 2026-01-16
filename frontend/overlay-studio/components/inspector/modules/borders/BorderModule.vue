<template>
  <div class="border-module">
    <!-- Border Width -->
    <div class="slider-field">
      <div class="slider-header">
        <label>Épaisseur</label>
        <span class="slider-value">{{ modelValue.width }}px</span>
      </div>
      <URange
        :model-value="modelValue.width"
        :min="0"
        :max="20"
        :step="1"
        size="sm"
        @update:model-value="(v: number) => updateField('width', v)"
      />
    </div>

    <!-- Border Style -->
    <div v-if="modelValue.width > 0" class="field">
      <label>Style</label>
      <USelect
        :model-value="modelValue.style"
        :items="borderStyleOptions"
        size="xs"
        @update:model-value="(v: string) => updateField('style', v as BorderStyle)"
      />
    </div>

    <!-- Border Color -->
    <div v-if="modelValue.width > 0" class="field">
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

    <!-- Individual Sides Toggle -->
    <div v-if="showIndividualSides && modelValue.width > 0" class="inline-field">
      <label>Côtés individuels</label>
      <USwitch
        :model-value="individualSidesEnabled"
        size="sm"
        @update:model-value="toggleIndividualSides"
      />
    </div>

    <!-- Individual Sides -->
    <div v-if="individualSidesEnabled && modelValue.width > 0" class="individual-sides">
      <div v-for="side in sides" :key="side.key" class="side-field">
        <div class="side-header">
          <UIcon :name="side.icon" class="size-3" />
          <span>{{ side.label }}</span>
        </div>
        <URange
          :model-value="modelValue[side.key as keyof BorderConfig] as number || modelValue.width"
          :min="0"
          :max="20"
          :step="1"
          size="sm"
          @update:model-value="(v: number) => updateField(side.key as keyof BorderConfig, v)"
        />
      </div>
    </div>

    <!-- Preview -->
    <div v-if="showPreview && modelValue.width > 0" class="border-preview">
      <div
        class="preview-box"
        :style="previewStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type BorderStyle = "solid" | "dashed" | "dotted" | "double" | "none";

export interface BorderConfig {
  width: number;
  style: BorderStyle;
  color: string;
  topWidth?: number;
  rightWidth?: number;
  bottomWidth?: number;
  leftWidth?: number;
}

const props = withDefaults(
  defineProps<{
    modelValue: BorderConfig;
    showIndividualSides?: boolean;
    showPreview?: boolean;
  }>(),
  {
    showIndividualSides: false,
    showPreview: true,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: BorderConfig];
}>();

const inputUi = {
  root: "ring-0 border-0 rounded-lg overflow-hidden",
  base: "px-2 py-1.5 bg-neutral-100 text-neutral-700 placeholder:text-neutral-400 rounded-lg text-xs",
};

const individualSidesEnabled = ref(false);

const borderStyleOptions = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Double", value: "double" },
];

const sides = [
  { key: "topWidth", label: "Haut", icon: "i-lucide-arrow-up" },
  { key: "rightWidth", label: "Droite", icon: "i-lucide-arrow-right" },
  { key: "bottomWidth", label: "Bas", icon: "i-lucide-arrow-down" },
  { key: "leftWidth", label: "Gauche", icon: "i-lucide-arrow-left" },
];

const previewStyle = computed(() => {
  const { width, style, color, topWidth, rightWidth, bottomWidth, leftWidth } = props.modelValue;

  if (individualSidesEnabled.value) {
    return {
      borderTopWidth: `${topWidth ?? width}px`,
      borderRightWidth: `${rightWidth ?? width}px`,
      borderBottomWidth: `${bottomWidth ?? width}px`,
      borderLeftWidth: `${leftWidth ?? width}px`,
      borderStyle: style,
      borderColor: color,
    };
  }

  return {
    borderWidth: `${width}px`,
    borderStyle: style,
    borderColor: color,
  };
});

const handleColorInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  updateField("color", target.value);
};

const toggleIndividualSides = (enabled: boolean) => {
  individualSidesEnabled.value = enabled;
  if (enabled) {
    // Initialiser les côtés individuels avec la valeur globale
    emit("update:modelValue", {
      ...props.modelValue,
      topWidth: props.modelValue.width,
      rightWidth: props.modelValue.width,
      bottomWidth: props.modelValue.width,
      leftWidth: props.modelValue.width,
    });
  }
};

const updateField = <K extends keyof BorderConfig>(
  field: K,
  value: BorderConfig[K],
) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [field]: value,
  });
};
</script>

<style scoped>
.border-module {
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

.individual-sides {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--color-neutral-100);
  border-radius: 8px;
}

.side-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.side-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.625rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.border-preview {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--color-neutral-100);
  border-radius: 8px;
}

.preview-box {
  width: 60px;
  height: 40px;
  background: var(--color-neutral-200);
  border-radius: 4px;
}
</style>
