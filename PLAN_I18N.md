# Plan d'Internationalisation (i18n) - Tumulte

## Vue d'Ensemble

Mise en place d'un système de traduction multi-langues pour Tumulte avec gestion dynamique via interface admin.

---

## Décisions Techniques

| Aspect | Choix |
|--------|-------|
| **Langues initiales** | Français + Anglais (100% traduits) |
| **Langue par défaut / fallback** | Anglais (si une traduction manque, on affiche l'anglais) |
| **Détection automatique** | Via le header `Accept-Language` du navigateur |
| **Persistance du choix** | Cookie `tumulte_locale` |
| **URLs** | Propres, sans `/fr` ou `/en` (stratégie `no_prefix`) |
| **Sélecteur de langue** | Header (UserMenu) + Footer |
| **Stockage des traductions** | Base de données PostgreSQL |
| **Interface de gestion** | Page admin `/admin/translations` |
| **Organisation** | Par namespace |
| **Module Nuxt** | `@nuxtjs/i18n` |

---

## Comment ça Fonctionne

### 1. Détection de Langue (Première Visite)

```
Utilisateur visite tumulte.app
         │
         ▼
Le navigateur envoie: Accept-Language: fr-FR, fr;q=0.9, en;q=0.8
         │
         ▼
Le module i18n:
  1. Choisit "fr" (meilleure correspondance)
  2. Crée un cookie: tumulte_locale=fr
  3. Charge les traductions françaises
```

### 2. Visites Suivantes (Lecture du Cookie)

```
Utilisateur revient sur tumulte.app
         │
         ▼
Le navigateur envoie: Cookie: tumulte_locale=fr
         │
         ▼
Le module i18n:
  1. Lit le cookie → "fr"
  2. Ignore le header Accept-Language
  3. Charge directement les traductions françaises
```

### 3. Changement de Langue Manuel

```
L'utilisateur clique sur "English"
         │
         ▼
Le code JavaScript:
  1. Met à jour le cookie: tumulte_locale=en
  2. Charge les traductions anglaises
  3. Réaffiche la page (sans rechargement complet)
```

---

## Syntaxe dans le Code Vue

### Avant (texte en dur)

```vue
<template>
  <h1>Mes Campagnes</h1>
  <p>Vous n'avez pas encore de campagne.</p>
  <button>Créer une campagne</button>
</template>
```

### Après (avec clés de traduction)

```vue
<template>
  <h1>{{ $t('mj.campaigns.title') }}</h1>
  <p>{{ $t('mj.campaigns.empty') }}</p>
  <button>{{ $t('mj.campaigns.create') }}</button>
</template>
```

La fonction `$t()` :
1. Prend une clé (ex: `'mj.campaigns.title'`)
2. Regarde la langue active (ex: `'fr'`)
3. Retourne la traduction correspondante

---

## Organisation des Namespaces

| Namespace | Contenu | Chargement |
|-----------|---------|------------|
| `common` | Boutons, erreurs, navigation, messages génériques | Toujours |
| `landing` | Page d'accueil publique | Landing uniquement |
| `auth` | Login, register, erreurs d'authentification | Pages auth |
| `mj` | Interface Game Master (campagnes, sondages, etc.) | Pages MJ |
| `streamer` | Interface Streamer (invitations, overlay, etc.) | Pages Streamer |
| `admin` | Interface Admin (métriques, traductions, etc.) | Pages Admin |

---

## Architecture Technique

### Structure des Fichiers

```
Backend (AdonisJS)
├── app/models/translation.ts                         # Modèle Translation
├── app/services/translation_service.ts               # Service avec cache Redis
├── app/controllers/translations_controller.ts        # API publique GET
├── app/controllers/admin/translations_controller.ts  # CRUD admin
├── database/migrations/xxx_create_translations_table.ts

Frontend (Nuxt)
├── i18n/
│   ├── index.ts                    # Config chargement dynamique
│   └── fallback/                   # Fallback JSON locaux (si API échoue)
│       ├── fr.json
│       └── en.json
├── pages/admin/
│   └── translations.vue            # Interface admin traductions
├── components/
│   └── LocaleSwitcher.vue          # Sélecteur de langue
├── composables/
│   └── useAdminTranslations.ts     # Composable pour l'admin
```

### Schéma Base de Données

```sql
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,           -- ex: 'mj.campaigns.title'
  locale VARCHAR(10) NOT NULL,         -- ex: 'fr', 'en'
  value TEXT NOT NULL,                 -- ex: 'Mes Campagnes'
  namespace VARCHAR(50) NOT NULL,      -- ex: 'mj', 'common'
  description TEXT,                    -- Contexte pour le traducteur
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(key, locale)                  -- Une seule traduction par clé/langue
);
```

### API Routes

#### Routes Publiques (lecture)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/translations/:locale` | GET | Toutes les traductions d'une locale |
| `/api/translations/:locale/:namespace` | GET | Traductions par namespace |

#### Routes Admin (écriture)

| Route | Méthode | Description |
|-------|---------|-------------|
| `/admin/translations` | GET | Liste toutes les clés avec statut |
| `/admin/translations` | POST | Créer/modifier une traduction |
| `/admin/translations/:id` | DELETE | Supprimer une traduction |
| `/admin/translations/export` | GET | Export JSON complet |
| `/admin/translations/import` | POST | Import bulk JSON |

---

## Configuration Nuxt

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    // ... autres modules
  ],

  i18n: {
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français' },
      { code: 'en', language: 'en-US', name: 'English' },
    ],
    defaultLocale: 'en',              // Anglais par défaut (fallback)
    strategy: 'no_prefix',            // URLs sans /fr ou /en

    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'tumulte_locale',
      cookieSecure: true,
      fallbackLocale: 'en',
      redirectOn: 'root',
    },

    lazy: true,                       // Chargement à la demande
  },
})
```

---

## Interface Admin

```
┌─────────────────────────────────────────────────────────────────────┐
│  Admin > Traductions                                    [+ Ajouter] │
├─────────────────────────────────────────────────────────────────────┤
│  Namespace: [Tous ▼]  Recherche: [________________]                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┬─────────────────────┬─────────────────────┐   │
│  │ Clé             │ English             │ Français            │   │
│  ├─────────────────┼─────────────────────┼─────────────────────┤   │
│  │ mj.camps.title  │ [My Campaigns     ] │ [Mes Campagnes    ] │   │
│  │ mj.camps.empty  │ [You don't have...] │ [Vous n'avez pas..] │   │
│  │ mj.camps.create │ [Create a campaign] │ [Créer une campag.] │   │
│  │ common.save     │ [Save             ] │ [Enregistrer      ] │   │
│  │ common.cancel   │ [Cancel           ] │ [Annuler          ] │   │
│  └─────────────────┴─────────────────────┴─────────────────────┘   │
│                                                                     │
│  Légende: 🟢 Complet  🔴 Traduction manquante                       │
│                                                                     │
│  [Exporter JSON]  [Importer JSON]                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Fonctionnalités

