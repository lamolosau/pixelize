const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- 1. CONFIGURATION ET VARIABLES GLOBALES ---
const TILE_SIZE = 16;
const ZOOM = 3;
const ACTUAL_TILE_SIZE = TILE_SIZE * ZOOM; // 48px

// Configuration de la carte
const mapWidth = 50;
const mapHeight = 50;
const worldMap = [];

// Caméra
const camera = { x: 0, y: 0 };

// Joueur
const player = {
  x: 0,
  y: 0,
  walkSpeed: 3,
  runSpeed: 6,
  hitboxSize: 20,
  scale: 3,
  frameY: 0,
  flip: false,
  moving: false,
  running: false,
  targetX: null,
  targetY: null,
  autoMoving: false,
  forceRun: false,
};

// --- 2. CHARGEMENT DES IMAGES ---
const images = {};
const imageSources = {
  idle: "idle.png",
  walk: "walk.png",
  run: "run.png",
  grass: "tiles/Grass_Middle.png", // L'herbe du sol (terre ferme)
  waterBase: "tiles/Water_Middle.png", // L'eau simple (au large)
  waterAtlas: "tiles/Water_Tile.png", // <--- TA TEXTURE AVEC LES BORDS
};

let imagesLoaded = 0;
const totalImages = Object.keys(imageSources).length;

// Fonction de chargement
for (let key in imageSources) {
  images[key] = new Image();
  images[key].src = imageSources[key];
  images[key].onload = () => {
    imagesLoaded++;
    console.log(`Image chargée: ${key} (${imagesLoaded}/${totalImages})`);
    if (imagesLoaded === totalImages) {
      startGame();
    }
  };
  images[key].onerror = () => {
    console.error(`Erreur de chargement pour l'image: ${imageSources[key]}`);
  };
}

// --- 3. INITIALISATION ---
function initMap() {
  // Création de l'île : Eau sur les bords, Herbe au milieu
  for (let y = 0; y < mapHeight; y++) {
    const row = [];
    for (let x = 0; x < mapWidth; x++) {
      // Bordures d'eau (5 cases d'épaisseur)
      if (x < 5 || x >= mapWidth - 5 || y < 5 || y >= mapHeight - 5) {
        row.push(1); // 1 = Eau
      } else {
        row.push(0); // 0 = Herbe
      }
    }
    worldMap.push(row);
  }
}

function startGame() {
  resize();
  initMap();
  loadGame();

  // Si le joueur est en 0,0 (chargement défaut), on le met au milieu de la map
  if (player.x === 0 && player.y === 0) {
    player.x = (mapWidth * ACTUAL_TILE_SIZE) / 2;
    player.y = (mapHeight * ACTUAL_TILE_SIZE) / 2;
  }

  loop();
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
  canvas.style.imageRendering = "pixelated";
}
window.addEventListener("resize", resize);

// --- 4. INPUTS (CLAVIER & SOURIS) ---
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  player.autoMoving = false; // Le clavier annule la souris
});
window.addEventListener("keyup", (e) => (keys[e.key] = false));

let lastClickTime = 0;
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  const currentTime = new Date().getTime();
  player.forceRun = currentTime - lastClickTime < 300;
  lastClickTime = currentTime;

  // IMPORTANT : On ajoute la caméra au clic pour avoir la position dans le MONDE
  player.targetX = e.clientX + camera.x;
  player.targetY = e.clientY + camera.y;
  player.autoMoving = true;
});
window.addEventListener("contextmenu", (e) => e.preventDefault());

function saveGame() {
  const saveData = { x: player.x, y: player.y };
  localStorage.setItem("myPixelGame_save", JSON.stringify(saveData));
}
function loadGame() {
  const saveString = localStorage.getItem("myPixelGame_save");
  if (saveString) {
    const d = JSON.parse(saveString);
    player.x = d.x;
    player.y = d.y;
  }
}

// --- 5. BOUCLE DE JEU (GAME LOOP) ---
let gameFrame = 0;

