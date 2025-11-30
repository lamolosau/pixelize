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
