const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- 1. CHARGEMENT ---
const idleImage = new Image();
idleImage.src = "idle.png";

const walkImage = new Image();
walkImage.src = "walk.png";

let imagesLoaded = 0;
const totalImages = 2;

function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    // Une fois les images chargées, on tente de charger la sauvegarde
    loadGame();
    resize();
    loop();
  }
}
idleImage.onload = checkImagesLoaded;
walkImage.onload = checkImagesLoaded;

// --- 2. CONFIGURATION ---
const player = {
  x: 0,
  y: 0,
  speed: 3,
  width: 20,
  height: 20,
  scale: 3,
  frameX: 0,
  frameY: 0,
  moving: false,
  flip: false,
};

let gameFrame = 0;

// --- FONCTIONS DE SAUVEGARDE (NOUVEAU) ---

function saveGame() {
  const saveData = {
    x: player.x,
    y: player.y,
    frameY: player.frameY,
    flip: player.flip,
  };
  // On transforme l'objet en texte pour le stocker
  localStorage.setItem("myPixelGame_save", JSON.stringify(saveData));
}

function loadGame() {
  const saveString = localStorage.getItem("myPixelGame_save");

  if (saveString) {
    // Si une sauvegarde existe, on la lit
    const saveData = JSON.parse(saveString);
    player.x = saveData.x;
    player.y = saveData.y;
    player.frameY = saveData.frameY;
    player.flip = saveData.flip;
  } else {
    // Sinon (première fois), on centre le joueur
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
  }
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
  canvas.style.imageRendering = "pixelated";

  // Si le joueur est à 0,0 (bug ou pas de save chargée), on centre par sécurité
  // Mais on évite d'écraser la position chargée par loadGame
  if (player.x === 0 && player.y === 0) {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
  }
}
window.addEventListener("resize", resize);

const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

function loop() {
  // --- 3. DÉPLACEMENT ---
  let dx = 0;
  let dy = 0;

  if (keys.ArrowUp) dy = -1;
  if (keys.ArrowDown) dy = 1;
  if (keys.ArrowLeft) dx = -1;
  if (keys.ArrowRight) dx = 1;

  player.moving = dx !== 0 || dy !== 0;

  if (player.moving) {
    let currentSpeed = player.speed;
    if (dx !== 0 && dy !== 0) currentSpeed /= 1.41;

    player.x += dx * currentSpeed;
    player.y += dy * currentSpeed;

    // Collisions
    const halfSize = (player.width * player.scale) / 2;
    if (player.x < halfSize) player.x = halfSize;
    if (player.y < halfSize) player.y = halfSize;
    if (player.x > canvas.width - halfSize) player.x = canvas.width - halfSize;
    if (player.y > canvas.height - halfSize)
      player.y = canvas.height - halfSize;

    // --- 4. DIRECTION ET MIROIR ---
    player.flip = false;

    if (dy > 0) {
      if (dx === 0) player.frameY = 0;
      else {
        player.frameY = 1;
        if (dx < 0) player.flip = true;
      }
    } else if (dy < 0) {
      if (dx === 0) player.frameY = 4;
      else {
        player.frameY = 3;
        if (dx < 0) player.flip = true;
      }
    } else if (dx !== 0) {
      player.frameY = 2;
      if (dx < 0) player.flip = true;
    }

    // --- SAUVEGARDE AUTOMATIQUE ---
    // On sauvegarde dès qu'on bouge
    saveGame();
  }

  // --- 5. CHOIX DU SPRITE ---
  const currentSprite = player.moving ? walkImage : idleImage;

  // --- 6. ANIMATION ---
  const staggerFrames = player.moving ? 8 : 20;

  if (gameFrame % staggerFrames === 0) {
    if (player.frameX < 3) player.frameX++;
    else player.frameX = 0;
  }
  gameFrame++;

  // --- 7. DESSIN ---
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.flip) ctx.scale(-1, 1);

  const drawW = player.width * player.scale;
  const drawH = player.height * player.scale;

  const offsetY = 0.1;
  const clipHeight = 0.2;

  ctx.drawImage(
    currentSprite,
    player.frameX * player.width,
    player.frameY * player.height + offsetY,
    player.width,
    player.height - clipHeight,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH
  );

  ctx.restore();
  requestAnimationFrame(loop);
}

// NOTE : Pour réinitialiser la position un jour, tape :
// localStorage.clear();
// dans la console du navigateur.
