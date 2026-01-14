# Guide de Configuration Sentry pour Tumulte

## 📋 Table des matières

1. [Configuration sur Sentry.io](#1-configuration-sur-sentryio)
2. [Configuration Projet (Backend + Frontend)](#2-configuration-projet-backend--frontend)
3. [Scripts de Test](#3-scripts-de-test)
4. [Monitoring et Alertes](#4-monitoring-et-alertes)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Configuration sur Sentry.io

### 1.1 Créer un compte et une organisation

1. **Aller sur [sentry.io](https://sentry.io/signup/)**
2. **Créer un compte** (GitHub OAuth recommandé)
3. **Créer une organisation** : `tumulte` ou votre nom

### 1.2 Créer les projets

#### Projet Backend (Node.js)

1. Cliquer sur **"Create Project"**
2. Sélectionner plateforme : **"Node.js"**
3. Nom du projet : `tumulte-backend`
4. Alert frequency : **"Default"** (you can customize later)
5. Assign team : **Sélectionner votre équipe**
6. **Copier le DSN** affiché (format : `https://xxx@xxx.ingest.sentry.io/xxx`)

#### Projet Frontend (Nuxt/Vue)

1. Cliquer sur **"Create Project"**
2. Sélectionner plateforme : **"Vue"**
3. Nom du projet : `tumulte-frontend`
4. Alert frequency : **"Default"**
5. Assign team : **Sélectionner votre équipe**
6. **Copier le DSN** affiché

### 1.3 Configurer les environnements

Pour **chaque projet** (backend + frontend) :

1. Aller dans **Settings → Environments**
2. Ajouter les environnements suivants :
   - `production`
   - `staging`
   - `development`

### 1.4 Créer un Auth Token pour le CI/CD

Pour uploader les source maps automatiquement :

1. Aller dans **Settings → Account → Auth Tokens**
2. Cliquer sur **"Create New Token"**
3. **Scopes** à cocher :
   - ✅ `project:read`
   - ✅ `project:releases`
   - ✅ `org:read`
4. **Nom** : `tumulte-ci-cd`
5. **Copier le token** (vous ne pourrez plus le revoir !)

### 1.5 Configurer les Alerts (recommandé)

#### Backend Alerts

1. Aller dans **Alerts → Create Alert Rule**
2. **Type** : Issues
3. **Conditions** :
   - When an event is first seen
   - When events happen more than 10 times in 1 minute
4. **Actions** :
   - Send a notification to **your email**
   - (Optionnel) Send to Slack/Discord webhook

#### Frontend Alerts

1. Même configuration que backend
2. **Ajouter une règle spécifique** pour les erreurs JavaScript :
   - Condition : `error.type` equals `TypeError` OR `ReferenceError`
   - Action : Notify immediately

### 1.6 Activer Session Replay (Frontend uniquement)

1. Aller dans **Settings → Session Replay**
2. **Enable Session Replay** : ✅ ON
3. **Sample Rate** : 10% (déjà configuré dans le code)
4. **Privacy Settings** :
   - Block all text : ❌ (on a besoin de voir les erreurs)
   - Mask all inputs : ✅ (sécurité)

---

## 2. Configuration Projet (Backend + Frontend)

### 2.1 Backend - Variables d'environnement

Éditer `/backend/.env` :

```env
# Sentry Backend
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx  # DSN du projet backend
APP_VERSION=0.3.0  # Version actuelle
```

**Important** : Ne jamais commiter le fichier `.env` avec le DSN !

### 2.2 Frontend - Variables d'environnement

Éditer `/frontend/.env` :

```env
# Sentry Frontend
NUXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx  # DSN du projet frontend

# Pour CI/CD (GitHub Actions) - Upload des source maps
SENTRY_ORG=tumulte  # Nom de votre organisation Sentry
SENTRY_PROJECT=tumulte-frontend  # Nom du projet frontend
SENTRY_AUTH_TOKEN=xxx  # Token créé à l'étape 1.4
```

### 2.3 Configuration GitHub Actions (CI/CD)

Si vous utilisez GitHub Actions pour déployer, ajoutez les secrets :

1. Aller dans **Settings → Secrets and variables → Actions**
2. Ajouter les secrets suivants :
   - `SENTRY_AUTH_TOKEN` : Token créé à l'étape 1.4
   - `NUXT_PUBLIC_SENTRY_DSN` : DSN du projet frontend
   - `SENTRY_DSN` : DSN du projet backend

---

## 3. Scripts de Test

### 3.1 Test Backend

Créer un script de test pour vérifier que Sentry fonctionne :

```bash
cd backend
node --loader ts-node-maintained/esm scripts/test-sentry.ts
```

**Contenu de `backend/scripts/test-sentry.ts`** :

```typescript
import '#config/sentry'
import { Sentry } from '#config/sentry'

console.log('🧪 Test Sentry Backend...\n')

// Test 1: Erreur simple
console.log('1️⃣ Test erreur simple')
Sentry.captureException(new Error('Test erreur backend depuis le script'))

// Test 2: Erreur avec contexte
console.log('2️⃣ Test erreur avec contexte')
Sentry.setUser({
  id: '123',
  username: 'test-user',
})
Sentry.setTag('test', 'true')
Sentry.captureException(new Error('Test avec contexte utilisateur'))

// Test 3: Message custom
console.log('3️⃣ Test message custom')
Sentry.captureMessage('Test message backend', 'info')

// Test 4: Console error (doit être capturé automatiquement)
console.log('4️⃣ Test console.error (auto-capture)')
console.error('Test console.error backend')

console.log('\n✅ Tests envoyés ! Vérifiez sur sentry.io dans 1-2 minutes.')
console.log('🔗 https://sentry.io/organizations/YOUR_ORG/issues/?project=YOUR_PROJECT_ID')

// Attendre que les événements soient envoyés
setTimeout(() => {
  console.log('🏁 Terminé !')
  process.exit(0)
}, 2000)
```

### 3.2 Test Frontend

Créer une page de test dans le frontend :

**Créer `frontend/pages/test-sentry.vue`** :

```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-8">
    <div class="max-w-2xl w-full bg-white rounded-lg shadow p-8">
      <h1 class="text-2xl font-bold mb-6">🧪 Tests Sentry Frontend</h1>

      <div class="space-y-4">
        <button
          @click="testSimpleError"
          class="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          1️⃣ Test erreur simple
        </button>

        <button
          @click="testErrorWithContext"
          class="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          2️⃣ Test erreur avec contexte utilisateur
        </button>

        <button
          @click="testMessage"
          class="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          3️⃣ Test message info
        </button>

        <button
          @click="testConsoleError"
          class="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          4️⃣ Test console.error
        </button>

        <button
          @click="testUncaughtError"
          class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          5️⃣ Test erreur non catchée (crash)
        </button>
      </div>

      <div v-if="lastResult" class="mt-6 p-4 bg-gray-100 rounded">
        <p class="font-semibold">Dernier test :</p>
        <p class="text-sm text-gray-600">{{ lastResult }}</p>
      </div>

      <p class="mt-6 text-sm text-gray-500 text-center">
        Vérifiez les erreurs sur
        <a href="https://sentry.io" target="_blank" class="text-blue-500 underline">
          sentry.io
        </a>
        dans 1-2 minutes
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sentry } from '~/sentry.client.config'

const lastResult = ref('')

const testSimpleError = () => {
  Sentry.captureException(new Error('Test erreur frontend simple'))
  lastResult.value = '✅ Erreur simple envoyée'
}

const testErrorWithContext = () => {
  Sentry.setUser({
    id: '123',
    username: 'test-user',
  })
  Sentry.setTag('test', 'true')
  Sentry.captureException(new Error('Test erreur frontend avec contexte'))
  lastResult.value = '✅ Erreur avec contexte envoyée'
}

const testMessage = () => {
  Sentry.captureMessage('Test message frontend', 'info')
  lastResult.value = '✅ Message info envoyé'
}

const testConsoleError = () => {
  console.error('Test console.error frontend')
  lastResult.value = '✅ Console error (devrait être auto-capturé si configuré)'
}

const testUncaughtError = () => {
  // Déclencher une vraie erreur non catchée
  setTimeout(() => {
    throw new Error('Test erreur non catchée frontend')
  }, 100)
  lastResult.value = '💥 Erreur non catchée déclenchée (crash imminent)'
}
</script>
```

**Pour tester :**

```bash
cd frontend
npm run dev
# Ouvrir http://localhost:3000/test-sentry
```

### 3.3 Test via curl (Backend API)

```bash
# Déclencher une erreur 500 sur une route inexistante
curl -X POST http://localhost:3333/api/test-error \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 4. Monitoring et Alertes

### 4.1 Dashboard recommandé

Sur Sentry.io, créer un dashboard personnalisé :

1. **Aller dans Dashboards → Create Dashboard**
2. **Nom** : `Tumulte Overview`
3. **Ajouter les widgets suivants** :
   - **Number of Errors** (backend + frontend)
   - **Error Rate** (backend + frontend)
   - **Affected Users** (backend + frontend)
   - **Top 5 Errors** (backend + frontend)
   - **Performance Overview** (temps de réponse backend)

### 4.2 Alertes Discord (optionnel)

Si vous voulez recevoir les alertes dans Discord :

1. **Créer un webhook Discord** :
   - Discord → Paramètres Serveur → Intégrations → Webhooks
   - Créer un webhook et copier l'URL

2. **Configurer dans Sentry** :
   - Aller dans Settings → Integrations
   - Chercher "Discord"
   - Ajouter l'URL du webhook

---

## 5. Troubleshooting

### 5.1 Les erreurs n'apparaissent pas sur Sentry

**Vérifications :**

1. ✅ Le DSN est bien configuré dans `.env`
2. ✅ La variable d'environnement est bien chargée : `echo $SENTRY_DSN`
3. ✅ Sentry est bien initialisé au démarrage (vérifier les logs)
4. ✅ L'erreur n'est pas filtrée par `ignoreErrors` ou `beforeSend`
5. ✅ Le firewall/proxy ne bloque pas les requêtes vers `ingest.sentry.io`

**Test rapide :**

```bash
# Backend
cd backend
node --loader ts-node-maintained/esm -e "import '#config/sentry'; import { Sentry } from '#config/sentry'; Sentry.captureMessage('test'); setTimeout(() => {}, 2000)"

# Frontend (dans la console navigateur)
Sentry.captureMessage('test frontend')
```

### 5.2 Trop d'événements envoyés (quota dépassé)

**Solutions :**

1. **Augmenter les filtres** dans `ignoreErrors`
2. **Réduire le `tracesSampleRate`** (backend : 0.05 au lieu de 0.1)
3. **Ajouter plus de conditions** dans `beforeSend`

### 5.3 Source maps non uploadées (frontend)

**Vérifications :**

1. ✅ `SENTRY_AUTH_TOKEN` configuré dans `.env` et GitHub Secrets
2. ✅ `SENTRY_ORG` et `SENTRY_PROJECT` corrects
3. ✅ Le build production génère bien les source maps

**Test manuel :**

```bash
cd frontend
npm run build
npx @sentry/cli sourcemaps upload --org=YOUR_ORG --project=YOUR_PROJECT dist/
```

### 5.4 Erreurs 4xx capturées (alors qu'elles ne devraient pas)

Notre configuration filtre déjà les 4xx. Si elles apparaissent quand même :

**Vérifier que `beforeSend` est bien exécuté** :

```typescript
beforeSend(event, hint) {
  console.log('beforeSend called:', hint.originalException)
  // ... reste du code
}
```

---

## 📊 Résumé de la Configuration

### Backend

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `tracesSampleRate` | 0.1 (prod) | 10% des transactions tracées |
| `profilesSampleRate` | 0.05 (prod) | 5% de profiling |
| Intégrations | console, context, http | Capture auto des logs et requêtes |
| Filtres | 4xx, erreurs métier | Évite le bruit |

### Frontend

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `tracesSampleRate` | 0.1 (prod) | 10% des transactions tracées |
| `replaysSessionSampleRate` | 0.1 | 10% des sessions enregistrées |
| `replaysOnErrorSampleRate` | 1.0 | 100% des sessions avec erreur |
| Filtres | Réseau, extensions | Évite le bruit |

---

## 📚 Ressources

- [Documentation Sentry Node.js](https://docs.sentry.io/platforms/javascript/guides/node/)
- [Documentation Sentry Nuxt](https://docs.sentry.io/platforms/javascript/guides/nuxt/)
- [Migration v10](https://docs.sentry.io/platforms/javascript/guides/node/migration/v9-to-v10/)
- [Best Practices](https://docs.sentry.io/platforms/javascript/best-practices/)

---

**Fait avec ❤️ pour Tumulte**
