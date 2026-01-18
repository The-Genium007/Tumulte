<template>
  <div class="text-module">
    <!-- Font Family -->
    <div v-if="showFontFamily" class="field">
      <label>Police</label>
      <USelect
        :model-value="modelValue.fontFamily"
        :items="fontFamilyOptions"
        size="xs"
        @update:model-value="(v: string) => updateField('fontFamily', v)"
      />
    </div>

    <!-- Font Size -->
    <div v-if="showFontSize" class="slider-field">
      <div class="slider-header">
        <label>Taille</label>
        <span class="slider-value">{{ modelValue.fontSize }}{{ fontSizeUnit }}</span>
      </div>
      <URange
        :model-value="modelValue.fontSize"
        :min="fontSizeMin"
        :max="fontSizeMax"
        :step="fontSizeStep"
        size="sm"
        @update:model-value="(v: number) => updateField('fontSize', v)"
      />
    </div>

    <!-- Font Weight -->
    <div v-if="showFontWeight" class="field">
      <label>Graisse</label>
      <USelect
        :model-value="modelValue.fontWeight"
        :items="fontWeightOptions"
        size="xs"
        @update:model-value="(v: string | number) => updateField('fontWeight', Number(v))"
      />
    </div>

    <!-- Text Transform -->
    <div v-if="showTextTransform" class="field">
      <label>Casse</label>
      <div class="button-group">
        <button
          v-for="option in textTransformOptions"
          :key="option.value"
          class="toggle-button"
          :class="{ active: modelValue.textTransform === option.value }"
          :title="option.label"
          @click="updateField('textTransform', option.value)"
        >
          <UIcon :name="option.icon" class="size-4" />
        </button>
      </div>
    </div>

    <!-- Letter Spacing -->
    <div v-if="showLetterSpacing" class="slider-field">
      <div class="slider-header">
        <label>Espacement lettres</label>
        <span class="slider-value">{{ modelValue.letterSpacing?.toFixed(2) || '0.00' }}em</span>
      </div>
      <URange
        :model-value="modelValue.letterSpacing || 0"
        :min="-0.1"
        :max="0.5"
        :step="0.01"
        size="sm"
        @update:model-value="(v: number) => updateField('letterSpacing', v)"
      />
    </div>

    <!-- Line Height -->
    <div v-if="showLineHeight" class="slider-field">
      <div class="slider-header">
        <label>Hauteur de ligne</label>
        <span class="slider-value">{{ modelValue.lineHeight?.toFixed(1) || '1.5' }}</span>
      </div>
      <URange
        :model-value="modelValue.lineHeight || 1.5"
        :min="0.8"
        :max="3"
        :step="0.1"
        size="sm"
        @update:model-value="(v: number) => updateField('lineHeight', v)"
      />
    </div>

    <!-- Text Align -->
    <div v-if="showTextAlign" class="field">
      <label>Alignement</label>
      <div class="button-group">
        <button
          v-for="option in textAlignOptions"
          :key="option.value"
          class="toggle-button"
          :class="{ active: modelValue.textAlign === option.value }"
          :title="option.label"
          @click="updateField('textAlign', option.value)"
        >
          <UIcon :name="option.icon" class="size-4" />
        </button>
      </div>
    </div>

    <!-- Font Style (italic) -->
    <div v-if="showFontStyle" class="inline-field">
      <label>Italique</label>
      <USwitch
        :model-value="modelValue.fontStyle === 'italic'"
        size="sm"
        @update:model-value="(v: boolean) => updateField('fontStyle', v ? 'italic' : 'normal')"
      />
    </div>

    <!-- Text Decoration -->
    <div v-if="showTextDecoration" class="field">
      <label>Décoration</label>
      <div class="button-group">
        <button
          v-for="option in textDecorationOptions"
          :key="option.value"
          class="toggle-button"
          :class="{ active: modelValue.textDecoration === option.value }"
          :title="option.label"
          @click="updateField('textDecoration', option.value)"
        >
          <UIcon :name="option.icon" class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TextStyleConfig {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
}

