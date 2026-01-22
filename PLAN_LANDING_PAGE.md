# 🏰 Plan d'Implémentation - Landing Page Tumulte

## Vision

Transformer la landing page en une **expérience immersive et féerique** qui raconte l'histoire de Tumulte : comment les viewers deviennent acteurs de l'aventure JDR, créant chaos et épopées mémorables.

---

## 📦 Stack Technique

### Bibliothèque d'Animation : VueUse Motion

**Pourquoi ce choix :**
- ✅ Bundle ultra-léger (<25kb)
- ✅ Module Nuxt 3 natif
- ✅ Scroll animations via Intersection Observer intégré
- ✅ 20+ presets d'animation inclus
- ✅ SSR compatible
- ✅ S'intègre parfaitement avec Tailwind
- ✅ Maintenu activement (écosystème VueUse)

**Installation :**
```bash
cd frontend
npm install @vueuse/motion
```

**Configuration Nuxt :**
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@vueuse/motion/nuxt',
    // ... autres modules
  ],
})
```

---

## 🎨 Design System - Animations

### 1. Presets d'Animation Personnalisés

```typescript
// nuxt.config.ts - motion presets
motion: {
  directives: {
    // Fade in depuis le bas (sections principales)
    'fade-up': {
      initial: { opacity: 0, y: 50 },
      visibleOnce: { opacity: 1, y: 0, transition: { duration: 600, ease: 'easeOut' } }
    },
    // Fade in depuis la gauche
    'fade-left': {
      initial: { opacity: 0, x: -50 },
      visibleOnce: { opacity: 1, x: 0, transition: { duration: 600, ease: 'easeOut' } }
    },
    // Fade in depuis la droite
    'fade-right': {
      initial: { opacity: 0, x: 50 },
      visibleOnce: { opacity: 1, x: 0, transition: { duration: 600, ease: 'easeOut' } }
    },
    // Scale up (pour les cards)
    'scale-up': {
      initial: { opacity: 0, scale: 0.9 },
      visibleOnce: { opacity: 1, scale: 1, transition: { duration: 500, ease: 'easeOut' } }
    },
    // Pop (pour les icônes/badges)
    'pop': {
      initial: { opacity: 0, scale: 0.5 },
      visibleOnce: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }
    }
  }
}
```

### 2. Micro-interactions CSS (Tailwind)

```css
/* assets/css/main.css - Ajouts */

/* ============================================================================
   LANDING PAGE - MICRO-INTERACTIONS
   ============================================================================ */

/* Bouton CTA avec glow doré */
.cta-glow {
  position: relative;
  transition: all 0.3s ease;
}

.cta-glow::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(135deg, var(--color-secondary-400), var(--color-secondary-600));
  border-radius: inherit;
  opacity: 0;
  z-index: -1;
  filter: blur(12px);
  transition: opacity 0.3s ease;
}

.cta-glow:hover {
  transform: translateY(-2px);
}

.cta-glow:hover::before {
  opacity: 0.6;
}

.cta-glow:active {
  transform: translateY(0) scale(0.98);
}

/* Card avec élévation et glow */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(216, 183, 144, 0.15);
}

/* Image avec zoom subtil */
.img-zoom {
  transition: transform 0.5s ease;
}

.img-zoom:hover {
  transform: scale(1.03);
}

/* Lien avec underline animé */
.link-animated {
  position: relative;
}

.link-animated::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-secondary-500);
  transition: width 0.3s ease;
}

.link-animated:hover::after {
  width: 100%;
}

/* Icône avec pulse au hover */
.icon-pulse:hover {
  animation: pulse-gold 0.6s ease;
}

