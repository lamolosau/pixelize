const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- 1. CHARGEMENT DES IMAGES ---
const idleImage = new Image();
idleImage.src = "idle.png";
const walkImage = new Image();
walkImage.src = "walk.png";
const runImage = new Image();
runImage.src = "run.png";

let imagesLoaded = 0;
function checkImagesLoaded() {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    resize();
    loadGame();
    loop();
  }
}
idleImage.onload = checkImagesLoaded;
walkImage.onload = checkImagesLoaded;
runImage.onload = checkImagesLoaded;

// --- 2. CONFIGURATION ---
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

// --- 4. INPUTS & UTILITAIRES ---
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
  player.targetX = e.clientX;
  player.targetY = e.clientY;
  player.autoMoving = true;
});
window.addEventListener("contextmenu", (e) => e.preventDefault());

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
  canvas.style.imageRendering = "pixelated";
  if (player.x === 0 && player.y === 0) {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
  }
}
window.addEventListener("resize", resize);

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
  } else {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
  }
}

// --- 5. MOTEUR DU JEU ---
let gameFrame = 0;

function loop() {
  // A. LOGIQUE DU JOUEUR LOCAL
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

  // Souris
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

  // État mouvement
  player.moving = dx !== 0 || dy !== 0;
  if (player.moving) {
    player.running = player.autoMoving ? player.forceRun : keys.Shift;
  } else {
    player.running = false;
  }

  // Application Physique
  if (player.moving) {
    let speed = player.running ? player.runSpeed : player.walkSpeed;
    if (keyboardActive && dx !== 0 && dy !== 0) speed /= 1.41;

    player.x += dx * speed;
    player.y += dy * speed;

    // Limites écran
    const margin = (player.hitboxSize * player.scale) / 2;
    player.x = Math.max(margin, Math.min(canvas.width - margin, player.x));
    player.y = Math.max(margin, Math.min(canvas.height - margin, player.y));

    // Direction (Flip / FrameY)
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

  // B. DESSIN (RENDU)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Indicateur Clic
  if (player.autoMoving) {
    ctx.beginPath();
    ctx.arc(player.targetX, player.targetY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fill();
  }

  // Dessin du joueur
  drawSprite(player);

  gameFrame++;
  requestAnimationFrame(loop);
}

// --- 6. FONCTION DE DESSIN GÉNÉRIQUE ---
function drawSprite(entity) {
  let spriteImg = idleImage;
  let maxFrames = 4;
  let stagger = 20;

  if (entity.moving) {
    if (entity.running) {
      spriteImg = runImage;
      maxFrames = 6;
      stagger = 5;
    } else {
      spriteImg = walkImage;
      maxFrames = 4;
      stagger = 8;
    }
  }

  const frameX = Math.floor(gameFrame / stagger) % maxFrames;

  const spriteW = spriteImg.width / maxFrames;
  const spriteH = spriteImg.height / 5;
  const drawW = spriteW * player.scale;
  const drawH = spriteH * player.scale;

  ctx.save();
  ctx.translate(entity.x, entity.y);
  if (entity.flip) ctx.scale(-1, 1);

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, drawH / 2 - 5, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(
    spriteImg,
    frameX * spriteW,
    entity.frameY * spriteH + 1,
    spriteW,
    spriteH,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH
  );

  ctx.restore();
}
