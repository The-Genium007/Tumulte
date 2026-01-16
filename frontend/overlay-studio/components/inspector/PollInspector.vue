<template>
  <div class="poll-inspector">
    <!-- Section Style de la question -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('question')">
        <UIcon name="i-lucide-message-circle-question" class="size-4" />
        <span>Question</span>
        <UIcon
          :name="expandedSections.question ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.question" class="section-content">
        <TextModule
          :model-value="questionTextStyle"
          :show-text-transform="true"
          :show-letter-spacing="true"
          @update:model-value="handleQuestionStyleUpdate"
        />
        <ColorModule
          :model-value="props.questionStyle.color"
          label="Couleur du texte"
          @update:model-value="(v: string) => updateQuestionStyle('color', v)"
        />
      </div>
    </div>

    <!-- Section Style des options -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('options')">
        <UIcon name="i-lucide-list" class="size-4" />
        <span>Options de réponse</span>
        <UIcon
          :name="expandedSections.options ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.options" class="section-content">
        <!-- Box style -->
        <div class="field-group">
          <label class="group-label">Conteneur</label>
          <ColorModule
            :model-value="props.optionBoxStyle.backgroundColor"
            label="Couleur de fond"
            @update:model-value="(v: string) => updateOptionBoxStyle('backgroundColor', v)"
          />
          <BorderModule
            :model-value="borderModuleValue"
            @update:model-value="handleBorderUpdate"
          />
          <BorderRadiusModule
            :model-value="borderRadiusValue"
            @update:model-value="handleBorderRadiusUpdate"
          />
        </div>

        <!-- Text style -->
        <div class="field-group">
          <label class="group-label">Texte des options</label>
          <TextModule
            :model-value="optionTextStyle"
            :show-font-family="true"
            :show-text-align="false"
            @update:model-value="handleOptionTextStyleUpdate"
          />
          <ColorModule
            :model-value="props.optionTextStyle.color"
            label="Couleur"
            @update:model-value="(v: string) => updateOptionTextStyle('color', v)"
          />
        </div>

        <!-- Pourcentages -->
        <div class="field-group">
          <label class="group-label">Pourcentages</label>
          <TextModule
            :model-value="percentageTextStyle"
            :show-font-family="false"
            :show-font-weight="true"
            :show-text-align="false"
            :font-size-min="10"
            :font-size-max="32"
            @update:model-value="handlePercentageStyleUpdate"
          />
          <ColorModule
            :model-value="props.optionPercentageStyle.color"
            label="Couleur"
            @update:model-value="(v: string) => updatePercentageStyle('color', v)"
          />
        </div>

        <!-- Espacement -->
        <div class="slider-field">
          <div class="slider-header">
            <label>Espacement entre options</label>
            <span class="slider-value">{{ props.optionSpacing }}px</span>
          </div>
          <URange
            :model-value="props.optionSpacing"
            :min="0"
            :max="32"
            :step="2"
            size="sm"
            @update:model-value="(v: number) => emit('updateOptionSpacing', v)"
          />
        </div>
      </div>
    </div>

    <!-- Section Médailles / Classement -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('medals')">
        <UIcon name="i-lucide-medal" class="size-4" />
        <span>Médailles</span>
        <UIcon
          :name="expandedSections.medals ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.medals" class="section-content">
        <ColorModule
          :model-value="props.medalColors.gold"
          label="Or (1er)"
          :presets="['#ffd700', '#f59e0b', '#eab308', '#fbbf24']"
          @update:model-value="(v: string) => updateMedalColor('gold', v)"
        />
        <ColorModule
          :model-value="props.medalColors.silver"
          label="Argent (2e)"
          :presets="['#c0c0c0', '#9ca3af', '#d1d5db', '#a1a1aa']"
          @update:model-value="(v: string) => updateMedalColor('silver', v)"
        />
        <ColorModule
          :model-value="props.medalColors.bronze"
          label="Bronze (3e)"
          :presets="['#cd7f32', '#b45309', '#d97706', '#92400e']"
          @update:model-value="(v: string) => updateMedalColor('bronze', v)"
        />
        <ColorModule
          :model-value="props.medalColors.base"
          label="Autres"
          @update:model-value="(v: string) => updateMedalColor('base', v)"
        />
      </div>
    </div>

    <!-- Section Barre de progression -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('progressBar')">
        <UIcon name="i-lucide-timer" class="size-4" />
        <span>Barre de temps</span>
        <UIcon
          :name="expandedSections.progressBar ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.progressBar" class="section-content">
        <div class="slider-field">
          <div class="slider-header">
            <label>Hauteur</label>
            <span class="slider-value">{{ props.progressBar.height }}px</span>
          </div>
          <URange
            :model-value="props.progressBar.height"
            :min="2"
            :max="20"
            :step="1"
            size="sm"
            @update:model-value="(v: number) => updateProgressBar('height', v)"
          />
        </div>

        <ColorModule
          :model-value="props.progressBar.backgroundColor"
          label="Fond"
          @update:model-value="(v: string) => updateProgressBar('backgroundColor', v)"
        />

        <ColorModule
          :model-value="props.progressBar.fillColor"
          label="Remplissage"
          :presets="['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b']"
          @update:model-value="(v: string) => updateProgressBar('fillColor', v)"
        />

        <div class="inline-field">
          <label>Position</label>
          <USelect
            :model-value="props.progressBar.position"
            :items="positionOptions"
            size="xs"
            :ui="{ base: 'w-24' }"
            @update:model-value="(v: string) => updateProgressBar('position', v)"
          />
        </div>

        <div class="slider-field">
          <div class="slider-header">
            <label>Rayon de bordure</label>
            <span class="slider-value">{{ props.progressBar.borderRadius }}px</span>
          </div>
          <URange
            :model-value="props.progressBar.borderRadius"
            :min="0"
            :max="10"
            :step="1"
            size="sm"
            @update:model-value="(v: number) => updateProgressBar('borderRadius', v)"
          />
        </div>

        <div class="checkbox-field">
          <UCheckbox
            :model-value="props.progressBar.showTimeText"
            label="Afficher le temps restant"
            @update:model-value="(v: boolean | 'indeterminate') => updateProgressBar('showTimeText', v === true)"
          />
        </div>
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
        <AnimationModule
          :model-value="animationModuleValue"
          :show-easing="true"
          @update:model-value="handleAnimationUpdate"
        />

        <!-- Effets de résultat -->
        <div class="field-group">
          <label class="group-label">Résultat gagnant</label>
          <div class="slider-field">
            <div class="slider-header">
              <label>Agrandissement</label>
              <span class="slider-value">{{ props.animations.result.winnerEnlarge.scale.toFixed(2) }}x</span>
            </div>
            <URange
              :model-value="props.animations.result.winnerEnlarge.scale"
              :min="1"
              :max="1.5"
              :step="0.05"
              size="sm"
              @update:model-value="(v: number) => updateResultAnimation('winnerEnlarge', 'scale', v)"
            />
          </div>
          <div class="slider-field">
            <div class="slider-header">
              <label>Fondu perdants</label>
              <span class="slider-value">{{ Math.round(props.animations.result.loserFadeOut.opacity * 100) }}%</span>
            </div>
            <URange
              :model-value="props.animations.result.loserFadeOut.opacity"
              :min="0.1"
              :max="1"
              :step="0.05"
              size="sm"
              @update:model-value="(v: number) => updateResultAnimation('loserFadeOut', 'opacity', v)"
            />
          </div>
          <div class="slider-field">
            <div class="slider-header">
              <label>Durée affichage résultat</label>
              <span class="slider-value">{{ props.animations.result.displayDuration.toFixed(1) }}s</span>
            </div>
            <URange
              :model-value="props.animations.result.displayDuration"
              :min="1"
              :max="10"
              :step="0.5"
              size="sm"
              @update:model-value="(v: number) => emit('updateAnimations', { result: { ...props.animations.result, displayDuration: v } })"
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
          :model-value="entryAudioConfig"
          label="Son d'entrée"
          :show-preview="false"
          @update:model-value="(v) => updateEntrySound(v)"
        />
        <AudioModule
          :model-value="loopAudioConfig"
          label="Musique de fond"
          :show-preview="false"
          @update:model-value="(v) => updateLoopMusic(v)"
        />
        <AudioModule
          :model-value="resultAudioConfig"
          label="Son de résultat"
          :show-preview="false"
          @update:model-value="(v) => updateResultSound(v)"
        />
      </div>
    </div>

    <!-- Section Disposition -->
    <div class="inspector-section">
      <button class="section-header" @click="toggleSection('layout')">
        <UIcon name="i-lucide-layout-grid" class="size-4" />
        <span>Disposition</span>
        <UIcon
          :name="expandedSections.layout ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          class="size-4 ml-auto"
        />
      </button>
      <div v-show="expandedSections.layout" class="section-content">
        <div class="slider-field">
          <div class="slider-header">
            <label>Largeur maximum</label>
            <span class="slider-value">{{ props.layout.maxWidth }}px</span>
          </div>
          <URange
            :model-value="props.layout.maxWidth"
            :min="300"
            :max="800"
            :step="10"
            size="sm"
            @update:model-value="(v: number) => emit('updateLayout', { maxWidth: v })"
          />
        </div>
        <div class="slider-field">
          <div class="slider-header">
            <label>Options minimum affichées</label>
            <span class="slider-value">{{ props.layout.minOptionsToShow }}</span>
          </div>
          <URange
            :model-value="props.layout.minOptionsToShow"
            :min="2"
            :max="6"
            :step="1"
            size="sm"
            @update:model-value="(v: number) => emit('updateLayout', { minOptionsToShow: v })"
          />
        </div>
        <div class="slider-field">
          <div class="slider-header">
            <label>Options maximum affichées</label>
            <span class="slider-value">{{ props.layout.maxOptionsToShow }}</span>
          </div>
          <URange
            :model-value="props.layout.maxOptionsToShow"
            :min="2"
            :max="10"
            :step="1"
            size="sm"
            @update:model-value="(v: number) => emit('updateLayout', { maxOptionsToShow: v })"
          />
        </div>
      </div>
    </div>

    <!-- Section Prévisualisation -->
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
        <div class="field">
          <label>Question</label>
          <UInput
            :model-value="props.mockData.question"
            size="sm"
            @update:model-value="(v: string | number) => updateMockData('question', String(v))"
          />
        </div>

        <div class="slider-field">
          <div class="slider-header">
            <label>Temps restant</label>
            <span class="slider-value">{{ props.mockData.timeRemaining }}s</span>
          </div>
          <URange
            :model-value="props.mockData.timeRemaining"
            :min="0"
            :max="props.mockData.totalDuration"
            :step="1"
            size="sm"
            @update:model-value="(v: number) => updateMockData('timeRemaining', v)"
          />
        </div>

        <UButton
          color="primary"
          variant="soft"
          icon="i-lucide-play"
          label="Lancer l'aperçu"
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
  TextModule,
  BorderModule,
  BorderRadiusModule,
  AnimationModule,
  AudioModule,
  type TextStyleConfig,
  type BorderConfig,
  type BorderRadiusConfig,
  type AnimationConfig,
  type AudioConfig,
} from "./modules";
import type {
  TypographySettings,
  BoxStyleSettings,
  MedalColors,
  ProgressBarConfig,
  PollAnimationsConfig,
  PollMockData,
} from "~/overlay-studio/types";

