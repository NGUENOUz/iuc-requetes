# Design System CampusLite 2.0

## 1. Principes Directeurs
- **Profondeur sans surcharge** : La différenciation visuelle est portée par le verre (`backdrop-filter: blur(20px)`), le ton des surfaces et une ombre douce diffuse, jamais par des bordures lourdes ni des traits blancs agressifs.
- **Zéro fausse donnée** : Aucune métrique inventée. Si une donnée n'existe pas en base, l'interface affiche explicitement un état vide ou un tiret `—`.
- **Mouvement utile** : Les animations (durées de 120ms à 700ms) accompagnent une action ou mettent en lumière une transition d'état, sans décoration permanente en boucle.
- **Sobriété des icônes** : Icônes Lucide stroke 1.5px, couleur héritée du texte (`currentColor`). Réservées à la navigation, aux champs et aux actions.

---

## 2. Palette & Tokens CSS
Définis dans `styles/tokens.css` et exposés via `@theme inline` :

### Surfaces & Fonds
- `--bg` : Fond principal de l'application (`#EEF2F9` en clair, `#0B1020` en sombre).
- `--surface` : Surface standard des blocs opaques (`#FFFFFF` en clair, `#12182B` en sombre).
- `--surface-raised` : Surface d'accentuation / surélévation (`#F8FAFC` en clair, `#182038` en sombre).
- `--surface-muted` : En-têtes, zones secondaires et éléments désactivés.

### Recettes de Verre (Glassmorphism Maîtrisé)
1. **`glass` (Cartes standard)** :
   - Fond : `rgba(255, 255, 255, 0.62)` (clair) / `rgba(255, 255, 255, 0.06)` (sombre).
   - Effet : `backdrop-filter: blur(20px) saturate(140%)`.
   - Bordure : `1px solid rgba(255, 255, 255, 0.70)` (clair) / `0.10` (sombre).
   - Ombre : `0 8px 32px rgba(31, 41, 80, 0.08)` (clair) / `0.35` (sombre).
   - Rayon : `16px`.
   - Filet lumineux : Dégradé horizontal de 1px en lisière haute (`glass-shine`).
2. **`glass-raised` (Navigation, popovers, modales)** :
   - Opacité accrue (≥ 82%), `blur(24px)`, ombre accentuée `0 12px 40px`.
3. **`surface-solid` (Tableaux denses, saisie de texte)** :
   - 100% opaque, aucun flou d'arrière-plan pour une netteté de lecture absolue.

### Accent & Statuts
- **Accent** : Bleu `#1D4ED8` (clair) / `#2F5FD8` (sombre). Utilisé pour le bouton principal, l'état actif et les liens.
- **Statuts sémantiques** :
  - Succès : `--success-fg: #166534`, `--success-bg: #E7F6EC` (WCAG 6.38:1).
  - Alerte : `--warning-fg: #8A4B00`, `--warning-bg: #FFF3DB` (WCAG 6.19:1).
  - Erreur : `--danger-fg: #B42318`, `--danger-bg: #FDECEA` (WCAG 5.75:1).
  - Info : `--info-fg: #1D4ED8`, `--info-bg: #EAF0FF` (WCAG 5.87:1).

---

## 3. Typographie
- **Texte courant** : `Geist` pour tout le corps de texte.
- **Titres et grands chiffres** : `Plus Jakarta Sans` ou `Manrope` (chiffres en `tabular-nums`).
- **Monospace** : Strictement réservée aux matricules, codes UE et références de requêtes (`REQ-xxxx`).
- **Casse** : Sentence case rigoureuse partout. Plus d'uppercase forcé.

---

## 4. Composants Signatures
1. **`DayTimeline`** : Frise de la journée de 7h à 19h avec marqueur en temps réel et positionnement des cours en cartes de verre.
2. **`RequestTimeline`** : Suivi de traitement en 3 étapes (Déposée, Instruction, Résolue / Rejetée) avec date réelle et phrase d'état en français direct.
3. **`StatTile`** : Chiffre héros en grands caractères tabulaires, variation réelle et compteur fluide motion.
4. **`ProgressRing`** : Anneau SVG animé calculant la progression des crédits ECTS.
5. **`MiniAreaChart`** : Mini-courbe d'évolution avec dégradé d'aire accentué (seul dégradé du projet).

---

## 5. Mouvement & Animation (`lib/motion.ts`)
- **Durées** : 120ms (micro-clics), 200ms (survol / interfaces), 350ms (entrées en cascade), 700ms (graphiques et anneaux).
- **Courbes** : `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Règles d'accessibilité** : Respect strict de `prefers-reduced-motion` désactivant les transitions au profit de fondu instantané.

---

## 6. Liste des Interdits
- ❌ Pas de verre imbriqué dans du verre (pas de carte `glass` à l'intérieur d'une carte `glass`).
- ❌ Pas de `filter: blur` posé sur des éléments DOM individuels (seul le `backdrop-filter` des recettes est autorisé).
- ❌ Pas de `hover:scale`, `transition: all`, parallaxe ou boucles permanentes.
- ❌ Pas d'icônes décoratives dans les coins de cartes ni dans des boîtes colorées fluo.
- ❌ Pas de fausses métriques ou valeurs hardcodées.
