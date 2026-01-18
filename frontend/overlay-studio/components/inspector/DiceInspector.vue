<template>
  <div class="dice-inspector">
    <!-- Section Couleurs -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('colors')">
        <UIcon name="i-lucide-palette" class="size-4" />
        <span>Couleurs</span>
        <UIcon
          :name="expandedSections.colors ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.colors" class="section-content">
        <ColorModule
          :model-value="props.colors.baseColor"
          label="Couleur de base"
          @update:model-value="(v: string) => updateColor('baseColor', v)"
        />
        <ColorModule
          :model-value="props.colors.numberColor"
          label="Couleur des numéros"
          @update:model-value="(v: string) => updateColor('numberColor', v)"
        />
        <ColorModule
          :model-value="props.colors.criticalSuccessGlow"
          label="Glow critique succès"
          :presets="['#22c55e', '#10b981', '#34d399', '#4ade80']"
          @update:model-value="(v: string) => updateColor('criticalSuccessGlow', v)"
        />
        <ColorModule
          :model-value="props.colors.criticalFailureGlow"
          label="Glow critique échec"
          :presets="['#ef4444', '#dc2626', '#f87171', '#fb923c']"
          @update:model-value="(v: string) => updateColor('criticalFailureGlow', v)"
        />
      </div>
    </div>

    <!-- Section Animations -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('animations')">
        <UIcon name="i-lucide-sparkles" class="size-4" />
        <span>Animations</span>
        <UIcon
          :name="expandedSections.animations ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.animations" class="section-content">
        <div class="field-group">
          <label class="group-label">Entrée</label>
          <div class="inline-field">
            <label>Type</label>
            <USelect
              :model-value="props.animations.entry.type"
              :items="entryTypes"
              size="xs"
              :ui="{ base: 'w-24' }"
              @update:model-value="(v: string) => updateAnimationEntry('type', v)"
            />
          </div>
          <div class="slider-field">
            <div class="slider-header">
              <label>Durée</label>
              <span class="slider-value">{{ props.animations.entry.duration.toFixed(1) }}s</span>
            </div>
            <URange
              :model-value="props.animations.entry.duration"
              :min="0.1"
              :max="2"
              :step="0.1"
              size="sm"
              @update:model-value="(v: number) => updateAnimationEntry('duration', v)"
            />
          </div>
        </div>

        <div class="field-group">
          <label class="group-label">Sortie</label>
          <div class="inline-field">
            <label>Type</label>
            <USelect
              :model-value="props.animations.exit.type"
              :items="exitTypes"
              size="xs"
              :ui="{ base: 'w-24' }"
              @update:model-value="(v: string) => updateAnimationExit('type', v)"
            />
          </div>
          <div class="slider-field">
            <div class="slider-header">
              <label>Durée</label>
              <span class="slider-value">{{ props.animations.exit.duration.toFixed(1) }}s</span>
            </div>
            <URange
              :model-value="props.animations.exit.duration"
              :min="0.1"
              :max="2"
              :step="0.1"
              size="sm"
              @update:model-value="(v: number) => updateAnimationExit('duration', v)"
            />
          </div>
          <div class="slider-field">
            <div class="slider-header">
              <label>Délai</label>
              <span class="slider-value">{{ props.animations.exit.delay.toFixed(1) }}s</span>
            </div>
            <URange
              :model-value="props.animations.exit.delay"
              :min="0"
              :max="5"
              :step="0.1"
              size="sm"
              @update:model-value="(v: number) => updateAnimationExit('delay', v)"
            />
          </div>
        </div>

        <div class="field-group">
          <label class="group-label">Résultat</label>
          <div class="slider-field">
            <div class="slider-header">
              <label>Intensité glow</label>
              <span class="slider-value">{{ props.animations.result.glowIntensity.toFixed(1) }}</span>
            </div>
            <URange
              :model-value="props.animations.result.glowIntensity"
              :min="0"
              :max="2"
              :step="0.1"
              size="sm"
              @update:model-value="(v: number) => updateAnimationResult('glowIntensity', v)"
            />
          </div>
          <div class="slider-field">
            <div class="slider-header">
              <label>Durée glow</label>
              <span class="slider-value">{{ props.animations.result.glowDuration.toFixed(1) }}s</span>
            </div>
            <URange
              :model-value="props.animations.result.glowDuration"
              :min="0.5"
              :max="5"
              :step="0.1"
              size="sm"
              @update:model-value="(v: number) => updateAnimationResult('glowDuration', v)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Section Audio -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('audio')">
        <UIcon name="i-lucide-volume-2" class="size-4" />
        <span>Audio</span>
        <UIcon
          :name="expandedSections.audio ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.audio" class="section-content">
        <AudioModule
          :model-value="rollSoundConfig"
          label="Son de lancer"
          :show-preview="false"
          @update:model-value="(v: AudioConfig) => updateAudioFromModule('rollSound', v)"
        />
        <AudioModule
          :model-value="criticalSuccessSoundConfig"
          label="Son critique succès"
          :show-preview="false"
          @update:model-value="(v: AudioConfig) => updateAudioFromModule('criticalSuccessSound', v)"
        />
        <AudioModule
          :model-value="criticalFailureSoundConfig"
          label="Son critique échec"
          :show-preview="false"
          @update:model-value="(v: AudioConfig) => updateAudioFromModule('criticalFailureSound', v)"
        />
      </div>
    </div>

    <!-- Section Texte résultat -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('resultText')">
        <UIcon name="i-lucide-type" class="size-4" />
        <span>Texte résultat</span>
        <UIcon
          :name="expandedSections.resultText ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.resultText" class="section-content">
        <div class="inline-field">
          <label>Afficher le résultat</label>
          <USwitch
            :model-value="props.resultText.enabled"
            size="sm"
            @update:model-value="(v: boolean) => updateResultText('enabled', v)"
          />
        </div>
        <template v-if="props.resultText.enabled">
          <!-- Typography using TextModule -->
          <TextModule
            :model-value="resultTextTypographyConfig"
            :show-font-family="true"
            :show-font-size="true"
            :show-font-weight="true"
            :show-text-align="false"
            :font-size-min="12"
            :font-size-max="72"
            @update:model-value="updateResultTextFromModule"
          />
          <!-- Color using ColorModule -->
          <ColorModule
            :model-value="props.resultText.typography.color"
            label="Couleur du texte"
            :presets="['#ffffff', '#ffff00', '#00ff00', '#ff0000']"
            @update:model-value="(v: string) => updateResultTextTypography('color', v)"
          />
          <!-- Offset Y -->
          <div class="slider-field">
            <div class="slider-header">
              <label>Décalage Y</label>
              <span class="slider-value">{{ props.resultText.offsetY }}px</span>
            </div>
            <URange
              :model-value="props.resultText.offsetY"
              :min="-100"
              :max="100"
              :step="1"
              size="sm"
              @update:model-value="(v: number) => updateResultText('offsetY', v)"
            />
          </div>
          <!-- Display Duration -->
          <div class="slider-field">
            <div class="slider-header">
              <label>Durée affichage</label>
              <span class="slider-value">{{ props.resultText.persistDuration.toFixed(1) }}s</span>
            </div>
            <URange
              :model-value="props.resultText.persistDuration"
              :min="1"
              :max="10"
              :step="0.5"
              size="sm"
              @update:model-value="(v: number) => updateResultText('persistDuration', v)"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- Section Preview (Mock Data) -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('preview')">
        <UIcon name="i-lucide-play" class="size-4" />
        <span>Prévisualisation</span>
        <UIcon
          :name="expandedSections.preview ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.preview" class="section-content">
        <!-- Type de dé -->
        <div class="inline-field">
          <label>Type de dé</label>
          <USelect
            v-model="previewDiceType"
            :items="diceTypeOptions"
            size="xs"
            :ui="{ base: 'w-24' }"
          />
        </div>

        <!-- Nombre de dés -->
        <div class="slider-field">
          <div class="slider-header">
            <label>Nombre de dés</label>
            <span class="slider-value">{{ previewDiceCount }}</span>
          </div>
          <URange
            v-model="previewDiceCount"
            :min="1"
            :max="10"
            :step="1"
            size="sm"
          />
        </div>

        <!-- Résultat attendu avec min/max dynamiques -->
        <div class="slider-field">
          <div class="slider-header">
            <label>Résultat attendu</label>
            <span class="slider-value">{{ currentTotalResult }}</span>
          </div>
          <div class="result-range-info">
            <span class="range-min">min: {{ resultMin }}</span>
            <span class="range-max">max: {{ resultMax }}</span>
          </div>
          <URange
            :model-value="currentTotalResult"
            :min="resultMin"
            :max="resultMax"
            :step="1"
            size="sm"
            @update:model-value="(v: number) => updateTotalResult(v)"
          />
        </div>

        <!-- Affichage formule générée -->
        <div class="formula-display">
          <UIcon name="i-lucide-function-square" class="size-4 text-neutral-400" />
          <span class="formula-text">{{ props.mockData.rollFormula }}</span>
          <span v-if="props.mockData.isCritical" class="critical-badge" :class="props.mockData.criticalType">
            {{ props.mockData.criticalType === 'success' ? '🎯 Critique !' : '💀 Échec critique' }}
          </span>
        </div>

        <!-- Détails des dés (si plusieurs) -->
        <div v-if="props.mockData.diceValues.length > 1" class="dice-values-display">
          <span
            v-for="(value, index) in props.mockData.diceValues"
            :key="index"
            class="dice-value-chip"
          >
            {{ value }}
          </span>
          <span class="dice-total">= {{ currentTotalResult }}</span>
        </div>

        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-dice-5"
          label="Lancer les dés"
          size="sm"
          block
          class="mt-3"
          @click="emit('playPreview')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from "vue";
