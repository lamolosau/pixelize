const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Configuration du joueur ---
const player = {
  x: 0,
  y: 0,
  size: 20, // Taille du carré
  speed: 5, // Vitesse
  color: "red",
};

// --- Gestion de la taille de l'écran ---
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Centrer le joueur au démarrage (si c'est le tout début)
  if (player.x === 0 && player.y === 0) {
    player.x = canvas.width / 2 - player.size / 2;
    player.y = canvas.height / 2 - player.size / 2;
  }
}
window.addEventListener("resize", resize);
resize();

// --- Gestion du Clavier ---
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// --- Boucle de Jeu ---
function loop() {
  // 1. Déplacement
  if (keys.ArrowUp) player.y -= player.speed;
  if (keys.ArrowDown) player.y += player.speed;
  if (keys.ArrowLeft) player.x -= player.speed;
  if (keys.ArrowRight) player.x += player.speed;

  // 2. Gestion des collisions avec les bords (NOUVEAU)

  // Mur de Gauche (x ne peut pas être inférieur à 0)
  if (player.x < 0) {
    player.x = 0;
  }

  // Mur du Haut (y ne peut pas être inférieur à 0)
  if (player.y < 0) {
    player.y = 0;
  }

  // Mur de Droite (x ne peut pas dépasser la largeur du canvas - la taille du joueur)
  if (player.x > canvas.width - player.size) {
    player.x = canvas.width - player.size;
  }

  // Mur du Bas (y ne peut pas dépasser la hauteur du canvas - la taille du joueur)
  if (player.y > canvas.height - player.size) {
    player.y = canvas.height - player.size;
  }

  // 3. Dessin
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Effacer l'écran
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size); // Dessiner le joueur

  requestAnimationFrame(loop);
}

loop();
