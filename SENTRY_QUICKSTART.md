# 🚀 Sentry - Guide de Démarrage Rapide

## ✅ Ce qui a été fait

### 1. Backend mis à jour vers Sentry v10
- ✅ `@sentry/node` v8.42.0 → v10.33.0
- ✅ Nouvelles intégrations ajoutées :
  - `captureConsoleIntegration` : Capture automatique des console.error/warn
  - `contextLinesIntegration` : Plus de contexte autour des erreurs
  - `extraErrorDataIntegration` : Données d'erreur enrichies
  - `httpIntegration` : Tracking automatique des requêtes HTTP sortantes
- ✅ Profiling activé (5% en production)
- ✅ Filtrage des données sensibles dans les breadcrumbs
- ✅ Tags globaux ajoutés (`app.component: backend`)

### 2. Frontend déjà à jour
- ✅ `@sentry/nuxt` v10.33.0
- ✅ Session Replay activé (10% des sessions, 100% des sessions avec erreur)
- ✅ Filtrage des erreurs non pertinentes (réseau, extensions navigateur)

### 3. Scripts de test créés
- ✅ Backend : `backend/scripts/test-sentry.ts`
- ✅ Frontend : `frontend/pages/test-sentry.vue`
- ✅ Nouveau script npm : `npm run test:sentry`

---

## 🎯 Étapes suivantes (à faire)

### 1. Obtenir vos DSN sur Sentry.io

1. **Créer un compte** : [sentry.io/signup](https://sentry.io/signup/)
2. **Créer 2 projets** :
   - **Backend** : Platform "Node.js" → Nom "tumulte-backend"
   - **Frontend** : Platform "Vue" → Nom "tumulte-frontend"
3. **Copier les 2 DSN** (format : `https://xxx@xxx.ingest.sentry.io/xxx`)

### 2. Configurer les variables d'environnement

#### Backend : `backend/.env`
```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx  # DSN backend
APP_VERSION=0.3.0
```

#### Frontend : `frontend/.env`
```env
NUXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx  # DSN frontend
```

### 3. Tester que ça fonctionne

#### Test Backend
```bash
cd backend
npm run test:sentry
```

**Attendu** : 5 erreurs + 3 messages sur Sentry dans 1-2 minutes

#### Test Frontend
```bash
cd frontend
npm run dev
# Ouvrir http://localhost:3000/test-sentry
# Cliquer sur les boutons de test
```

**Attendu** : 6 erreurs/messages sur Sentry dans 1-2 minutes

### 4. Vérifier sur Sentry.io

1. Aller sur [sentry.io](https://sentry.io)
2. Sélectionner votre projet (backend ou frontend)
3. Aller dans **"Issues"**
4. Vous devriez voir les erreurs de test apparaître

---

## 📖 Documentation complète

Pour le guide complet (configuration avancée, alertes, troubleshooting), voir :
👉 **[SENTRY_SETUP.md](./SENTRY_SETUP.md)**

---

## 🔍 Vérification rapide

### Backend configuré ?
```bash
cd backend
grep SENTRY_DSN .env
# Devrait afficher : SENTRY_DSN=https://...
```

### Frontend configuré ?
```bash
cd frontend
grep NUXT_PUBLIC_SENTRY_DSN .env
# Devrait afficher : NUXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 🆘 Problème ?

**Les erreurs n'apparaissent pas ?**
1. ✅ Vérifier que le DSN est bien configuré dans `.env`
2. ✅ Redémarrer le serveur après avoir modifié `.env`
3. ✅ Vérifier dans les logs qu'il n'y a pas d'erreur de connexion à Sentry
4. ✅ Attendre 1-2 minutes (délai normal de propagation)

**Autres problèmes ?**
Voir la section [Troubleshooting](./SENTRY_SETUP.md#5-troubleshooting) dans SENTRY_SETUP.md

---

## 📊 Nouvelles fonctionnalités de Sentry v10

### Backend
- 🎯 **Profiling** : Identifie les ralentissements de code
- 📝 **Capture automatique des logs** : console.error/warn capturés
- 🌐 **HTTP tracking** : Toutes les requêtes HTTP sortantes tracées
- 🔒 **Filtrage des secrets** : Tokens, passwords, etc. automatiquement masqués

### Frontend
- 🎬 **Session Replay** : Voir exactement ce que l'utilisateur a fait avant l'erreur
- 📱 **PWA Support** : Fonctionne même en mode offline
- 🎨 **Source maps** : Code source original dans les stack traces

---

**Fait avec ❤️ pour Tumulte**
