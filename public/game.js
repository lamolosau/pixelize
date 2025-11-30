const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Caméra & Joueur
const camera = { x: 0, y: 0 };
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

// --- CHARGEMENT ---
const images = {};
const imageSources = {
  idle: "idle.png",
  walk: "walk.png",
  run: "run.png",
  grass: "tiles/Grass_Middle.png",
  waterBase: "tiles/Water_Middle.png",
  waterAtlas: "tiles/Water_Tile.png",
  cliff: "tiles/Cliff_Tile.png",
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
      console.log("Tout est chargé, en attente du joueur...");
      document.getElementById("start-btn").addEventListener("click", () => {
        document.getElementById("start-screen").style.display = "none";
        startGame();
      });
    }
  };
}

// --- INITIALISATION ---
function startGame() {
  resize();
  initMap();
  loadGame();

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

// --- INPUTS ---
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  player.autoMoving = false;
});
window.addEventListener("keyup", (e) => (keys[e.key] = false));

let lastClickTime = 0;
canvas.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  const currentTime = new Date().getTime();
  player.forceRun = currentTime - lastClickTime < 300;
  lastClickTime = currentTime;
  player.targetX = e.clientX + camera.x;
  player.targetY = e.clientY + camera.y;
  player.autoMoving = true;
});
window.addEventListener("contextmenu", (e) => e.preventDefault());

function saveGame() {
  localStorage.setItem(
    "myPixelGame_save",
    JSON.stringify({ x: player.x, y: player.y })
  );
}
function loadGame() {
  const saveString = localStorage.getItem("myPixelGame_save");
  if (saveString) {
    const d = JSON.parse(saveString);
    player.x = d.x;
    player.y = d.y;
  }
}

// --- BOUCLE DE JEU ---
let gameFrame = 0;

function loop() {
  // 1. LOGIQUE DE DÉPLACEMENT
  let dx = 0;
  let dy = 0;
  let keyboardActive = false;

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

  player.moving = dx !== 0 || dy !== 0;
  player.running = player.moving
    ? player.autoMoving
      ? player.forceRun
      : keys.Shift
    : false;

  if (player.moving) {
    let speed = player.running ? player.runSpeed : player.walkSpeed;
    if (keyboardActive && dx !== 0 && dy !== 0) speed /= 1.41;

    const nextX = player.x + dx * speed;
    if (isWalkable(nextX, player.y)) player.x = nextX;
    else if (player.autoMoving) player.autoMoving = false;

    const nextY = player.y + dy * speed;
    if (isWalkable(player.x, nextY)) player.y = nextY;
    else if (player.autoMoving) player.autoMoving = false;

    // Limites monde
    const margin = player.hitboxSize;
    player.x = Math.max(
      margin,
      Math.min(mapWidth * ACTUAL_TILE_SIZE - margin, player.x)
    );
    player.y = Math.max(
      margin,
      Math.min(mapHeight * ACTUAL_TILE_SIZE - margin, player.y)
    );

    // Animation frames logic
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

  // Camera update
  camera.x = Math.max(
    0,
    Math.min(
      player.x - canvas.width / 2,
      mapWidth * ACTUAL_TILE_SIZE - canvas.width
    )
  );
  camera.y = Math.max(
    0,
    Math.min(
      player.y - canvas.height / 2,
      mapHeight * ACTUAL_TILE_SIZE - canvas.height
    )
  );

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMap();

  if (player.autoMoving) {
    ctx.beginPath();
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

  drawPlayerSprite(player);

  gameFrame++;
  requestAnimationFrame(loop);
}

function isWalkable(targetX, targetY) {
  const radius = player.hitboxSize / 2;
  const pointsToCheck = [
    { x: targetX - radius, y: targetY - radius },
    { x: targetX + radius, y: targetY - radius },
    { x: targetX - radius, y: targetY + radius / 2 },
    { x: targetX + radius, y: targetY + radius / 2 },
  ];

  for (let point of pointsToCheck) {
    const gridX = Math.floor(point.x / ACTUAL_TILE_SIZE);
    const gridY = Math.floor(point.y / ACTUAL_TILE_SIZE);
    if (gridX < 0 || gridX >= mapWidth || gridY < 0 || gridY >= mapHeight)
      return false;
    if (worldMap[gridY][gridX] !== 0) return false;
  }
  return true;
}
