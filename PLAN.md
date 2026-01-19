# Plan : Magnétisme sur les poignées de redimensionnement du Gizmo

## Objectif
Ajouter un snap (magnétisme) aux poignées de redimensionnement du TransformGizmo, permettant aux bords de l'élément de s'accrocher aux lignes de la grille lors du resize.

## Comportement attendu
- **Magnétisme actif par défaut** (pas de touche modificateur requise)
- **Seuil de snap** : 4px (comme `SNAP_THRESHOLD_GRID` existant), 15px pour l'axe central
- **Feedback visuel** : Guides bleus (réutiliser `snap-guide-vertical` / `snap-guide-horizontal`)
- **Logique** : Le bord manipulé (selon le handle) snap sur la ligne de grille la plus proche

---

## Analyse technique

### Flux actuel du resize
1. `TransformGizmo.vue` : Détecte le handle utilisé (`n`, `s`, `e`, `w`, `nw`, `ne`, `sw`, `se`)
2. `TransformGizmo.vue` : Calcule les deltas et émet `resize(deltaWidth, deltaHeight, deltaX, deltaY, proportional)`
3. `StudioCanvas.vue::handleResize()` : Convertit les deltas en scale et met à jour le store

### Problème
Le handler `handleResize` actuel ne sait pas quel handle est utilisé, donc il ne peut pas déterminer quel bord doit snapper.

---

## Modifications à effectuer

### 1. TransformGizmo.vue - Émettre le handle utilisé

**Fichier** : `frontend/overlay-studio/components/TransformGizmo.vue`

#### 1.1 Exporter le type ResizeHandle (ligne ~121)
```typescript
export type ResizeHandle = "n" | "s" | "e" | "w" | "nw" | "ne" | "sw" | "se";
```

#### 1.2 Modification de l'interface d'émission (ligne ~96-103)
Ajouter `handle` au type d'émission `resize` :
```typescript
const emit = defineEmits<{
  // ... autres émissions
  resize: [
    deltaWidth: number,
    deltaHeight: number,
    deltaX: number,
    deltaY: number,
    proportional: boolean,
    handle: ResizeHandle,  // NOUVEAU
  ];
}>();
```

#### 1.3 Modification de l'émission (ligne ~359)
```typescript
emit("resize", deltaWidth, deltaHeight, deltaX, deltaY, proportional, handle);
```

---

### 2. StudioCanvas.vue - Implémenter le snap au resize

**Fichier** : `frontend/overlay-studio/components/StudioCanvas.vue`

#### 2.1 Mise à jour de l'import (ligne ~179)
```typescript
import TransformGizmo, { type ActiveEdges, type ResizeHandle } from "./TransformGizmo.vue";
```

#### 2.2 Mise à jour de la signature handleResize (ligne ~607)
```typescript
const handleResize = (
  deltaWidth: number,
  deltaHeight: number,
  deltaX: number,
  deltaY: number,
  proportional: boolean,
  handle: ResizeHandle,  // NOUVEAU
) => {
```

#### 2.3 Mapping handle → bord(s) affecté(s)

| Handle | Bord(s) à snapper |
|--------|-------------------|
| `n`    | top               |
| `s`    | bottom            |
| `e`    | right             |
| `w`    | left              |
| `nw`   | top + left        |
| `ne`   | top + right       |
| `sw`   | bottom + left     |
| `se`   | bottom + right    |

#### 2.4 Logique de snap (après calcul des nouvelles tailles, avant application)

**Algorithme** :
1. Calculer la position actuelle du centre après le delta de position
2. Calculer les nouvelles demi-dimensions après le delta de scale
3. Pour chaque bord manipulé par le handle :
   - Calculer la position du bord (`center ± halfSize`)
   - Trouver la ligne de grille la plus proche (`findNearestGridLine`)
   - Si distance < seuil (4px ou 15px pour axe central) :
     - Ajuster `newScale` pour que le bord coïncide avec la grille
     - Si le handle déplace le centre (w, n, nw, etc.), ajuster aussi la position
     - Afficher le guide de snap correspondant

