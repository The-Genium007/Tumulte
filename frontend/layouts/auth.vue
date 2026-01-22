<template>
  <div class="min-h-screen bg-subtle flex flex-col">
    <main class="flex-1 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-md">
        <!-- Lien retour accueil - aligné à gauche au-dessus de la carte -->
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-4"
        >
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          Retour à l'accueil
        </NuxtLink>

        <slot />
      </div>
    </main>
  </div>
</template>
