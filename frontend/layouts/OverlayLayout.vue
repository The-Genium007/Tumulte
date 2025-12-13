<template>
  <div class="overlay-layout">
    <slot />
  </div>
</template>

<style scoped>
.overlay-layout {
  width: 100vw;
  height: 100vh;
  background: transparent;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Ensure transparency for OBS overlay */
:deep(body),
:deep(html),
:deep(#app) {
  background: transparent !important;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