const props = defineProps<{
  questionStyle: TypographySettings;
  optionBoxStyle: BoxStyleSettings;
  optionTextStyle: TypographySettings;
  optionPercentageStyle: TypographySettings;
  optionSpacing: number;
  medalColors: MedalColors;
  progressBar: ProgressBarConfig;
  animations: PollAnimationsConfig;
  layout: {
    maxWidth: number;
    minOptionsToShow: number;
    maxOptionsToShow: number;
  };
  mockData: PollMockData;
}>();

const emit = defineEmits<{
  updateQuestionStyle: [style: Partial<TypographySettings>];
  updateOptionBoxStyle: [style: Partial<BoxStyleSettings>];
  updateOptionTextStyle: [style: Partial<TypographySettings>];
  updatePercentageStyle: [style: Partial<TypographySettings>];
  updateOptionSpacing: [spacing: number];
  updateMedalColors: [colors: Partial<MedalColors>];
  updateProgressBar: [config: Partial<ProgressBarConfig>];
  updateAnimations: [animations: Partial<PollAnimationsConfig>];
  updateLayout: [layout: Partial<{ maxWidth: number; minOptionsToShow: number; maxOptionsToShow: number }>];
  updateMockData: [data: Partial<PollMockData>];
  playPreview: [];
}>();