import {
  ColorModule,
  AudioModule,
  TextModule,
  type AudioConfig,
  type TextStyleConfig,
} from "./modules";
import type {
  DiceColorConfig,
  DiceAnimationsConfig,
  DiceAudioConfig,
  DiceResultTextConfig,
  DiceMockData,
  DiceType,
} from "~/overlay-studio/types";

const props = defineProps<{
  colors: DiceColorConfig;
  animations: DiceAnimationsConfig;
  audio: DiceAudioConfig;
  resultText: DiceResultTextConfig;
  mockData: DiceMockData;
}>();

const emit = defineEmits<{
  updateColors: [colors: Partial<DiceColorConfig>];
  updateAnimations: [animations: Partial<DiceAnimationsConfig>];
  updateAudio: [audio: Partial<DiceAudioConfig>];
  updateResultText: [resultText: Partial<DiceResultTextConfig>];
  updateMockData: [mockData: Partial<DiceMockData>];
  playPreview: [];
}>();

// Sections collapsed/expanded state
const expandedSections = reactive({
  colors: true,
  animations: false,
  audio: false,
  resultText: false,
  preview: true,
});

const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section];
};

// Options pour les selects
const entryTypes = [
  { label: "Drop", value: "drop" },
  { label: "Throw", value: "throw" },
  { label: "Appear", value: "appear" },
];

