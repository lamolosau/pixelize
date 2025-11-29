# 🌍 Pixelize Online

> *"On n'est plus tout seul dans le pixel."*

## 🚀 État actuel : v0.3.0 (Multiplayer Alpha)

**Pixelize est désormais un jeu multijoueur en ligne (MMO).**
Le projet a basculé sur une architecture Client-Serveur utilisant **Node.js** et **Socket.io**. Vous pouvez désormais voir les autres joueurs se déplacer et s'animer en temps réel, ainsi que choisir votre pseudo à la connexion.

## 🎯 Fonctionnalités

* **Multijoueur Temps Réel :** Synchronisation fluide des positions.
* **Animations Réseau :** Les autres joueurs marchent, courent et s'arrêtent correctement sur votre écran.
* **Identité :** Système de pseudo choisi à la connexion.
* **Contrôles Hybrides :** Déplacement à la souris (Point & Click) ou au clavier.
* **Z-Indexing :** Gestion de la profondeur (passer devant/derrière les autres joueurs).

## 🗺️ Roadmap (Feuille de route)

L'évolution du projet :

- [x] **Phase 1 :** Moteur graphique Canvas & Sprites 🎨
- [x] **Phase 2 :** Contrôles Souris & Clavier 🎮
- [x] **Phase 3 :** Serveur Node.js & Socket.io 🌐
- [x] **Phase 4 :** Synchronisation Multijoueur
- [x] **Phase 5 :** Système de Pseudos
- [ ] **Phase 6 :** Chat en direct
- [ ] **Phase 7 :** Collisions avec le décor

## 🎮 Commandes

### 🖱️ Souris (Recommandé)
* **Clic gauche** : Se déplacer.
* **Double-clic** : Courir (Sprint).

### ⌨️ Clavier
* **Flèches / ZQSD** : Se déplacer.
* **Shift (Maj)** : Maintenir pour courir.

## 🛠️ Installation et Lancement (Local)

Comme le jeu utilise un serveur, vous ne pouvez plus simplement ouvrir `index.html`.

1. **Cloner le projet :**
   ```bash
   git clone [https://github.com/lamolosau/pixelize.git](https://github.com/lamolosau/pixelize.git)
   cd pixelize

2.  **Installer les dépendances :**

    ```bash
    npm install
    ```

3.  **Lancer le serveur :**

    ```bash
    node server.js
    ```

4.  **Jouer :**
    Ouvrez votre navigateur sur `http://localhost:3000`.
    *Astuce : Ouvrez un deuxième onglet pour vous voir en double \!*

## 💻 Stack Technique

  * **Backend :** Node.js, Express, Socket.io
  * **Frontend :** HTML5 Canvas, JavaScript Vanilla
  * **Déploiement :** Compatible Render / Heroku

-----

*Fait avec ❤️ et beaucoup de websockets.*