// Sections collapsed/expanded state
const expandedSections = reactive({
  question: true,
  options: false,
  medals: false,
  progressBar: false,
  animations: false,
  audio: false,
  layout: false,
  preview: true,
});

const toggleSection = (section: keyof typeof expandedSections) => {
  expandedSections[section] = !expandedSections[section];
};

// Options
const positionOptions = [
  { label: "Haut", value: "top" },
  { label: "Bas", value: "bottom" },
];

// Conversions pour TextModule
const questionTextStyle = computed<TextStyleConfig>(() => ({
  fontFamily: props.questionStyle.fontFamily,
  fontSize: props.questionStyle.fontSize,
  fontWeight: props.questionStyle.fontWeight,
}));

const optionTextStyle = computed<TextStyleConfig>(() => ({
  fontFamily: props.optionTextStyle.fontFamily,
  fontSize: props.optionTextStyle.fontSize,
  fontWeight: props.optionTextStyle.fontWeight,
}));

const percentageTextStyle = computed<TextStyleConfig>(() => ({
  fontSize: props.optionPercentageStyle.fontSize,
  fontWeight: props.optionPercentageStyle.fontWeight,
}));

// Conversions pour BorderModule
const borderModuleValue = computed<BorderConfig>(() => ({
  width: props.optionBoxStyle.borderWidth,
  style: "solid",
  color: props.optionBoxStyle.borderColor,
}));

