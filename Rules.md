# Règles de Développement - NexusOS

## 1. Principes Généraux

- **Langue** : TOUT doit être en **Français** (Commentaires, UI, Logs, Commits).
- **Expertise** : Code de niveau Senior, robuste, typé, et sécurisé.
- **Autonomie** : Pas de "trous" dans le code. Les solutions proposées doivent être complètes et prêtes à l'emploi.

## 2. Structure & Architecture

- **Framework** : React 19 + Vite + TypeScript.
- **Styling** : Tailwind CSS (Mode Sombre par défaut, Design "Premium").
- **Modularité** :
  - `modules/` : Contient les fonctionnalités isolées (Dashboard, Projets, Doc).
  - `components/` : Composants UI réutilisables (Boutons, Cards, Inputs).
  - `hooks/` : Logique métier extraite.
  - `types/` : Définitions TypeScript partagées.

## 3. Qualité du Code

- **Commentaires** : OBLIGATOIRES et DÉTAILLÉS en français.
  - Au-dessus de chaque fonction : But, Paramètres, Retour.
  - Dans les blocs complexes : Expliquer le _pourquoi_.
- **Typage** : `strict: true`. Pas de `any` sauf cas de force majeure justifié.
- **Fonctions** : Petites, pures si possible, nommage explicite (ex: `calculerStatutService` et pas `calc`).

## 4. UI/UX

- **Design** : Glassmorphism, dégradés subtils, animations fluides (framer-motion si besoin).
- **Réactivité** : Mobile-first, grille responsive.
- **Feedback** : Toujours indiquer les états (Loading, Error, Empty).

## 5. Processus

- **Fichiers de suivi** : Mettre à jour `Avancement.md` à chaque étape significative.
- **Refactoring** : Nettoyer le code mort immédiatement.
