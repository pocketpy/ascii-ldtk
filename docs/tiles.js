class Tile {
    constructor(id, layer, char, fg, bg, tileset, tileindex, tags, is_walkable) {
        this.id = id;
        this.layer = layer;
        this.char = char;
        this.fg = fg;
        this.bg = bg;
        this.tileset = tileset;
        this.tileindex = tileindex;
        this.tags = tags;
        this.is_walkable = is_walkable;
    }

    is_void() {
        return this.id === 0;
    }
}

function rgb(r, g, b) {
    return { r: r, g: g, b: b, a: 255 };
}

function rgba(r, g, b, a) {
    return { r: r, g: g, b: b, a: Math.round(a * 255) };
}

const AllTiles = {
    0: new Tile(0, "", " ", null, null, "", 0, [], false),
    1: new Tile(1, "t_ground", "・", null, null, "", 0, [], true),
    2: new Tile(2, "t_ground", "，", null, null, "", 0, [], true),
    3: new Tile(3, "t_ground", "〜", null, rgb(0, 191, 255), "", 0, [], false),
    25: new Tile(25, "t_floor", "　", null, rgba(255, 120, 0, 0.5), "", 0, [], true),
    50: new Tile(50, "t_plant", "🌿", null, null, "", 0, [], true),
    51: new Tile(51, "t_plant", "🌼", null, null, "", 0, [], true),
    52: new Tile(52, "t_plant", "🪨", null, null, "", 0, [], false),
    53: new Tile(53, "t_plant", "🔥", null, null, "", 0, [], true),
    54: new Tile(54, "t_plant", "🌲", null, null, "", 0, [], false),
    75: new Tile(75, "t_block", "🧱", null, null, "", 0, [], false),
    76: new Tile(76, "t_block", "⬜", null, null, "", 0, [], false),
};

const CommonTiles = {
    Void: AllTiles[0],
    Ground_Dirt: AllTiles[1],
    Ground_Rock: AllTiles[2],
    Ground_Water: AllTiles[3],
    Floor_Slime: AllTiles[25],
    Plant_Grass: AllTiles[50],
    Plant_Flower: AllTiles[51],
    Plant_Stone: AllTiles[52],
    Plant_Fire: AllTiles[53],
    Plant_Tree: AllTiles[54],
    Block_Dirt: AllTiles[75],
    Block_Rock: AllTiles[76],
};
