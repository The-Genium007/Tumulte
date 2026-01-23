import { useCookieConsentStore } from '@/stores/cookieConsent'

/**
 * Plugin d'initialisation du consentement aux cookies
 *
 * Ce plugin s'execute au demarrage de l'application (cote client uniquement)
 * et initialise le store de consentement depuis localStorage.
 *
 * Le store determine automatiquement si la banniere doit etre affichee
 * en fonction de l'existence et de la version du consentement stocke.
 */
export default defineNuxtPlugin(() => {
  const consentStore = useCookieConsentStore()

  // Initialiser le store depuis localStorage
  consentStore.initialize()

  // Fournir un acces global pour les autres plugins
  return {
    provide: {
      cookieConsent: {
        /** Verifie si les cookies analytiques sont autorises */
        isAnalyticsAllowed: () => consentStore.analyticsAllowed,
        /** Verifie si les cookies marketing sont autorises */
        isMarketingAllowed: () => consentStore.marketingAllowed,
        /** Affiche la banniere de consentement */
        showBanner: () => consentStore.showBanner(),
      },
    },
  }
})
