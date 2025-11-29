# 🧍 Pixelize

> *"Adieu petit carré rouge. Bonjour petit bonhomme."*

## 🚧 État actuel : v0.1.0 (Alpha)

Bienvenue sur **Pixelize**.
Le projet a franchi une étape majeure : le moteur graphique est né. Nous ne déplaçons plus de la géométrie abstraite, mais un **véritable personnage en Pixel Art**.

Le système gère désormais les **animations** et les **états** (attente/marche).

## 🎯 L'Objectif

Ce prototype est la fondation d'un futur **jeu multijoueur en temps réel** (MMO).
Prochaine étape critique : synchroniser ces animations entre plusieurs joueurs via le réseau.

## 🗺️ Roadmap (Feuille de route)

L'évolution du projet :

- [x] **Phase 1 :** Afficher un carré rouge (Prototype)
- [x] **Phase 2 :** Faire bouger le prototype
- [x] **Phase 3 :** Intégration graphique (Sprites Idle & Walk) 🎨
- [ ] **Phase 4 :** Créer le serveur Node.js / Socket.io
- [ ] **Phase 5 :** Synchronisation multijoueur (positions et animations)
- [ ] **Phase 6 :** Ajout des pseudos et du chat

## 🎮 Commandes

Pour l'instant, le jeu se joue exclusivement au **clavier** :

* **Flèches directionnelles** : Se déplacer (Haut, Bas, Gauche, Droite)
* *Le personnage s'oriente automatiquement et lance l'animation de marche.*
* *Si aucune touche n'est pressée, il passe en animation "Idle" (respiration).*

## 🛠️ Installation et Test

1. Clonez le projet :
   ```bash
   git clone [https://github.com/lamolosau/pixelize.git](https://github.com/lamolosau/pixelize.git)

2.  Ouvrez simplement le fichier `index.html` dans votre navigateur.

## 💻 Stack Technique

  * **Langage :** JavaScript (Vanilla)
  * **Rendu :** HTML5 Canvas API
  * **Assets :** Spritesheets Pixel Art (Idle/Walk)

-----

*Fait main. Pixel par pixel.*