const exitTypes = [
  { label: "Fade", value: "fade" },
  { label: "Fall", value: "fall" },
];

// Options de types de dés avec leur valeur maximale
const diceTypeOptions: { label: string; value: DiceType; maxValue: number }[] = [
  { label: "d4", value: "d4", maxValue: 4 },
  { label: "d6", value: "d6", maxValue: 6 },
  { label: "d8", value: "d8", maxValue: 8 },
  { label: "d10", value: "d10", maxValue: 10 },
  { label: "d12", value: "d12", maxValue: 12 },
  { label: "d20", value: "d20", maxValue: 20 },
];

// État local pour les contrôles de prévisualisation
const previewDiceType = computed({
  get: () => props.mockData.diceTypes[0] || "d20",
  set: (value: DiceType) => {
    const diceCount = props.mockData.diceTypes.length || 1;
    const newTypes = Array(diceCount).fill(value) as DiceType[];
    const maxVal = getDiceMaxValue(value);
    // Recalculer les valeurs pour que le total reste dans les bornes
    const currentTotal = computeTotalResult();
    const newMin = diceCount;
    const newMax = diceCount * maxVal;
    const clampedTotal = Math.min(Math.max(currentTotal, newMin), newMax);
    const newValues = distributeTotal(clampedTotal, diceCount, maxVal);
    emit("updateMockData", {
      diceTypes: newTypes,
      diceValues: newValues,
      rollFormula: `${diceCount}${value}`,
    });
  },
});

