const TILE_SIZE = 16;
const ZOOM = 3;
const ACTUAL_TILE_SIZE = TILE_SIZE * ZOOM;

const mapWidth = 50;
const mapHeight = 50;
const worldMap = [];
const textureMap = [];

function initMap() {
  for (let y = 0; y < mapHeight; y++) {
    const row = [];
    const textureRow = [];

    for (let x = 0; x < mapWidth; x++) {
      let type = 0;
      if (x < 5 || x >= mapWidth - 5 || y < 5 || y >= mapHeight - 5) {
        type = 1;
      }
      row.push(type);

      if (type === 0 && Math.random() < 0.01) {
        textureRow.push(Math.floor(Math.random() * 3) + 1);
      } else if (type === 1 && Math.random() < 0.01) {
        textureRow.push(Math.floor(Math.random() * 3) + 1);
      } else {
        textureRow.push(0);
      }
    }
    worldMap.push(row);
    textureMap.push(textureRow);
  }
}
