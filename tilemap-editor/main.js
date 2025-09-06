const tilemapContainer = document.getElementById("tilemapContainer");
const tileSelector = document.getElementById("tileSelector");
const createMapBtn = document.getElementById("createMap");
const renderModeSelect = document.getElementById("renderMode");
const mapWidthInput = document.getElementById("mapWidth");
const scaleSlider = document.getElementById("scaleSlider");
const mapHeightInput = document.getElementById("mapHeight");

let tilemap = [];
let selectedTile = AllTiles[1]; // default selected tile

const layers = ["t_ground", "t_floor", "t_plant", "t_block"];

function createTilemap(width, height) {
  tilemap = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const cell = {
        t_ground: AllTiles[0],
        t_floor: AllTiles[0],
        t_plant: AllTiles[0],
        t_block: AllTiles[0],
      };
      row.push(cell);
    }
    tilemap.push(row);
  }
  renderTilemap();
}

function renderTilemap() {
  const xTicks = document.getElementById("xTicks");
  const yTicks = document.getElementById("yTicks");
  xTicks.innerHTML = "";
  yTicks.innerHTML = "";
  const width = tilemap[0].length;
  const height = tilemap.length;
  tilemapContainer.style.gridTemplateColumns = `repeat(${width}, 24px)`;
  tilemapContainer.innerHTML = "";
  for (let x = 0; x < width; x++) {
    const tick = document.createElement("div");
    tick.style.width = "24px";
    tick.style.height = "16px";
    tick.style.color = "black";
    tick.style.fontSize = "12px";
    tick.style.textAlign = "center";
    tick.textContent = x;
    xTicks.appendChild(tick);
  }

  for (let y = 0; y < height; y++) {
    const yTick = document.createElement("div");
    yTick.style.height = "24px";
    yTick.style.width = "16px";
    yTick.style.color = "black";
    yTick.style.fontSize = "12px";
    yTick.style.textAlign = "right";
    yTick.textContent = y;
    yTicks.appendChild(yTick);

    for (let x = 0; x < width; x++) {
      const cell = tilemap[y][x];
      const tileDiv = document.createElement("div");
      tileDiv.className = "tile";
      tileDiv.dataset.x = x;
      tileDiv.dataset.y = y;

      const mode = renderModeSelect.value;
      const topTile = mode === "all" ? getTopTile(cell) : cell[mode];
      tileDiv.textContent = topTile.char;
      tileDiv.style.backgroundColor = topTile.bg ? `rgba(${topTile.bg.r},${topTile.bg.g},${topTile.bg.b},${topTile.bg.a})` : (mode === "all" ? blendColor(cell) : "transparent");
      if (topTile.fg) {
        tileDiv.style.color = `rgb(${topTile.fg.r},${topTile.fg.g},${topTile.fg.b})`;
      }

      tileDiv.addEventListener("click", () => {
        cell[selectedTile.layer] = selectedTile;
        renderTilemap();
      });

      tilemapContainer.appendChild(tileDiv);
    }
  }
}

function getTopTile(cell) {
  for (let i = layers.length - 1; i >= 0; i--) {
    const tile = cell[layers[i]];
    if (!tile.is_void()) return tile;
  }
  return AllTiles[0];
}

function blendColor(cell) {
  let r = 255, g = 255, b = 255, a = 1;
  for (const layer of layers) {
    const tile = cell[layer];
    if (tile.bg) {
      const ta = tile.bg.a;
      r = r * (1 - ta) + tile.bg.r * ta;
      g = g * (1 - ta) + tile.bg.g * ta;
      b = b * (1 - ta) + tile.bg.b * ta;
    }
  }
  return `rgb(${r|0},${g|0},${b|0})`;
}

function renderTileSelector() {
  for (const id in AllTiles) {
    const tile = AllTiles[id];
    if (!tile.layer) continue;
    const btn = document.createElement("div");
    btn.className = "tile-option";
    btn.textContent = tile.char;
    btn.title = `${tile.layer} #${tile.id}`;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tile-option").forEach(el => el.classList.remove("selected"));
      btn.classList.add("selected");
      selectedTile = tile;
    });
    tileSelector.appendChild(btn);
  }
}

createMapBtn.addEventListener("click", () => {
  const width = parseInt(mapWidthInput.value);
  const height = parseInt(mapHeightInput.value);
  createTilemap(width, height);
});

renderTileSelector();
renderModeSelect.addEventListener("change", renderTilemap);
scaleSlider.addEventListener("input", () => {
  const scale = parseInt(scaleSlider.value) / 100;
  tilemapContainer.style.transform = `scale(${scale})`;
});
