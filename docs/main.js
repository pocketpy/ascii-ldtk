const tilemapAll = document.getElementById("tilemapAll");
const tilemapContainer = document.getElementById("tilemapContainer");
const tileSelector = document.getElementById("tileSelector");
const createMapBtn = document.getElementById("createMap");
const clearMapBtn = document.getElementById("clearMap");
const importMapBtn = document.getElementById("importMap");
const exportMapBtn = document.getElementById("exportMap");
const renderModeSelect = document.getElementById("renderMode");
const mapWidthInput = document.getElementById("mapWidth");
const scaleSlider = document.getElementById("scaleSlider");
const mapHeightInput = document.getElementById("mapHeight");

let tilemap = null;
let selectedTile = AllTiles[1]; // default selected tile
let isPainting = false;

const layers = ["t_ground", "t_floor", "t_plant", "t_block"];


document.addEventListener("mouseup", () => {
  isPainting = false;
});

function createTilemap(width, height) {
  const oldTileMap = tilemap;
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
  // 迁移旧数据
  if (oldTileMap !== null) {
    const oldWidth = oldTileMap[0].length;
    const oldHeight = oldTileMap.length;
    const minWidth = Math.min(width, oldWidth);
    const minHeight = Math.min(height, oldHeight);
    for (let y = 0; y < minHeight; y++) {
      for (let x = 0; x < minWidth; x++) {
        tilemap[y][x] = oldTileMap[y][x];
      }
    }
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

function updateTileDiv(cell, mode, tileDiv) {
  const topTile = mode === "all" ? getTopTile(cell) : cell[mode];
  tileDiv.textContent = topTile.char;
  tileDiv.style.backgroundColor = mode === "all" ? blendCellColor(cell) : (
    topTile.bg === null ? "transparent" : removeAlpha(topTile.bg)
  );
  if (topTile.fg) {
    tileDiv.style.color = `rgb(${topTile.fg.r},${topTile.fg.g},${topTile.fg.b})`;
  } else {
    tileDiv.style.color = "white";
  }
}

function paintCellAndUpdateTileDiv(cell, mode, tileDiv) {
  if (selectedTile.is_void()) {
    if (mode === "all") {
      for (const layer of layers) {
        cell[layer] = AllTiles[0];
      }
    } else {
      cell[mode] = AllTiles[0];
    }
  } else {
    if (selectedTile.layer !== mode && mode !== "all") {
      alert("Cannot place tile: '" + selectedTile.layer + "' != '" + mode + "'");
      return false;
    }
    cell[selectedTile.layer] = selectedTile;
  }
  // 重绘tileDiv
  updateTileDiv(cell, mode, tileDiv);
  return true;
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
      tileDiv.id = `tile-${x}-${y}`;
      tileDiv.dataset.x = x;
      tileDiv.dataset.y = y;
      tilemapContainer.appendChild(tileDiv);

      const mode = renderModeSelect.value;
      updateTileDiv(cell, mode, tileDiv);

      tileDiv.addEventListener("mousedown", (e) => {
        const ok = paintCellAndUpdateTileDiv(cell, mode, e.currentTarget);
        isPainting = ok;
      });

      tileDiv.addEventListener("mouseup", () => {
        isPainting = false;
      });

      tileDiv.addEventListener("mouseenter", (e) => {
        if (!isPainting) return;
        const ok = paintCellAndUpdateTileDiv(cell, mode, e.currentTarget);
        isPainting = ok;
      });
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

function removeAlpha(dst) {
  const alpha = dst.a / 255.0;
  let r = Math.round(dst.r * alpha);
  let g = Math.round(dst.g * alpha);
  let b = Math.round(dst.b * alpha);
  return `rgb(${r},${g},${b})`;
}

function blendCellColor(cell) {
  let dst = null;
  for (const layer of layers) {
    const tile = cell[layer];
    if (tile.bg === null) continue;
    dst = blendColor(tile.bg, dst);
  }
  if (dst === null) return "transparent";
  return removeAlpha(dst);
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

clearMapBtn.addEventListener("click", () => {
  tilemap = null;
  createTilemap(parseInt(mapWidthInput.value), parseInt(mapHeightInput.value));
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
  copyPopup(JSON.stringify(data));
});

renderModeSelect.addEventListener("change", renderTilemap);

scaleSlider.addEventListener("input", () => {
  const scale = parseInt(scaleSlider.value) / 100;
  tilemapAll.style.transform = `scale(${scale})`;
});

renderTileSelector();
createTilemap(parseInt(mapWidthInput.value), parseInt(mapHeightInput.value));