@keyframes pulse-gold {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* Shimmer effect pour CTA premium */
.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* ============================================================================
   ACCESSIBILITÉ - Réduire les animations si demandé
   ============================================================================ */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .cta-glow:hover,
  .card-hover:hover,
  .img-zoom:hover {
    transform: none;
  }
}
```

---

## 📐 Structure des Sections

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HERO - "Forgez des Légendes"                             │
│    [Illustration fantasy]  +  Titre épique + CTA            │
├─────────────────────────────────────────────────────────────┤
│ 2. PROBLEM - "Le Chaos des Royaumes Divisés"                │
│    Illustration confusion  +  Pain points                   │
├─────────────────────────────────────────────────────────────┤
│ 3. SOLUTION - "Un Seul Portail, Tous les Mondes"            │
│    Mockup interface  +  Bénéfices clés                      │
├─────────────────────────────────────────────────────────────┤
│ 4. FEATURES - "Les Pouvoirs de Tumulte"                     │
│    3 étapes animées en stagger                              │
├─────────────────────────────────────────────────────────────┤
│ 5. USE CASES - "Pour les Héros et les Guides"               │
│    Card MJ  +  Card Streamers                               │
├─────────────────────────────────────────────────────────────┤
│ 6. TESTIMONIALS - "Chroniques des Aventuriers" (futur)      │
│    Citations de streamers (placeholder)                     │
├─────────────────────────────────────────────────────────────┤
│ 7. CTA FINAL - "L'Aventure Commence"                        │
│    Illustration épique  +  CTA principal                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Fichiers à Créer/Modifier

### Nouveaux Composants

| Fichier | Description |
|---------|-------------|
| `components/landing/LandingHero.vue` | Section hero avec illustration + titre épique |
| `components/landing/LandingProblem.vue` | Section problème avec empathie |
| `components/landing/LandingSolution.vue` | Section solution avec mockup |
| `components/landing/LandingFeatures.vue` | 3 étapes "Comment ça marche" |
| `components/landing/LandingUseCases.vue` | Cards MJ et Streamers |
| `components/landing/LandingTestimonials.vue` | Section témoignages (préparée) |
| `components/landing/LandingCta.vue` | CTA final immersif |
| `components/landing/ImagePlaceholder.vue` | Composant placeholder réutilisable |

### Fichiers Modifiés

| Fichier | Modifications |
|---------|---------------|
| `nuxt.config.ts` | Ajouter @vueuse/motion/nuxt + presets |
| `assets/css/main.css` | Ajouter micro-interactions CSS |
| `pages/home.vue` | Remplacer par composition de sections |
| `layouts/landing.vue` | Header amélioré (sticky, transparent) |

### Images (Emplacements Prévus)

```
frontend/public/images/landing/
├── hero.webp              # ~1200x800 - Scène fantasy épique (héros, magie)
├── problem.webp           # ~800x600 - Confusion/chaos multi-communautés
├── solution-mockup.webp   # ~1000x700 - Screenshot/mockup interface Tumulte
├── step-1.webp            # ~400x400 - Création campagne (parchemin, plume)
├── step-2.webp            # ~400x400 - Lancement sondage (magie, portail)
├── step-3.webp            # ~400x400 - Résultats agrégés (grimoire, stats)
├── persona-gm.webp        # ~500x400 - MJ fantasy (couronne, grimoire)
├── persona-streamer.webp  # ~500x400 - Streamer (écran, chat Twitch)
└── cta-adventure.webp     # ~1200x600 - Aventuriers partant à l'aventure
```

---

## 📝 Copywriting Épique

### Section 1: Hero

**Titre principal :**
> # Forgez des Légendes avec vos Communautés

**Sous-titre :**
> Transformez vos viewers en acteurs de l'aventure. Sondages synchronisés, décisions collectives, chaos mémorable.

**CTA :**
> 🎲 Rejoindre l'Aventure

**Badge :**
> ✨ Compatible Twitch Affilié & Partenaire

---

### Section 2: Problem

**Titre :**
> ## Le Chaos des Royaumes Divisés

**Pain points :**
- 🌀 Vos viewers votent chacun de leur côté, sans impact réel
- 📊 Les résultats sont dispersés, impossibles à agréger
- 💬 Chaque chat vit sa propre aventure, déconnecté des autres

**Phrase d'accroche :**
> Quand plusieurs streamers partagent une table de JDR, leurs communautés devraient partager le pouvoir de changer le destin.

---

### Section 3: Solution

**Titre :**
> ## Un Seul Portail, Tous les Mondes Unis

**Bénéfices :**
- ⚡ Un clic lance le sondage sur toutes les chaînes
- 🎯 Les votes de chaque communauté comptent ensemble
- 📈 Résultats en temps réel, agrégés instantanément

**Phrase d'accroche :**
> Tumulte est le grimoire qui unit les royaumes. Vos viewers deviennent une seule force capable de bouleverser l'aventure.

---

### Section 4: Features (Comment ça marche)

**Titre :**
> ## Les Trois Sortilèges

**Étape 1 - Invoquer :**
> Créez votre campagne et invitez les streamers de votre table. En quelques clics, votre cercle est formé.

**Étape 2 - Déchaîner :**
> Lancez un sondage. Il apparaît instantanément sur tous les chats Twitch liés. La magie opère.

**Étape 3 - Révéler :**
> Les votes affluent de tous les royaumes. Les résultats s'agrègent en temps réel. Le destin est scellé.

---

### Section 5: Use Cases

**Card MJ - Titre :**
> ## 👑 Maîtres du Jeu

**Points :**
- Orchestrez le chaos depuis votre grimoire
- Créez des sondages qui changent le cours de l'histoire
- Suivez l'engagement de toutes les communautés
- Programmez vos interventions à l'avance

**Card Streamers - Titre :**
> ## 📺 Aventuriers Streamers

**Points :**
- Rejoignez une campagne en un seul clic
- Offrez à votre communauté le pouvoir d'agir
- Overlay OBS personnalisable pour l'immersion
- Zéro friction, zéro configuration technique

---

### Section 6: Testimonials (Placeholder)

**Titre :**
> ## Chroniques des Aventuriers

**Placeholder :**
> *Bientôt, les récits de ceux qui ont forgé des légendes...*

---

### Section 7: CTA Final

**Titre :**
> ## L'Aventure Vous Attend

**Sous-titre :**
> Rejoignez les Maîtres du Jeu qui transforment leurs sessions en épopées interactives.

**CTA :**
> 🎲 Créer Mon Compte Gratuit

**Reassurance :**
> Sans carte bancaire • Gratuit pour commencer • Prêt en 2 minutes

---

## 🎬 Animations par Section

| Section | Animation | Trigger | Délai |
|---------|-----------|---------|-------|
| Hero | Aucune (visible immédiatement) | - | - |
| Hero image | `fade-left` | Page load | 200ms |
| Hero text | `fade-right` | Page load | 0ms |
| Problem | `fade-up` | Scroll into view | 0ms |
| Problem image | `scale-up` | Scroll into view | 200ms |
| Solution | `fade-up` | Scroll into view | 0ms |
| Solution mockup | `fade-right` | Scroll into view | 300ms |
| Features title | `fade-up` | Scroll into view | 0ms |
| Feature step 1 | `pop` | Scroll into view | 0ms |
| Feature step 2 | `pop` | Scroll into view | 150ms |
| Feature step 3 | `pop` | Scroll into view | 300ms |
| Use Cases | `fade-up` | Scroll into view | 0ms |
| Card MJ | `fade-left` | Scroll into view | 0ms |
| Card Streamer | `fade-right` | Scroll into view | 100ms |
| CTA Final | `scale-up` | Scroll into view | 0ms |

---

## 📱 Responsive Design

### Breakpoints

| Viewport | Comportement |
|----------|--------------|
| Mobile (<640px) | Stack vertical, images plus petites, CTA full-width |
| Tablet (640-1024px) | Layout hybride, 2 colonnes pour cards |
| Desktop (>1024px) | Layout complet, images grandes, animations complètes |

### Adaptations Mobile

- Hero : Image au-dessus du texte (stack)
- Problem/Solution : Image centrée, texte dessous
- Features : 1 colonne, étapes empilées
- Use Cases : Cards empilées
- CTA : Full-width avec padding réduit

---

## ⚡ Performance

### Optimisations Prévues

1. **Images** : Format WebP, lazy loading natif
2. **Animations** : `visibleOnce` (une seule fois, pas à chaque scroll)
3. **CSS** : Animations GPU-accelerated (transform, opacity)
4. **Bundle** : VueUse Motion est tree-shakeable

### Lighthouse Targets

| Métrique | Cible |
|----------|-------|
| Performance | >90 |
| Accessibility | >95 |
| Best Practices | >95 |
| SEO | >95 |

---

## 🔧 Ordre d'Implémentation

### Phase 1 : Infrastructure (30 min)
1. [ ] Installer @vueuse/motion
2. [ ] Configurer les presets dans nuxt.config.ts
3. [ ] Ajouter les micro-interactions CSS
4. [ ] Créer le composant ImagePlaceholder

### Phase 2 : Composants Sections (2h)
5. [ ] Créer LandingHero.vue
6. [ ] Créer LandingProblem.vue
7. [ ] Créer LandingSolution.vue
8. [ ] Créer LandingFeatures.vue
9. [ ] Créer LandingUseCases.vue
10. [ ] Créer LandingTestimonials.vue (placeholder)
11. [ ] Créer LandingCta.vue

### Phase 3 : Assemblage (30 min)
12. [ ] Modifier home.vue pour composer les sections
13. [ ] Améliorer landing.vue (header sticky)
14. [ ] Créer dossier images/landing/ avec structure

### Phase 4 : Polish (30 min)
15. [ ] Test responsive (mobile, tablet, desktop)
16. [ ] Test animations (smooth, pas de lag)
17. [ ] Test accessibilité (prefers-reduced-motion)
18. [ ] Vérifier typecheck

---

## ✅ Checklist de Validation

- [ ] Toutes les sections s'affichent correctement
- [ ] Animations scroll fonctionnent (fade-in au scroll)
- [ ] Micro-interactions hover fonctionnent (glow, élévation)
- [ ] Placeholders images visibles avec label "Future image"
- [ ] Responsive parfait sur mobile (375px)
- [ ] Responsive parfait sur tablet (768px)
- [ ] Responsive parfait sur desktop (1280px+)
- [ ] prefers-reduced-motion respecté
- [ ] Aucune erreur TypeScript
- [ ] Performance acceptable (pas de lag scroll)
- [ ] Textes épiques cohérents avec l'univers
- [ ] CTA visibles et attractifs

---

## 🎯 Résultat Attendu

Une landing page qui :
- **Captive** dès le hero avec une ambiance fantasy
- **Raconte** une histoire (problème → solution → action)
- **Guide** l'utilisateur avec des animations subtiles
- **Convertit** avec des CTA clairs et attractifs
- **Fonctionne** parfaitement sur tous les devices
- **Respecte** l'accessibilité

---

*Plan créé le 22/01/2026 - Prêt pour implémentation*