function loop() {
  // --- A. LOGIQUE ---
  let dx = 0;
  let dy = 0;
  let keyboardActive = false;

  // Clavier
  if (keys.ArrowUp) {
    dy = -1;
    keyboardActive = true;
  }
  if (keys.ArrowDown) {
    dy = 1;
    keyboardActive = true;
  }
  if (keys.ArrowLeft) {
    dx = -1;
    keyboardActive = true;
  }
  if (keys.ArrowRight) {
    dx = 1;
    keyboardActive = true;
  }

  // Souris (Auto-move)
  if (player.autoMoving) {
    const distGlobalX = player.targetX - player.x;
    const distGlobalY = player.targetY - player.y;
    const distance = Math.sqrt(distGlobalX ** 2 + distGlobalY ** 2);

    if (distance < 5) {
      player.autoMoving = false;
      player.x = player.targetX;
      player.y = player.targetY;
    } else {
      dx = distGlobalX / distance;
      dy = distGlobalY / distance;
    }
  }

  // État Course
  player.moving = dx !== 0 || dy !== 0;
  if (player.moving) {
    player.running = player.autoMoving ? player.forceRun : keys.Shift;
  } else {
    player.running = false;
  }

  // Mouvement & Physique
  if (player.moving) {
    let speed = player.running ? player.runSpeed : player.walkSpeed;
    if (keyboardActive && dx !== 0 && dy !== 0) speed /= 1.41;

    // --- NOUVEAU SYSTÈME DE DÉPLACEMENT ---

    // 1. On calcule la future position X
    const nextX = player.x + dx * speed;

    // On vérifie si on a le droit d'aller à nextX (en gardant le Y actuel)
    if (isWalkable(nextX, player.y)) {
      player.x = nextX;
    } else {
      // Collision en X ! Si on est en déplacement auto (souris), on s'arrête
      if (player.autoMoving) player.autoMoving = false;
    }

    // 2. On calcule la future position Y
    const nextY = player.y + dy * speed;

    // On vérifie si on a le droit d'aller à nextY (en gardant le X, potentiellement déjà bougé)
    if (isWalkable(player.x, nextY)) {
      player.y = nextY;
    } else {
      // Collision en Y !
      if (player.autoMoving) player.autoMoving = false;
    }

    // Limites du monde (Sécurité supplémentaire)
    const margin = player.hitboxSize;
    const worldW = mapWidth * ACTUAL_TILE_SIZE;
    const worldH = mapHeight * ACTUAL_TILE_SIZE;

    player.x = Math.max(margin, Math.min(worldW - margin, player.x));
    player.y = Math.max(margin, Math.min(worldH - margin, player.y));

    // Animation frames
    player.flip = false;
    if (dy > 0.5) {
      player.frameY = Math.abs(dx) < 0.5 ? 0 : 1;
      if (dx < 0) player.flip = true;
    } else if (dy < -0.5) {
      player.frameY = Math.abs(dx) < 0.5 ? 4 : 3;
      if (dx < 0) player.flip = true;
    } else if (Math.abs(dx) > 0.1) {
      player.frameY = 2;
      if (dx < 0) player.flip = true;
    }

    saveGame();
  }

  // MISE À JOUR CAMÉRA
  camera.x = player.x - canvas.width / 2;
  camera.y = player.y - canvas.height / 2;
  // Bloquer la caméra aux bords du monde
  const worldMaxX = mapWidth * ACTUAL_TILE_SIZE - canvas.width;
  const worldMaxY = mapHeight * ACTUAL_TILE_SIZE - canvas.height;
  camera.x = Math.max(0, Math.min(camera.x, worldMaxX));
  camera.y = Math.max(0, Math.min(camera.y, worldMaxY));

  // --- B. DESSIN ---
  // Fond noir (si en dehors de la map)
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. Dessiner la carte
  drawMap();

  // 2. Indicateur Clic
  if (player.autoMoving) {
    ctx.beginPath();
    // Conversion Monde -> Écran
    ctx.arc(
      player.targetX - camera.x,
      player.targetY - camera.y,
      5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fill();
  }

  // 3. Dessiner le joueur
  drawPlayerSprite(player);

  gameFrame++;
  requestAnimationFrame(loop);
}

// --- 6. FONCTIONS DE DESSIN ---

// Helper : Vérifie si une case est de l'herbe (terre ferme)
function isLand(x, y) {
  // Si on sort de la map, on considère que ce n'est PAS de la terre (c'est l'océan infini)
  if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) return false;
  return worldMap[y][x] === 0;
}

