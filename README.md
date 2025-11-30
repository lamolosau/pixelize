# 🏝️ Pixelize

> _"Il y a désormais un monde à explorer... et des limites à ne pas franchir !"_

Bienvenue sur **Pixelize**, un MMORPG navigateur développé en **Vanilla JavaScript** (sans moteur de jeu).
Le projet met l'accent sur une architecture propre et un rendu atmosphérique poussé.

## ✨ Nouveautés (Mise à jour Graphique & Architecture)

### 🎨 Moteur Graphique & Atmosphère
- **Cycle Jour / Nuit en temps réel** : Le jeu se synchronise avec l'heure de votre ordinateur.
  - *Matin/Midi* : Lumière zénithale blanche (soleil hors champ).
  - *Golden Hour (18h-20h)* : Lumière rasante orangée, ombres chaudes et soleil visible à l'horizon.
  - *Nuit* : Ambiance bleu nuit, visibilité réduite et vignettage intense.
- **Système de Shaders (Canvas)** :
  - **Vignettage dynamique** : Assombrissement des bords de l'écran adapté à la luminosité ambiante.
  - **Color Grading** : Teinte globale via modes de fusion (`overlay`, `screen`, `multiply`).
  - **Diffusion Solaire** : Simulation d'un halo lumineux (Sun Glow) se déplaçant d'Est en Ouest.
- **Détails Procéduraux** : Génération aléatoire de touffes d'herbe et de rochers marins.

### 🛠️ Architecture Technique (MVC)
Le code a été entièrement refactorisé pour suivre le modèle **Modèle-Vue-Contrôleur** :
- **`data.js` (Model)** : Contient la configuration, la génération de la map (`worldMap`) et les données de textures.
- **`view.js` (View)** : Gère le rendu visuel (Tiles, Joueur, Shaders, Effets atmosphériques).
- **`game.js` (Controller)** : Gère la boucle de jeu (`Game Loop`), les inputs et la physique.

## 🎮 Commandes

### 🖱️ Souris
- **Clic gauche** : Se déplacer (Pathfinding simple).
- **Double-clic** : Non implémenté (hérité du sprint).

### ⌨️ Clavier
- **Flèches / ZQSD** : Se déplacer.
- **Shift (Maj)** : Maintenir pour courir.

> **Physique :** Collisions pixel-perfect (Hitbox circulaire aux pieds). Vous ne pouvez pas marcher sur l'eau.

## 🚀 Installation

1. Clonez le projet :
   ```bash
   git clone https://github.com/lamolosau/pixelize.git

2.  Ouvrez simplement le fichier `index.html` dans votre navigateur.
      * *Aucun serveur n'est requis pour le moment.*

## 📂 Structure du Projet

```
/
├── index.html      # Point d'entrée, chargement des modules
├── style.css       # Styles UI (Menu, Canvas, Police Retro)
├── game.js         # Moteur (Logique & Boucle)
├── view.js         # Rendu (Graphismes & Shaders)
├── data.js         # Données (Map & Config)
└── /tiles          # Assets graphiques
```

-----

*Code artisanal, pixel par pixel.*
