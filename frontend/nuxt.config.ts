export default defineNuxtConfig({
  compatibilityDate: "2024-12-11",

  future: {
    compatibilityVersion: 4,
  },

  modules: ["@nuxt/ui", "@pinia/nuxt"],

  icon: {
    provider: "iconify",
    serverBundle: {
      collections: ["lucide", "heroicons", "simple-icons"],
    },
  },

  devtools: { enabled: true },

  // Global CSS
  css: ["~/assets/css/main.css"],

  // Proxy API configuration
  nitro: {
    devProxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        prependPath: true,
      },
    },
  },

  // Development server configuration
  devServer: {
    port: 3000,
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
});
