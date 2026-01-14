# 🌍 Sentry - Gestion des Environnements

## Comment Sentry détecte l'environnement (staging vs production)

### 📊 Résumé

Sentry utilise la variable **`ENV_SUFFIX`** pour distinguer les environnements :

| ENV_SUFFIX | Environnement Sentry | Taux de traces | Description |
|------------|---------------------|----------------|-------------|
| `prod` | **production** | Backend: 10%, Frontend: 10% | Production réelle |
| `staging` | **staging** | Backend: 100%, Frontend: 50% | Pré-production, tests |
| `dev` (ou vide) | **development** | Backend: 100%, Frontend: 100% | Développement local |

---

## 🔧 Configuration Backend

**Fichier** : [`backend/config/sentry.ts`](backend/config/sentry.ts)

```typescript
const envSuffix = env.get('ENV_SUFFIX', 'dev') // "prod", "staging", ou "dev"
const environment =
  envSuffix === 'prod' ? 'production' :
  envSuffix === 'staging' ? 'staging' :
  'development'
```

### Variables d'environnement (backend/.env)

```env
# Pour production
ENV_SUFFIX=prod
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Pour staging
ENV_SUFFIX=staging
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Pour dev (local)
ENV_SUFFIX=dev
SENTRY_DSN=  # Vide ou omis pour désactiver Sentry en dev
```

---

## 🎨 Configuration Frontend

**Fichier** : [`frontend/sentry.client.config.ts`](frontend/sentry.client.config.ts)

```typescript
const envSuffix = import.meta.env.VITE_ENV_SUFFIX || import.meta.env.ENV_SUFFIX || "dev"
const environment =
  envSuffix === "prod" ? "production" :
  envSuffix === "staging" ? "staging" :
  "development"
```

### Variables d'environnement (frontend/.env)

```env
# Pour production
ENV_SUFFIX=prod
NUXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Pour staging
ENV_SUFFIX=staging
NUXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Pour dev (local)
ENV_SUFFIX=dev
NUXT_PUBLIC_SENTRY_DSN=  # Vide pour désactiver
```

**Important** : En mode SPA (Nuxt), les variables d'environnement doivent être définies **au moment du build** via :
- Variables système : `export ENV_SUFFIX=staging`
- Fichier `.env` : `ENV_SUFFIX=staging`
- Build command : `ENV_SUFFIX=staging npm run build`

---

## 🚀 Déploiement

### Dokploy / Docker

Dans votre configuration Dokploy, définissez `ENV_SUFFIX` pour chaque environnement :

#### Production
```env
ENV_SUFFIX=prod
SENTRY_DSN=https://prod-dsn@sentry.io/xxx
NUXT_PUBLIC_SENTRY_DSN=https://prod-dsn@sentry.io/xxx
```

#### Staging
```env
ENV_SUFFIX=staging
SENTRY_DSN=https://staging-dsn@sentry.io/xxx
NUXT_PUBLIC_SENTRY_DSN=https://staging-dsn@sentry.io/xxx
```

---

## 📈 Différences de comportement par environnement

### Production (`ENV_SUFFIX=prod`)

**Backend** :
- ✅ Sentry activé
- 📊 Traces: 10% (limite les coûts)
- 🎯 Profiling: 5%
- 🔒 Filtres stricts (4xx, erreurs métier)

**Frontend** :
- ✅ Sentry activé
- 📊 Traces: 10%
- 🎬 Session Replay: 10% des sessions, 100% des erreurs
- 🔒 Filtres (réseau, extensions navigateur)

### Staging (`ENV_SUFFIX=staging`)

**Backend** :
- ✅ Sentry activé
- 📊 Traces: **100%** (capture tout pour détecter les bugs)
- 🎯 Profiling: **100%**
- 🔓 Mêmes filtres que prod

**Frontend** :
- ✅ Sentry activé
- 📊 Traces: **50%** (bon compromis entre coût et visibilité)
- 🎬 Session Replay: 10% des sessions, 100% des erreurs
- 🔓 Mêmes filtres que prod

### Development (`ENV_SUFFIX=dev`)

**Backend** :
- ⚠️ Sentry optionnel (désactivé si pas de DSN)
- 📊 Traces: 100% (si activé)
- 🎯 Profiling: 100%
- 🔓 Tous les logs visibles

**Frontend** :
- ⚠️ Sentry optionnel (désactivé si pas de DSN)
- 📊 Traces: 100%
- 🎬 Session Replay: 10% des sessions
- 🔓 Tous les logs visibles

---

## 🔍 Vérifier l'environnement détecté

### Backend

Ajoutez temporairement dans `backend/config/sentry.ts` :

```typescript
console.log('🔍 Sentry Environment:', environment)
console.log('🔍 ENV_SUFFIX:', envSuffix)
```

### Frontend

Ouvrez la console navigateur et cherchez les logs Sentry, ou ajoutez :

```typescript
console.log('🔍 Sentry Environment:', environment)
console.log('🔍 ENV_SUFFIX:', envSuffix)
```

---

## 🎯 Sur Sentry.io

### Voir les événements par environnement

1. Aller sur [sentry.io](https://sentry.io)
2. Sélectionner votre projet (backend ou frontend)
3. Cliquer sur **"Issues"**
4. Filtrer par environnement : **"environment:production"**, **"environment:staging"**, etc.

### Créer des alertes par environnement

1. **Alerts → Create Alert Rule**
2. Conditions : **"When environment is production"**
3. Actions : Notify email/Slack/Discord

**Exemple** : Alert uniquement pour les erreurs en production, pas en staging.

---

## ⚠️ Important

### Variables d'environnement vs Build-time

**Frontend (Nuxt SPA)** :
- ❌ Les variables ne sont PAS disponibles au runtime
- ✅ Les variables doivent être définies **au moment du build**
- 🔒 Elles sont "injectées" dans le bundle JavaScript généré

**Backend (Node.js)** :
- ✅ Les variables sont lues au runtime depuis `.env`
- 🔄 Peuvent être changées sans rebuild

### Recommandation pour CI/CD

Dans votre GitHub Actions ou pipeline de déploiement :

```yaml
# Production
- name: Build Frontend (Production)
  env:
    ENV_SUFFIX: prod
    NUXT_PUBLIC_SENTRY_DSN: ${{ secrets.SENTRY_DSN_FRONTEND_PROD }}
  run: npm run build

# Staging
- name: Build Frontend (Staging)
  env:
    ENV_SUFFIX: staging
    NUXT_PUBLIC_SENTRY_DSN: ${{ secrets.SENTRY_DSN_FRONTEND_STAGING }}
  run: npm run build
```

---

## 🆘 Troubleshooting

### Les erreurs apparaissent dans le mauvais environnement

**Cause** : `ENV_SUFFIX` mal configuré

**Solution** :
```bash
# Backend
cd backend
grep ENV_SUFFIX .env
# Devrait afficher: ENV_SUFFIX=prod (ou staging)

# Frontend (vérifier au build)
cd frontend
grep ENV_SUFFIX .env
# Devrait afficher: ENV_SUFFIX=prod (ou staging)
```

### Frontend affiche toujours "development"

**Cause** : Variable pas définie au moment du build

**Solution** :
```bash
# Build avec la variable explicite
ENV_SUFFIX=staging npm run build
```

### Staging et Production ont le même environnement

**Cause** : Ancienne config utilisant `NODE_ENV` (qui vaut "production" pour les deux)

**Solution** : ✅ Déjà corrigé ! On utilise maintenant `ENV_SUFFIX`

---

**Fait avec ❤️ pour Tumulte**
