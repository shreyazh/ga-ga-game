import { Scene } from "../scene";
import { getPlayer } from "../player";
import { getCtx, loadImage } from "../render";
import { bgMapStartCorridor, loadBgTileMap, loadFgTileMap, fgMapStartCorridor } from "./sceneTiles";
import { generateTileMap } from "../tileGen";
import { Door } from "../door";
import door1Url from "../../assets/png/sprites/door1.png";
import { door1Animations } from "../../assets/png/sprites/animations";
import { workshop1 } from "./workshop1.scene";
import { start } from "./start.scene";


async function getStartData(oldData) {
    const redefines = {
        camera: { x: 0, y: -250, scale: 1 },
        bgTiles: generateTileMap(
            bgMapStartCorridor,
            await loadBgTileMap(),
            { x: -800, y: -400 },
            64, 
        ),
        fgTiles: generateTileMap(
            fgMapStartCorridor,
            await loadFgTileMap(),
            { x: -800, y: -400 },
            64, true,
        ),
        doors: [
            new Door(
                await loadImage(door1Url), door1Animations,
                -707, -183,
                start, {x: 265, y: 180}, [],  true,
            ),
            new Door(
                await loadImage(door1Url), door1Animations,
                765, -183,
                workshop1, {x: -100, y: 100}, [], false,
            ),
        ],
    };
    if (oldData.player) {
        return {
            ...oldData,
            ...redefines,
        }
    }
    return {
        ctx: getCtx(),
        player: await getPlayer(),
        ...redefines,
    };
}
export const startCorridor = new Scene({
    getData: getStartData,

    update(dt, exit) {
        this.data.player.update(dt);
        this.data.player.unCollide(this.data.fgTiles);
        this.data.player.goThroughDoor(this.data.doors, exit, this.data);
    },

    render(dt) {
        const ctx = this.data.ctx;
        this.data.camera.x = this.data.player.pos.x / 3;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        ctx.save();

        ctx.translate(
            window.innerWidth / 2,
            window.innerHeight / 2,
        );

        ctx.translate(
            -this.data.camera.x,
            -this.data.camera.y,
        );

        this.data.bgTiles.forEach(t => t.render());
        this.data.fgTiles.forEach(t => t.render());
        this.data.player.render(dt);
        this.data.doors.forEach(d => d.render(dt));
        ctx.restore();
    },
});
