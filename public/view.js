function isLand(x, y) {
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
        const screenX = Math.floor(x * ACTUAL_TILE_SIZE - camera.x);
        const screenY = Math.floor(y * ACTUAL_TILE_SIZE - camera.y);

        if (tileType === 0) {
          ctx.drawImage(
            images.grass,
            screenX,
            screenY,
            ACTUAL_TILE_SIZE + 1,
            ACTUAL_TILE_SIZE + 1
          );

          const textureId = textureMap[y][x];

          if (textureId > 0) {
            const srcX = (textureId - 1) * 16;

            const srcY = images.cliff.height - 16;

            ctx.drawImage(
              images.cliff,
              srcX,
              srcY,
              16,
              16,
              screenX,
              screenY,
              ACTUAL_TILE_SIZE + 1,
              ACTUAL_TILE_SIZE + 1
            );
          }
        } else if (tileType === 1) {
          drawWaterCoast(x, y, screenX, screenY);
        }
      }
    }
  }
}

function drawWaterCoast(gridX, gridY, screenX, screenY) {
  const landUp = isLand(gridX, gridY - 1);
  const landDown = isLand(gridX, gridY + 1);
  const landLeft = isLand(gridX - 1, gridY);
  const landRight = isLand(gridX + 1, gridY);

  const landUpLeft = isLand(gridX - 1, gridY - 1);
  const landUpRight = isLand(gridX + 1, gridY - 1);
  const landDownLeft = isLand(gridX - 1, gridY + 1);
  const landDownRight = isLand(gridX + 1, gridY + 1);

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

    const textureId = textureMap[gridY][gridX];

    if (textureId > 0) {
      const srcX = (textureId - 1) * 16;
      const srcY = images.waterAtlas.height - 16;

      ctx.drawImage(
        images.waterAtlas,
        srcX,
        srcY,
        16,
        16,
        screenX,
        screenY,
        ACTUAL_TILE_SIZE + 1,
        ACTUAL_TILE_SIZE + 1
      );
    }

    return;
  }

  let sheetX = 1;
  let sheetY = 1;

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
  } else if (landUp) {
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
  } else if (landDownRight) {
    sheetX = 0;
    sheetY = 3;
  } else if (landDownLeft) {
    sheetX = 1;
    sheetY = 3;
  } else if (landUpRight) {
    sheetX = 0;
    sheetY = 4;
  } else if (landUpLeft) {
    sheetX = 1;
    sheetY = 4;
  }

  ctx.drawImage(
    images.waterBase,
    screenX,
    screenY,
    ACTUAL_TILE_SIZE + 1,
    ACTUAL_TILE_SIZE + 1
  );
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
  const spriteH = spriteImg.height / 5;
  const drawW = spriteW * entity.scale;
  const drawH = spriteH * entity.scale;

  const screenX = entity.x - camera.x;
  const screenY = entity.y - camera.y;

  ctx.save();
  ctx.translate(screenX, screenY);
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

// --- SYSTÈME JOUR / NUIT DYNAMIQUE ---

function drawAtmosphere() {
  const now = new Date();
  const time = now.getHours() + now.getMinutes() / 60;
  // Pour tester, décommente la ligne ci-dessous pour forcer une heure (ex: 18.5 pour le coucher de soleil)
  // const time = 21;
  const atmosphere = getAtmosphereColor(time);

  if (time > 6 && time < 20) {
    drawSun(time);
  }

  ctx.save();
  if (time < 6 || time > 20) {
    ctx.globalCompositeOperation = "multiply";
  } else {
    ctx.globalCompositeOperation = "overlay";
  }

  ctx.fillStyle = `rgba(${atmosphere.r}, ${atmosphere.g}, ${atmosphere.b}, ${atmosphere.a})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();

  drawVignette(atmosphere.a);
}

function drawSun(time) {
  const percentDay = (time - 6) / (20 - 6);
  const sunX = canvas.width * (-0.2 + percentDay * 1.4);

  const heightFactor = Math.sin(percentDay * Math.PI);

  const sunY = canvas.height * 0.9 - canvas.height * 2.0 * heightFactor;

  const radius = Math.max(canvas.width, canvas.height) * 2.5;

  const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, radius);

  sunGlow.addColorStop(0, "rgba(255, 255, 240, 0.3)");
  sunGlow.addColorStop(0.3, "rgba(255, 255, 220, 0.15)");
  sunGlow.addColorStop(1, "rgba(255, 200, 150, 0)");

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawVignette(darknessLevel) {
  const radius = Math.hypot(canvas.width, canvas.height) / 2;
  const vignette = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    radius
  );

  const opacityEdge = 0.5 + darknessLevel * 0.4;

  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
  vignette.addColorStop(1, `rgba(0, 0, 0, ${opacityEdge})`);

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function getAtmosphereColor(hour) {
  if (hour < 5) return { r: 10, g: 10, b: 40, a: 0.85 };

  if (hour < 8) return { r: 255, g: 100, b: 50, a: 0.3 };

  if (hour < 17) return { r: 255, g: 255, b: 255, a: 0.05 };

  if (hour < 20) return { r: 255, g: 140, b: 20, a: 0.45 };

  if (hour < 24) return { r: 10, g: 10, b: 40, a: 0.85 };

  return { r: 0, g: 0, b: 0, a: 0 };
}