const props = withDefaults(
  defineProps<{
    modelValue: TextStyleConfig;
    showFontFamily?: boolean;
    showFontSize?: boolean;
    showFontWeight?: boolean;
    showTextTransform?: boolean;
    showLetterSpacing?: boolean;
    showLineHeight?: boolean;
    showTextAlign?: boolean;
    showFontStyle?: boolean;
    showTextDecoration?: boolean;
    fontSizeMin?: number;
    fontSizeMax?: number;
    fontSizeStep?: number;
    fontSizeUnit?: string;
  }>(),
  {
    showFontFamily: true,
    showFontSize: true,
    showFontWeight: true,
    showTextTransform: false,
    showLetterSpacing: false,
    showLineHeight: false,
    showTextAlign: true,
    showFontStyle: false,
    showTextDecoration: false,
    fontSizeMin: 8,
    fontSizeMax: 72,
    fontSizeStep: 1,
    fontSizeUnit: "px",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: TextStyleConfig];
}>();

// Options pour les fonts - liste curatée de polices web-safe + Google Fonts populaires
const fontFamilyOptions = [
  // Sans-serif modernes
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Roboto", value: "Roboto, sans-serif" },
  { label: "Open Sans", value: "'Open Sans', sans-serif" },
  { label: "Montserrat", value: "Montserrat, sans-serif" },
  { label: "Poppins", value: "Poppins, sans-serif" },
  { label: "Nunito", value: "Nunito, sans-serif" },
  // Sans-serif system
  { label: "System UI", value: "system-ui, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  // Serif
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  // Monospace
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { label: "Fira Code", value: "'Fira Code', monospace" },
  { label: "Monospace", value: "ui-monospace, monospace" },
  // Display / Gaming
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif" },
  { label: "Oswald", value: "Oswald, sans-serif" },
  { label: "Bangers", value: "Bangers, cursive" },
  { label: "Press Start 2P", value: "'Press Start 2P', cursive" },
];

const fontWeightOptions = [
  { label: "Thin (100)", value: 100 },
  { label: "Light (300)", value: 300 },
  { label: "Regular (400)", value: 400 },
  { label: "Medium (500)", value: 500 },
  { label: "Semibold (600)", value: 600 },
  { label: "Bold (700)", value: 700 },
  { label: "Extrabold (800)", value: 800 },
  { label: "Black (900)", value: 900 },
];

const textTransformOptions = [
  { label: "Normal", value: "none" as const, icon: "i-lucide-minus" },
  { label: "MAJUSCULES", value: "uppercase" as const, icon: "i-lucide-arrow-up" },
  { label: "minuscules", value: "lowercase" as const, icon: "i-lucide-arrow-down" },
  { label: "Capitalize", value: "capitalize" as const, icon: "i-lucide-type" },
];

const textAlignOptions = [
  { label: "Gauche", value: "left" as const, icon: "i-lucide-align-left" },
  { label: "Centre", value: "center" as const, icon: "i-lucide-align-center" },
  { label: "Droite", value: "right" as const, icon: "i-lucide-align-right" },
  { label: "Justifié", value: "justify" as const, icon: "i-lucide-align-justify" },
];

const textDecorationOptions = [
  { label: "Aucune", value: "none" as const, icon: "i-lucide-minus" },
  { label: "Souligné", value: "underline" as const, icon: "i-lucide-underline" },
  { label: "Barré", value: "line-through" as const, icon: "i-lucide-strikethrough" },
];

const updateField = <K extends keyof TextStyleConfig>(
  field: K,
  value: TextStyleConfig[K],
) => {
  emit("update:modelValue", {
    ...props.modelValue,
    [field]: value,
  });
};
</script>

<style scoped>
.text-module {
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

.button-group {
  display: flex;
  gap: 0.25rem;
  background: var(--color-neutral-100);
  border-radius: 6px;
  padding: 0.25rem;
}

.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
}

.toggle-button:hover {
  background: var(--color-neutral-200);
  color: var(--color-text-primary);
}

.toggle-button.active {
  background: var(--color-primary-500);
  color: white;
}
</style>
