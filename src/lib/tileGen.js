import { DOWN, LEFT, RIGHT, UP } from "./player";
import { getCtx } from "./render";

class Tile {
    static getCtx() {
        if (!this.ctx) this.ctx = getCtx();
        this.ctx.imageSmoothingEnabled = false;
        return this.ctx;
    }

    constructor(image, x, y, tileSize, mask, isLadder) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.w = this.h = tileSize;
        this.mask = mask;
        this.isLadder = isLadder;
    }

    render = () => Tile.getCtx().drawImage(this.image, this.x, this.y, this.w, this.h);
}

export class Ladder {
    constructor(ladderTile) {
        this.x = ladderTile.x + 30;
        this.y = ladderTile.y - 10;
        this.w = ladderTile.w - 60;
        this.h = ladderTile.h + 10;
    }
}

export function generateTileMap(map, tileMap, startCoords, tileSize, genMask = true) {
    const tiles = [];
    for (let i = 0; i < map.length; i++) {
        const mapi = map[i];
        for (let j = 0; j < mapi.length; j++) {
            const mapij = mapi[j];
            if (mapij == " ") continue;
            const random = Math.random();

            let mask = 0;
            if (genMask) {
                if (i > 0 && map[i - 1][j] == " ") {
                    mask += UP;
                }
                if (j > 0 && mapi[j - 1] == " ") {
                    mask += LEFT;
                }
                if (i < map.length - 2 && map[i + 1][j] == " ") {
                    mask += DOWN;
                }
                if (j < map.length - 2 && mapi[j + 1] == " ") {
                    mask += RIGHT;
                }
            }

            const tile = tileMap[mapij].filter(l => l[1] > random)[0];
            tiles.push(new Tile(
                tile[0],
                j * (tileSize) - 1 + startCoords.x,
                i * (tileSize) - 1 + startCoords.y,
                tileSize,
                mask,
                tile[2] || false,
            ));
        }
    }
    return tiles;
}
