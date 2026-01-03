<template>
  <div
    v-if="isLive"
    class="absolute -top-1 -right-1 flex items-center justify-center"
    :title="tooltipText"
  >
    <span class="relative flex size-4">
      <span
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
      ></span>
      <span
        class="relative inline-flex rounded-full size-4 bg-red-600 items-center justify-center"
      >
        <span class="text-[8px] font-bold text-white">LIVE</span>
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { LiveStatus } from "@/types";

const props = defineProps<{
  liveStatus?: LiveStatus | null;
}>();

const isLive = computed(() => props.liveStatus?.is_live === true);

const tooltipText = computed(() => {
  if (!props.liveStatus?.is_live) return "";
  const parts: string[] = ["En live"];
  if (props.liveStatus.game_name) {
    parts.push(`sur ${props.liveStatus.game_name}`);
  }
  if (props.liveStatus.viewer_count !== undefined) {
    parts.push(`(${props.liveStatus.viewer_count} viewers)`);
  }
  return parts.join(" ");
});
</script>
