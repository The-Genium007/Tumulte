export default defineNuxtPlugin(() => {
  // Ne charger qu'en client
  if (process.client) {
    // Charger le script (en prod seulement si tu veux)
    if (process.env.NODE_ENV === 'production') {
      const s = document.createElement('script')
      s.defer = true
      s.setAttribute('data-website-id', '07e569f4-6e75-445b-9db9-51a821f38d5b')
      s.src = 'https://zerocase-umami-2548df-51-83-45-107.traefik.me/script.js'
      document.head.appendChild(s)
    }

    // Après chaque route, appeler Umami si disponible (SPA)
    const router = useRouter()
    router.afterEach((to) => {
      // window.umami est fourni par le script Umami une fois chargé
      if (typeof (window as any).umami === 'function') {
        try {
          ;(window as any).umami('trackView', to.fullPath || to.path)
        } catch {
          ;(window as any).umami('pageview', to.fullPath || to.path)
        }
      }
    })
  }
})
