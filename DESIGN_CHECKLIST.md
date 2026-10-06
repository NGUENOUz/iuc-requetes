# Checklist de Revue de Page (Design System CampusLite)

Avant de livrer une page ou de valider une refonte, vérifier chaque point :

### 1. Verre & Surfaces
- [ ] La page repose uniquement sur le composant global `AmbientBackground` (aucun gradient/halo injecté localement).
- [ ] Aucune imbrication de verre dans du verre (pas de `.glass` à l'intérieur d'un `.glass`).
- [ ] Les tableaux, formulaires longs et textes denses utilisent `.surface-solid` (100% opaque).
- [ ] Le nombre de cartes en verre visibles simultanément ne dépasse pas 6.

### 2. Données & Honnêteté
- [ ] Aucune valeur fictive hardcodée (notes, moyennes, matricules ou noms arbitraires).
- [ ] Si une donnée est manquante : affichage d'un tiret `—` ou d'un `EmptyState` explicite avec action.
- [ ] Les états de chargement utilisent des `Skeleton` aux dimensions exactes du contenu.
- [ ] Chaque métrique (moyenne, crédits, matricule) n'apparaît qu'une seule fois par écran.

### 3. Typographie & Contrastes
- [ ] Titres en `Plus Jakarta Sans` ou `Manrope`, corps en `Geist`.
- [ ] Casse normale (sentence case) partout. Aucun `uppercase tracking-wider` inutile.
- [ ] Chiffres des notes, statistiques et heures en chiffres tabulaires (`tabular-nums`).
- [ ] Contraste WCAG AA vérifié (≥ 4.5:1 pour le texte courant, y compris sur surface en verre).

### 4. Mouvement & Accessibilité
- [ ] Durées issues de `lib/motion.ts` (120ms / 200ms / 350ms / 700ms).
- [ ] Aucun `hover:scale`, aucun `animate-pulse` décoratif, aucun `transition: all`.
- [ ] `prefers-reduced-motion` respecté (affichage instantané sans animation).
- [ ] Cibles tactiles ≥ 44px sur mobile et champs de saisie ≥ 16px.

### 5. Copie & Voix
- [ ] Français simple, direct et bienveillant (tutoiement cohérent).
- [ ] Aucun jargon commercial ("SLA", "hub", "express", "TLS 256-bit", "&").
- [ ] Boutons d'action clairs et verbes d'action explicites.