**Pseudo-code détaillé** :
```typescript
// Réinitialiser les guides
showSnapGuideX.value = false;
showSnapGuideY.value = false;

// Position du centre après deltas
const newCenterX = target.position.x + deltaX;
const newCenterY = target.position.y + deltaY;

// Demi-dimensions après scale
let newHalfWidth = (baseWidth * newScaleX) / 2;
let newHalfHeight = (baseHeight * newScaleY) / 2;

// Helper pour snap sur un bord
const snapEdge = (edgePosition: number, isHorizontal: boolean) => {
  const nearest = findNearestGridLine(edgePosition);
  const threshold = nearest === 0 ? SNAP_THRESHOLD : SNAP_THRESHOLD_GRID;
  if (Math.abs(edgePosition - nearest) < threshold) {
    return { snapped: true, gridLine: nearest };
  }
  return { snapped: false, gridLine: nearest };
};

// Snap bord droit (handles: e, ne, se)
if (handle.includes('e')) {
  const rightEdge = newCenterX + newHalfWidth;
  const { snapped, gridLine } = snapEdge(rightEdge, false);
  if (snapped) {
    // Ajuster la largeur pour que le bord droit soit sur la grille
    newHalfWidth = gridLine - newCenterX;
    newScaleX = (newHalfWidth * 2) / baseWidth;
    snapGuideXPosition.value = gridLine;
    showSnapGuideX.value = true;
  }
}

// Snap bord gauche (handles: w, nw, sw)
if (handle.includes('w')) {
  const leftEdge = newCenterX - newHalfWidth;
  const { snapped, gridLine } = snapEdge(leftEdge, false);
  if (snapped) {
    // Le centre doit se déplacer, et la largeur s'ajuster
    // Bord droit fixe : rightEdge = newCenterX + newHalfWidth
    const rightEdge = newCenterX + newHalfWidth;
    const newWidth = rightEdge - gridLine;
    newScaleX = newWidth / baseWidth;
    newHalfWidth = newWidth / 2;
    // Nouveau centre = milieu entre gridLine et rightEdge
    deltaX = (gridLine + rightEdge) / 2 - target.position.x;
    snapGuideXPosition.value = gridLine;
    showSnapGuideX.value = true;
  }
}

// Snap bord haut (handles: n, nw, ne)
if (handle.includes('n')) {
  const topEdge = newCenterY + newHalfHeight;
  const { snapped, gridLine } = snapEdge(topEdge, true);
  if (snapped) {
    const bottomEdge = newCenterY - newHalfHeight;
    const newHeight = gridLine - bottomEdge;
    newScaleY = newHeight / baseHeight;
    newHalfHeight = newHeight / 2;
    deltaY = (bottomEdge + gridLine) / 2 - target.position.y;
    snapGuideYPosition.value = gridLine;
    showSnapGuideY.value = true;
  }
}

// Snap bord bas (handles: s, sw, se)
if (handle.includes('s')) {
  const bottomEdge = newCenterY - newHalfHeight;
  const { snapped, gridLine } = snapEdge(bottomEdge, true);
  if (snapped) {
    newHalfHeight = newCenterY - gridLine;
    newScaleY = (newHalfHeight * 2) / baseHeight;
    snapGuideYPosition.value = gridLine;
    showSnapGuideY.value = true;
  }
}
```

---

## Fichiers modifiés

| Fichier | Modifications |
|---------|---------------|
| `TransformGizmo.vue` | Export type `ResizeHandle`, ajouter `handle` à l'émission `resize` |
| `StudioCanvas.vue` | Import `ResizeHandle`, logique de snap dans `handleResize()` |

---

## Tests manuels à effectuer

1. **Resize par handle Est (e)** : Le bord droit doit snapper aux lignes verticales
2. **Resize par handle Nord (n)** : Le bord haut doit snapper aux lignes horizontales
3. **Resize par handle Ouest (w)** : Le bord gauche snap ET le centre se déplace correctement
4. **Resize par coin (nw, ne, sw, se)** : Les deux bords concernés snappent
5. **Snap sur axe central** : Vérifier le seuil plus élevé (15px) sur X=0 et Y=0
6. **Guide visuel** : La ligne bleue apparaît sur la ligne de grille lors du snap
7. **Élément avec rotation** : Tester que le snap fonctionne (rotation gérée en amont)
8. **Élément Dice** : Vérifier le resize du HUD avec snap
9. **Resize proportionnel (coin)** : Les deux axes snappent correctement

---

## Points d'attention

1. **Handles qui déplacent le centre** : `w`, `n`, `nw`, `sw`, `ne` modifient la position ET la taille. Le snap doit ajuster les deux.

2. **Resize proportionnel** : Pour les coins, si un axe snappe, l'autre doit suivre proportionnellement (ou on peut autoriser le snap indépendant sur chaque axe).

3. **Ordre des snaps** : Snap X avant Y ou vice-versa peut donner des résultats différents pour les coins. À tester.

4. **Scale minimum** : Après snap, vérifier que `newScaleX/Y >= 0.1`.
