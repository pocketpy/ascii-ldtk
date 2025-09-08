const tilemapAll = document.getElementById("tilemapAll");
const tilemapContainer = document.getElementById("tilemapContainer");
const tileSelector = document.getElementById("tileSelector");
const createMapBtn = document.getElementById("createMap");
const importMapBtn = document.getElementById("importMap");
const exportMapBtn = document.getElementById("exportMap");
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

function importTilemap(data) {
  const width = data.width;
  const height = data.height;
  tilemap = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const cell = {
        t_ground: AllTiles[data.t_ground[y][x]] || AllTiles[0],
        t_floor: AllTiles[data.t_floor[y][x]] || AllTiles[0],
        t_plant: AllTiles[data.t_plant[y][x]] || AllTiles[0],
        t_block: AllTiles[data.t_block[y][x]] || AllTiles[0],
      };
      row.push(cell);
    }
    tilemap.push(row);
  }
}

function exportTilemap() {
  const width = tilemap[0].length;
  const height = tilemap.length;
  return {
    width: width,
    height: height,
    t_ground: tilemap.map(row => row.map(cell => cell.t_ground.id)),
    t_floor: tilemap.map(row => row.map(cell => cell.t_floor.id)),
    t_plant: tilemap.map(row => row.map(cell => cell.t_plant.id)),
    t_block: tilemap.map(row => row.map(cell => cell.t_block.id)),
  }
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

  // yTicks append a space height the same as xTicks
  yTicks.appendChild(document.createElement("div")).style.height = "16px";
  for (let y = 0; y < height; y++) {
    const yTick = document.createElement("div");
    yTick.style.height = "24px";
    yTick.style.width = "16px";
    yTick.style.color = "black";
    yTick.style.fontSize = "12px";
    yTick.style.textAlign = "right";
    // center vertically and right align
    yTick.style.display = "flex";
    yTick.style.alignItems = "center";
    yTick.style.justifyContent = "flex-end";
    // add some padding to the right
    yTick.style.paddingRight = "4px";
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
      tileDiv.style.backgroundColor = topTile.bg ? `rgba(${topTile.bg.r},${topTile.bg.g},${topTile.bg.b},${topTile.bg.a})` : (mode === "all" ? blendCellColor(cell) : "transparent");
      if (topTile.fg) {
        tileDiv.style.color = `rgb(${topTile.fg.r},${topTile.fg.g},${topTile.fg.b})`;
      }

      tileDiv.addEventListener("click", () => {
        if (selectedTile.is_void()) {
          if (mode === "all") {
            for (const layer of layers) {
              cell[layer] = AllTiles[0];
            }
          } else {
            cell[mode] = AllTiles[0];
          }
        } else {
          if (selectedTile.layer !== mode && mode !== "all") return;
          cell[selectedTile.layer] = selectedTile;
        }
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

function blendColor(src, dst_or_null) {
  if (dst_or_null === null) return src;
  const dst = dst_or_null;
  const alpha = src.a / 255.0;
  const r = Math.round(src.r * alpha + dst.r * (1 - alpha));
  const g = Math.round(src.g * alpha + dst.g * (1 - alpha));
  const b = Math.round(src.b * alpha + dst.b * (1 - alpha));
  const a = Math.round((src.a + dst.a * (1 - alpha)));
  return { r, g, b, a };
}

function blendCellColor(cell) {
  let src = null;
  for (const layer of layers) {
    const tile = cell[layer];
    if (tile.bg === null) continue;
    src = blendColor(tile.bg, src);
  }
  return src === null ? "transparent" : `rgba(${src.r},${src.g},${src.b},${(src.a / 255).toFixed(2)})`;
}

function renderTileSelector() {
  for (const id in AllTiles) {
    const tile = AllTiles[id];
    // if (!tile.layer) continue;
    const btn = document.createElement("div");
    btn.style.width = "20px";
    btn.style.height = "24px";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";

    btn.className = "tile-option";
    btn.textContent = tile.char;
    if (tile.fg) {
      btn.style.color = `rgb(${tile.fg.r},${tile.fg.g},${tile.fg.b})`;
    }
    if (tile.bg) {
      btn.style.backgroundColor = `rgba(${tile.bg.r},${tile.bg.g},${tile.bg.b},${tile.bg.a})`;
    }
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

importMapBtn.addEventListener("click", () => {
  const data = prompt("Paste tilemap JSON data:");
  if (data) {
    const obj = JSON.parse(data);
    importTilemap(obj);
    renderTilemap();
  }
});

exportMapBtn.addEventListener("click", () => {
  const data = exportTilemap();
  console.log(JSON.stringify(data));
});

renderTileSelector();
renderModeSelect.addEventListener("change", renderTilemap);
scaleSlider.addEventListener("input", () => {
  const scale = parseInt(scaleSlider.value) / 100;
  tilemapAll.style.transform = `scale(${scale})`;
});