const borderRadiusValue = computed<BorderRadiusConfig>(() => ({
  topLeft: props.optionBoxStyle.borderRadius,
  topRight: props.optionBoxStyle.borderRadius,
  bottomRight: props.optionBoxStyle.borderRadius,
  bottomLeft: props.optionBoxStyle.borderRadius,
}));

// Conversion pour AnimationModule
const animationModuleValue = computed<AnimationConfig>(() => ({
  entry: {
    type: props.animations.entry.slideDirection,
    duration: props.animations.entry.animation.duration,
    delay: props.animations.entry.animation.delay,
    easing: props.animations.entry.animation.easing,
  },
  exit: {
    type: "fade",
    duration: props.animations.exit.animation.duration,
    delay: props.animations.exit.animation.delay,
    easing: props.animations.exit.animation.easing,
  },
}));

// Conversions pour AudioModule
const entryAudioConfig = computed<AudioConfig>(() => ({
  enabled: props.animations.entry.sound.enabled,
  volume: props.animations.entry.sound.volume,
}));

const loopAudioConfig = computed<AudioConfig>(() => ({
  enabled: props.animations.loop.music.enabled,
  volume: props.animations.loop.music.volume,
}));

const resultAudioConfig = computed<AudioConfig>(() => ({
  enabled: props.animations.result.sound.enabled,
  volume: props.animations.result.sound.volume,
}));

