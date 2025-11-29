# 🏝️ Pixelize

> _"Il y a désormais un monde à explorer... et des limites à ne pas franchir !"_

## 🚧 État actuel : v0.3.0 (World & Physics)

Bienvenue sur **Pixelize**.
Le projet prend de l'ampleur ! Nous avons quitté le vide intersidéral pour atterrir sur une île générée dynamiquement. Le moteur intègre maintenant un système de **Tiles (Tuiles)**, une **Caméra** qui suit le joueur et une gestion des **Collisions** (le joueur ne peut plus marcher sur l'eau).

## 🎯 L'Objectif

Construire un **MMORPG navigateur** en partant de zéro.
L'objectif actuel est de consolider l'environnement de jeu (Map, Graphismes, Physique) avant d'attaquer la partie réseau.

## 🗺️ Roadmap (Feuille de route)

L'évolution du projet :

- [x] **Phase 1 :** Prototype (Carré rouge)
- [x] **Phase 2 :** Intégration Graphique (Sprites Pixel Art) 🎨
- [x] **Phase 3 :** Contrôles avancés (Souris "Point & Click" + Sprint) 🖱️
- [x] **Phase 4 :** Monde & Physique (Map, Caméra, Collisions, Autotiling) 🏝️
- [ ] **Phase 5 :** Créer le serveur Node.js / Socket.io
- [ ] **Phase 6 :** Synchronisation multijoueur (positions et animations)
- [ ] **Phase 7 :** Interface (Pseudos, Chat)

## 🎮 Commandes

Le joueur a le choix entre deux modes de contrôle :

### 🖱️ Souris (Recommandé)

- **Clic gauche** : Se déplacer vers la destination (Marche).
- **Double-clic** : Courir vers la destination (Sprint).

### ⌨️ Clavier

- **Flèches / ZQSD** : Se déplacer.
- **Shift (Maj)** : Maintenir pour courir.

> **Note :** Vous ne pouvez vous déplacer que sur la terre ferme. L'eau est désormais une zone infranchissable !

## 🛠️ Installation et Test

1. Clonez le projet :

   ```bash
   git clone https://github.com/lamolosau/pixelize.git

   ```

2. Ouvrez simplement le fichier `index.html` dans votre navigateur.

## 💻 Stack Technique

- **Langage :** JavaScript (Vanilla)
- **Rendu :** HTML5 Canvas API
- **Moteur :**
  - Game Loop optimisée
  - Système de Caméra (Viewport)
  - Autotiling (Gestion des transitions Terre/Eau)
  - Collisions pixel-perfect (Hitbox circulaire)

---

_Code artisanal, pixel par pixel._
