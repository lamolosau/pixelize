// --- CONFIGURATION ---
const TILE_SIZE = 16;
const ZOOM = 3;
const ACTUAL_TILE_SIZE = TILE_SIZE * ZOOM; // 48px

const mapWidth = 50;
const mapHeight = 50;
const worldMap = [];

// --- CRÉATION DES DONNÉES DE LA CARTE ---
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