function drawMap() {
  const startCol = Math.floor(camera.x / ACTUAL_TILE_SIZE);
  const endCol = startCol + canvas.width / ACTUAL_TILE_SIZE + 1;
  const startRow = Math.floor(camera.y / ACTUAL_TILE_SIZE);
  const endRow = startRow + canvas.height / ACTUAL_TILE_SIZE + 1;

  for (let y = startRow; y <= endRow; y++) {
    for (let x = startCol; x <= endCol; x++) {
      if (y >= 0 && y < mapHeight && x >= 0 && x < mapWidth) {
        const tileType = worldMap[y][x];

        // Calcul position écran
        const screenX = Math.floor(x * ACTUAL_TILE_SIZE - camera.x);
        const screenY = Math.floor(y * ACTUAL_TILE_SIZE - camera.y);

        if (tileType === 0) {
          // --- C'EST DE LA TERRE ---
          // On dessine juste l'herbe simple
          ctx.drawImage(
            images.grass,
            screenX,
            screenY,
            ACTUAL_TILE_SIZE + 1,
            ACTUAL_TILE_SIZE + 1
          );
        } else if (tileType === 1) {
          // --- C'EST DE L'EAU ---
          // On appelle la fonction spéciale pour les rivages
          drawWaterCoast(x, y, screenX, screenY);
        }
      }
    }
  }
}

function drawWaterCoast(gridX, gridY, screenX, screenY) {
  // 1. Voisins directs
  const landUp = isLand(gridX, gridY - 1);
  const landDown = isLand(gridX, gridY + 1);
  const landLeft = isLand(gridX - 1, gridY);
  const landRight = isLand(gridX + 1, gridY);

  // 2. Voisins diagonales
  const landUpLeft = isLand(gridX - 1, gridY - 1);
  const landUpRight = isLand(gridX + 1, gridY - 1);
  const landDownLeft = isLand(gridX - 1, gridY + 1);
  const landDownRight = isLand(gridX + 1, gridY + 1);

  // Si c'est de l'eau pure, on dessine et on s'arrête
  if (
    !landUp &&
    !landDown &&
    !landLeft &&
    !landRight &&
    !landUpLeft &&
    !landUpRight &&
    !landDownLeft &&
    !landDownRight
  ) {
    ctx.drawImage(
      images.waterBase,
      screenX,
      screenY,
      ACTUAL_TILE_SIZE + 1,
      ACTUAL_TILE_SIZE + 1
    );
    return;
  }

  let sheetX = 1;
  let sheetY = 1;

  // --- A. BORDS INTÉRIEURS (Lac) ---
  if (landUp && landLeft) {
    sheetX = 0;
    sheetY = 0;
  } else if (landUp && landRight) {
    sheetX = 2;
    sheetY = 0;
  } else if (landDown && landLeft) {
    sheetX = 0;
    sheetY = 2;
  } else if (landDown && landRight) {
    sheetX = 2;
    sheetY = 2;
  }

  // --- B. MURS ---
  else if (landUp) {
    sheetX = 1;
    sheetY = 0;
  } else if (landDown) {
    sheetX = 1;
    sheetY = 2;
  } else if (landLeft) {
    sheetX = 0;
    sheetY = 1;
  } else if (landRight) {
    sheetX = 2;
    sheetY = 1;
  }

  // --- C. POINTES (Île) ---
  // On garde la ligne 3 pour le HAUT (puisque tu m'as confirmé qu'elle marche)
  // On tente la ligne 6 pour le BAS (souvent l'écart standard)
  else if (landDownRight) {
    sheetX = 0;
    sheetY = 3; // Coin Haut-Gauche (MARCHE)
  } else if (landDownLeft) {
    sheetX = 1;
    sheetY = 3; // Coin Haut-Droit
  } else if (landUpRight) {
    sheetX = 0;
    sheetY = 4; // Coin Bas-Gauche (Essai ligne 6)
  } else if (landUpLeft) {
    sheetX = 1;
    sheetY = 4; // Coin Bas-Droit (celui de ton screen)
  }

  // --- CORRECTION DU PROBLÈME NOIR ---
  // On dessine d'abord l'eau bleue de base pour combler la transparence
  ctx.drawImage(
    images.waterBase,
    screenX,
    screenY,
    ACTUAL_TILE_SIZE + 1,
    ACTUAL_TILE_SIZE + 1
  );

  // Ensuite, on dessine la texture de bordure par-dessus
  const srcSize = 16;
  ctx.drawImage(
    images.waterAtlas,
    sheetX * srcSize,
    sheetY * srcSize,
    srcSize,
    srcSize,
    screenX,
    screenY,
    ACTUAL_TILE_SIZE + 1,
    ACTUAL_TILE_SIZE + 1
  );
}

