const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const socket = io();

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
  }
}

// --- GESTION DU LOGIN ---
const loginModal = document.getElementById("loginModal");
const usernameInput = document.getElementById("usernameInput");
const playBtn = document.getElementById("playBtn");

playBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name.length > 0) {
    player.name = name;
    loginModal.style.display = "none";

    socket.emit("playerMovement", {
      x: player.x,
      y: player.y,
      frameY: player.frameY,
      flip: player.flip,
      moving: false,
      running: false,
      name: player.name,
    });

    loop();
  }
});
idleImage.onload = checkImagesLoaded;
walkImage.onload = checkImagesLoaded;
runImage.onload = checkImagesLoaded;

// --- 2. CONFIGURATION ---
const player = {
  id: "local",
  name: "Joueur",
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

const otherPlayers = {};

// --- 3. GESTION RESEAU (SOCKET.IO) ---

socket.on("currentPlayers", (serverPlayers) => {
  for (const id in serverPlayers) {
    if (id !== socket.id) {
      otherPlayers[id] = serverPlayers[id];
    } else {
      // Optionnel: si tu veux que le serveur force ta position au début
      // player.x = serverPlayers[id].x;
      // player.y = serverPlayers[id].y;
    }
  }
});

// Un nouveau joueur arrive
socket.on("newPlayer", (data) => {
  otherPlayers[data.id] = data.player;
});

// Un joueur bouge
socket.on("playerMoved", (data) => {
  if (otherPlayers[data.id]) {
    otherPlayers[data.id].x = data.x;
    otherPlayers[data.id].y = data.y;
    otherPlayers[data.id].frameY = data.frameY;
    otherPlayers[data.id].flip = data.flip;
    otherPlayers[data.id].moving = data.moving;
    otherPlayers[data.id].running = data.running;
    otherPlayers[data.id].name = data.name;
  }
});

// Déconnexion
socket.on("playerDisconnected", (id) => {
  delete otherPlayers[id];
});

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

// Sauvegarde locale simple
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

    // ENVOI AU SERVEUR
    socket.emit("playerMovement", {
      x: player.x,
      y: player.y,
      frameY: player.frameY,
      flip: player.flip,
      moving: true,
      running: player.running,
      name: player.name,
    });
    saveGame();
  } else {
    socket.emit("playerMovement", {
      x: player.x,
      y: player.y,
      frameY: player.frameY,
      flip: player.flip,
      moving: false,
      running: false,
      name: player.name,
    });
  }

  // B. DESSIN (RENDU)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (player.autoMoving) {
    ctx.beginPath();
    ctx.arc(player.targetX, player.targetY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fill();
  }

  const entitiesToDraw = [player];
  for (const id in otherPlayers) {
    entitiesToDraw.push(otherPlayers[id]);
  }

  entitiesToDraw.sort((a, b) => a.y - b.y);

  entitiesToDraw.forEach((entity) => drawSprite(entity));

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

  const cutTop = 1;
  const cutBottom = 0;

  // 1. DESSIN DU PERSONNAGE
  ctx.save();
  ctx.translate(Math.floor(entity.x), Math.floor(entity.y));
  if (entity.flip) ctx.scale(-1, 1);

  // Ombre
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, drawH / 2 - 5, 10, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.drawImage(
    spriteImg,
    frameX * spriteW,
    entity.frameY * spriteH + cutTop,
    spriteW,
    spriteH - cutTop - cutBottom,
    -drawW / 2,
    -drawH / 2,
    drawW,
    drawH
  );
  ctx.restore();

  // 2. DESSIN DU PSEUDO (Nouveau !)
  if (entity.name) {
    ctx.save();

    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = "center";

    ctx.fillStyle = "black";
    ctx.fillText(entity.name, entity.x + 2, entity.y - drawH / 2 - 5 + 2);

    ctx.fillStyle = "white";
    ctx.fillText(entity.name, entity.x, entity.y - drawH / 2 - 5);
    ctx.restore();
  }
}
