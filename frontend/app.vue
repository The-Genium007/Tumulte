<template>
  <UApp>
    <UiLoadingScreen :is-visible="isLoading" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
// Force light mode - no dark mode allowed
const colorMode = useColorMode()
colorMode.preference = 'light'

const { isLoading, init } = useLoadingScreen()
init()
</script>
