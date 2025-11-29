# 🌍 Pixelize Online

> _"Qui es-tu, petit pixel ?"_

## 🚀 État actuel : v0.3.1 (Identity Update)

**Pixelize se dote d'une identité.**
L'expérience multijoueur est désormais personnalisée : une fenêtre de connexion accueille les nouveaux arrivants, leur permettant de choisir un pseudo qui sera visible par tous les autres aventuriers dans le monde.

## 🎯 Fonctionnalités Clés

- **Système de Login :** Une modale stylisée "Pixel Art" demande votre nom à l'entrée.
- **Identité Visuelle :** Les pseudos flottent au-dessus des personnages avec une police rétro.
- **Multijoueur Temps Réel :** Déplacements et animations synchronisés via Socket.io.
- **Contrôles Hybrides :** Déplacement Souris (Point & Click) ou Clavier.

## 🗺️ Roadmap (Feuille de route)

L'évolution du projet :

- [x] **Phase 1 :** Moteur graphique Canvas & Sprites 🎨
- [x] **Phase 2 :** Contrôles Souris & Clavier 🎮
- [x] **Phase 3 :** Serveur Node.js & Socket.io 🌐
- [x] **Phase 4 :** Synchronisation Multijoueur
- [x] **Phase 5 :** Système de Pseudos & UI de Login 🆔
- [ ] **Phase 6 :** Chat en direct
- [ ] **Phase 7 :** Collisions avec le décor

## 🎮 Commandes

### 🖱️ Souris

- **Clic gauche** : Marcher vers la destination.
- **Double-clic** : Courir vers la destination (Sprint).

### ⌨️ Clavier

- **Flèches / ZQSD** : Se déplacer.
- **Shift (Maj)** : Maintenir pour courir.

## 🛠️ Installation et Lancement (Local)

## 🛠️ Installation et Lancement

1. **Cloner et Installer :**

   ```bash
   git clone https://github.com/lamolosau/pixelize.git
   cd pixelize
   npm install

   ```

2. **Lancer le serveur :**

   ```bash
   node server.js

   ```

3. **Jouer :**
   Rendez-vous sur `http://localhost:3000`.

---

_Fait avec ❤️, Node.js et beaucoup de pixels._