// Handlers
const handleQuestionStyleUpdate = (value: TextStyleConfig) => {
  emit("updateQuestionStyle", {
    fontFamily: value.fontFamily,
    fontSize: value.fontSize,
    fontWeight: value.fontWeight,
  });
};

const updateQuestionStyle = (key: keyof TypographySettings, value: string | number) => {
  emit("updateQuestionStyle", { [key]: value });
};

const handleOptionTextStyleUpdate = (value: TextStyleConfig) => {
  emit("updateOptionTextStyle", {
    fontFamily: value.fontFamily,
    fontSize: value.fontSize,
    fontWeight: value.fontWeight,
  });
};

const updateOptionTextStyle = (key: keyof TypographySettings, value: string | number) => {
  emit("updateOptionTextStyle", { [key]: value });
};

const handlePercentageStyleUpdate = (value: TextStyleConfig) => {
  emit("updatePercentageStyle", {
    fontSize: value.fontSize,
    fontWeight: value.fontWeight,
  });
};

const updatePercentageStyle = (key: keyof TypographySettings, value: string | number) => {
  emit("updatePercentageStyle", { [key]: value });
};

const updateOptionBoxStyle = (key: keyof BoxStyleSettings, value: string | number) => {
  emit("updateOptionBoxStyle", { [key]: value });
};

const handleBorderUpdate = (value: BorderConfig) => {
  emit("updateOptionBoxStyle", {
    borderWidth: value.width,
    borderColor: value.color,
  });
};

const handleBorderRadiusUpdate = (value: BorderRadiusConfig) => {
  // Utilise la valeur du coin supérieur gauche (uniforme)
  emit("updateOptionBoxStyle", { borderRadius: value.topLeft });
};

const updateMedalColor = (key: keyof MedalColors, value: string) => {
  emit("updateMedalColors", { [key]: value });
};

const updateProgressBar = (key: keyof ProgressBarConfig, value: string | number | boolean) => {
  emit("updateProgressBar", { [key]: value });
};

const handleAnimationUpdate = (value: AnimationConfig) => {
  emit("updateAnimations", {
    entry: {
      ...props.animations.entry,
      slideDirection: value.entry.type as "up" | "down" | "left" | "right",
      animation: {
        duration: value.entry.duration,
        delay: value.entry.delay || 0,
        easing: (value.entry.easing as "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out") || "ease-out",
      },
    },
    exit: {
      animation: {
        duration: value.exit.duration,
        delay: value.exit.delay || 0,
        easing: (value.exit.easing as "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out") || "ease-in",
      },
    },
  });
};

const updateResultAnimation = (
  effect: "winnerEnlarge" | "loserFadeOut",
  key: string,
  value: number,
) => {
  emit("updateAnimations", {
    result: {
      ...props.animations.result,
      [effect]: {
        ...props.animations.result[effect],
        [key]: value,
      },
    },
  });
};

const updateEntrySound = (value: AudioConfig) => {
  emit("updateAnimations", {
    entry: {
      ...props.animations.entry,
      sound: { enabled: value.enabled, volume: value.volume },
    },
  });
};

const updateLoopMusic = (value: AudioConfig) => {
  emit("updateAnimations", {
    loop: {
      music: { enabled: value.enabled, volume: value.volume },
    },
  });
};

const updateResultSound = (value: AudioConfig) => {
  emit("updateAnimations", {
    result: {
      ...props.animations.result,
      sound: { enabled: value.enabled, volume: value.volume },
    },
  });
};

const updateMockData = (key: keyof PollMockData, value: string | number | string[] | number[]) => {
  emit("updateMockData", { [key]: value });
};
</script>

<style scoped>
.poll-inspector {
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
  margin-bottom: 0.25rem;
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

/* Checkbox fields */
.checkbox-field {
  padding: 0.25rem 0;
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
</style>