function drawPlayerSprite(entity) {
  let spriteImg = images.idle;
  let maxFrames = 4;
  let stagger = 20;

  if (entity.moving) {
    if (entity.running) {
      spriteImg = images.run;
      maxFrames = 6;
      stagger = 5;
    } else {
      spriteImg = images.walk;
      maxFrames = 4;
      stagger = 8;
    }
  }

  const frameX = Math.floor(gameFrame / stagger) % maxFrames;
  const spriteW = spriteImg.width / maxFrames;
  const spriteH = spriteImg.height / 5; // 5 rangées dans ton sprite
  const drawW = spriteW * entity.scale;
  const drawH = spriteH * entity.scale;

  // Position Écran = Position Monde - Caméra
  const screenX = entity.x - camera.x;
  const screenY = entity.y - camera.y;

  ctx.save();
  ctx.translate(screenX, screenY);
  if (entity.flip) ctx.scale(-1, 1);

  // Ombre
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, drawH / 2 - 5, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Sprite
  ctx.drawImage(
    spriteImg,
    frameX * spriteW,
    entity.frameY * spriteH + 1, // +1 petite correction pixel
    spriteW,
    spriteH,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH
  );

  ctx.restore();
}

// --- 7. SYSTÈME DE COLLISIONS ---
function isWalkable(targetX, targetY) {
  // On définit la zone de collision autour des pieds du joueur
  // On divise par 2 car hitboxSize est le diamètre
  const radius = player.hitboxSize / 2;

  // On vérifie 4 points autour du joueur (Haut-Gauche, Haut-Droit, Bas-Gauche, Bas-Droit)
  const pointsToCheck = [
    { x: targetX - radius, y: targetY - radius },
    { x: targetX + radius, y: targetY - radius },
    { x: targetX - radius, y: targetY + radius / 2 }, // Pieds un peu plus bas
    { x: targetX + radius, y: targetY + radius / 2 },
  ];

  for (let point of pointsToCheck) {
    // Conversion Pixel -> Grille
    const gridX = Math.floor(point.x / ACTUAL_TILE_SIZE);
    const gridY = Math.floor(point.y / ACTUAL_TILE_SIZE);

    // 1. Vérifier si on sort de la map
    if (gridX < 0 || gridX >= mapWidth || gridY < 0 || gridY >= mapHeight) {
      return false;
    }

    // 2. Vérifier le type de terrain
    // Si ce n'est pas de l'herbe (0), on bloque !
    if (worldMap[gridY][gridX] !== 0) {
      return false;
    }
  }

  return true; // Tout est bon, on peut y aller
}