const previewDiceCount = computed({
  get: () => props.mockData.diceTypes.length || 1,
  set: (value: number) => {
    const diceType = props.mockData.diceTypes[0] || "d20";
    const newTypes = Array(value).fill(diceType) as DiceType[];
    const maxVal = getDiceMaxValue(diceType);
    // Distribuer le total actuel sur le nouveau nombre de dés
    const currentTotal = computeTotalResult();
    const newMin = value;
    const newMax = value * maxVal;
    const clampedTotal = Math.min(Math.max(currentTotal, newMin), newMax);
    const newValues = distributeTotal(clampedTotal, value, maxVal);
    emit("updateMockData", {
      diceTypes: newTypes,
      diceValues: newValues,
      rollFormula: `${value}${diceType}`,
    });
  },
});

// Calculs min/max dynamiques
const resultMin = computed(() => {
  const count = props.mockData.diceTypes.length || 1;
  return count;
});

const resultMax = computed(() => {
  const diceType = props.mockData.diceTypes[0] || "d20";
  const count = props.mockData.diceTypes.length || 1;
  const maxVal = getDiceMaxValue(diceType);
  return count * maxVal;
});

const currentTotalResult = computed(() => {
  return props.mockData.diceValues.reduce((sum, val) => sum + val, 0);
});

// ===== Audio Module Adapters =====
// Convert DiceAudioConfig (enabled, volume) to AudioConfig format for AudioModule
const rollSoundConfig = computed<AudioConfig>(() => ({
  enabled: props.audio.rollSound.enabled,
  volume: props.audio.rollSound.volume,
}));

const criticalSuccessSoundConfig = computed<AudioConfig>(() => ({
  enabled: props.audio.criticalSuccessSound.enabled,
  volume: props.audio.criticalSuccessSound.volume,
}));

const criticalFailureSoundConfig = computed<AudioConfig>(() => ({
  enabled: props.audio.criticalFailureSound.enabled,
  volume: props.audio.criticalFailureSound.volume,
}));

const updateAudioFromModule = (
  soundKey: keyof DiceAudioConfig,
  config: AudioConfig,
) => {
  emit("updateAudio", {
    [soundKey]: { enabled: config.enabled, volume: config.volume },
  });
};

// ===== Result Text Typography Adapter =====
// Convert TypographySettings to TextStyleConfig for TextModule
const resultTextTypographyConfig = computed<TextStyleConfig>(() => ({
  fontFamily: props.resultText.typography.fontFamily,
  fontSize: props.resultText.typography.fontSize,
  fontWeight: props.resultText.typography.fontWeight,
}));

const updateResultTextFromModule = (config: TextStyleConfig) => {
  emit("updateResultText", {
    typography: {
      ...props.resultText.typography,
      ...(config.fontFamily !== undefined && { fontFamily: config.fontFamily }),
      ...(config.fontSize !== undefined && { fontSize: config.fontSize }),
      ...(config.fontWeight !== undefined && { fontWeight: config.fontWeight }),
    },
  });
};

