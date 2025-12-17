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
  app: {
    head: {
      script: [
        {
          // Charger le script Umami dans le HTML initial (préférer HTTPS)
          src: 'https://zerocase-umami-2548df-51-83-45-107.traefik.me/script.js',
          defer: true,
          'data-website-id': '07e569f4-6e75-445b-9db9-51a821f38d5b'
        }
      ]
    }
  },
});