- **Vue tableau** : Toutes les clés avec leurs traductions côte à côte
- **Édition inline** : Modifier directement dans le tableau
- **Filtres** : Par namespace, par statut (complet/incomplet)
- **Recherche** : Dans les clés et les valeurs
- **Indicateurs visuels** : Traductions manquantes en rouge
- **Import/Export** : JSON pour backup et migration

---

## Sélecteur de Langue

### Emplacement

1. **Header** : Dans le UserMenu (accès rapide pour utilisateurs connectés)
2. **Footer** : Pour la landing page et accès global

### Apparence

```
┌──────────────────┐
│ 🇬🇧 English  ▼  │
├──────────────────┤
│ 🇬🇧 English  ✓  │
│ 🇫🇷 Français    │
└──────────────────┘
```

---

## Ordre d'Implémentation

### Phase 1 : Backend

1. [ ] Migration : Créer la table `translations`
2. [ ] Modèle : `Translation` avec relations
3. [ ] Service : `TranslationService` avec cache Redis
4. [ ] Controller public : `TranslationsController` (GET)
5. [ ] Controller admin : `Admin/TranslationsController` (CRUD)
6. [ ] Seeder : Traductions initiales (common, auth)

### Phase 2 : Frontend - Configuration

7. [ ] Installer `@nuxtjs/i18n`
8. [ ] Configurer `nuxt.config.ts`
9. [ ] Créer le loader dynamique (`i18n/index.ts`)
10. [ ] Créer les fichiers fallback JSON

### Phase 3 : Frontend - Composants

11. [ ] Composant `LocaleSwitcher.vue`
12. [ ] Intégrer dans `UserMenu.vue`
13. [ ] Intégrer dans `AppFooter.vue`

### Phase 4 : Frontend - Admin

14. [ ] Page `/admin/translations.vue`
15. [ ] Composable `useAdminTranslations.ts`
16. [ ] Fonctionnalités import/export

### Phase 5 : Migration des Textes

17. [ ] Migrer les textes de `landing` vers i18n
18. [ ] Migrer les textes de `auth` vers i18n
19. [ ] Migrer les textes de `common` vers i18n
20. [ ] Migrer les textes de `mj` vers i18n
21. [ ] Migrer les textes de `streamer` vers i18n
22. [ ] Migrer les textes de `admin` vers i18n

---

## Notes Techniques

### Cache Redis

Les traductions seront cachées dans Redis pour éviter des requêtes DB à chaque page :

```
Cache key: translations:fr
Cache key: translations:en
TTL: 1 heure (invalidé lors d'une modification admin)
```

### Fallback Chain

```
Langue demandée (ex: es)
    → Fallback (en)
        → Clé brute si rien trouvé
```

### Performance

- Chargement lazy par namespace (seulement ce qui est nécessaire)
- Cache côté client (localStorage) pour éviter les re-fetches
- Cache Redis côté serveur pour réduire la charge DB