// Fonctions utilitaires
function getDiceMaxValue(diceType: DiceType): number {
  const option = diceTypeOptions.find((opt) => opt.value === diceType);
  return option?.maxValue || parseInt(diceType.slice(1), 10);
}

function computeTotalResult(): number {
  return props.mockData.diceValues.reduce((sum, val) => sum + val, 0);
}

/**
 * Distribue un total sur N dés de manière réaliste
 * Essaie de garder les valeurs proches entre elles
 */
function distributeTotal(total: number, diceCount: number, maxPerDie: number): number[] {
  const values: number[] = [];
  let remaining = total;

  for (let i = 0; i < diceCount; i++) {
    const diceLeft = diceCount - i;
    // Valeur minimale pour ce dé (assure que les dés restants peuvent atteindre leur minimum)
    const minForThis = Math.max(1, remaining - (diceLeft - 1) * maxPerDie);
    // Valeur maximale pour ce dé (assure que les dés restants peuvent atteindre leur minimum)
    const maxForThis = Math.min(maxPerDie, remaining - (diceLeft - 1));
    // Valeur idéale (répartition équitable)
    const idealValue = Math.round(remaining / diceLeft);
    // Clamp à la valeur possible
    const value = Math.min(Math.max(idealValue, minForThis), maxForThis);
    values.push(value);
    remaining -= value;
  }

  return values;
}

/**
 * Met à jour le résultat total et distribue sur les dés
 */
function updateTotalResult(newTotal: number) {
  const diceType = props.mockData.diceTypes[0] || "d20";
  const count = props.mockData.diceTypes.length || 1;
  const maxVal = getDiceMaxValue(diceType);
  const newValues = distributeTotal(newTotal, count, maxVal);

  // Déterminer si c'est un critique
  const isCriticalSuccess = newTotal === count * maxVal;
  const isCriticalFailure = newTotal === count;

  emit("updateMockData", {
    diceValues: newValues,
    isCritical: isCriticalSuccess || isCriticalFailure,
    criticalType: isCriticalSuccess ? "success" : isCriticalFailure ? "failure" : null,
  });
}

// Update handlers
const updateColor = (key: keyof DiceColorConfig, value: string) => {
  emit("updateColors", { [key]: value });
};

const updateAnimationEntry = (key: string, value: string | number) => {
  emit("updateAnimations", {
    entry: { ...props.animations.entry, [key]: value },
  });
};

const updateAnimationExit = (key: string, value: string | number) => {
  emit("updateAnimations", {
    exit: { ...props.animations.exit, [key]: value },
  });
};

const updateAnimationResult = (key: string, value: number) => {
  emit("updateAnimations", {
    result: { ...props.animations.result, [key]: value },
  });
};

const updateResultText = (key: string, value: boolean | number) => {
  emit("updateResultText", { [key]: value });
};

const updateResultTextTypography = (key: string, value: string | number) => {
  emit("updateResultText", {
    typography: { ...props.resultText.typography, [key]: value },
  });
};
</script>

<style scoped>
.dice-inspector {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.inspector-section {
  border-bottom: 1px solid var(--color-neutral-200);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.section-header:hover {
  background: var(--color-neutral-100);
}

.section-content {
  padding: 0 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Slider fields */
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

/* Field groups */
.field-group {
  background: var(--color-neutral-100);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Inline fields */
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

/* Generic field */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* Preview section - result range info */
.result-range-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.625rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.range-min,
.range-max {
  font-variant-numeric: tabular-nums;
}

/* Formula display */
.formula-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-neutral-100);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  margin-top: 0.5rem;
}

.formula-text {
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.critical-badge {
  font-size: 0.625rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  margin-left: auto;
}

.critical-badge.success {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(22, 163, 74);
}

.critical-badge.failure {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(220, 38, 38);
}

/* Dice values display */
.dice-values-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.dice-value-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 0.375rem;
  background: var(--color-primary-100);
  color: var(--color-primary-600);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.dice-total {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-left: 0.25rem;
}
</style>
