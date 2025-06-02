import { Scene } from "../scene";
import { getPlayer } from "../player";
import { AnimatedSprite, getCtx, loadImage } from "../render";
import { bgMapBattle2, loadBgTileMap, loadFgTileMap, fgMapBattle2 } from "./sceneTiles";
import { Ladder, generateTileMap } from "../tileGen";
import { Door, Trapdoor } from "../door";
import door1Url from "../../assets/png/sprites/door1.png";
import { door1Animations, trapdoorAnimations, hurtChamberAnimations } from "../../assets/png/sprites/animations";
import { startCorridor } from "./startCorridor.scene";
import { tutorial } from "./tutorial.scene";
import { battle3 } from "./battle3.scene";
import trapdoorUrl from "../../assets/png/sprites/trapdoor.png";
import hurtChamberUrl from "../../assets/png/sprites/hurtChamber.png";
import { start } from "./start.scene";
import redUrl from "../../assets/png/sprites/red_monster.png";


async function getStartData(oldData) {
    const bgTiles = generateTileMap(
        bgMapBattle2,
        await loadBgTileMap(),
        { x: -600, y: -320 },
        64,
    );
    const redefines = {
        camera: { x: 0, y: 0, scale: 1 },
        fgTiles: generateTileMap(
            fgMapBattle2,
            await loadFgTileMap(),
            { x: -600, y: -320 },
            64, true,
        ),
        doors: [
            new Trapdoor(
                await loadImage(trapdoorUrl), trapdoorAnimations,
                500, 187,
                start, { x: 112, y: -100 }, [],
                false, true,
            ),
            new Door(
                await loadImage(door1Url), door1Animations,
                -507, 155,
                battle3, { x: 395, y: 200 }, ["stick", "yellow", "green"], true
            ),
            
        ],
        interactables: [],
        ladders: bgTiles.flatMap(t => t.isLadder ? new Ladder(t) : []),
        redImg: await loadImage(redUrl),
    };
    if (oldData.player) {
        return {
            ...oldData,
            ...redefines,
        }
    }
    return {
        ctx,
        player: await getPlayer(),
        ...redefines,
    };
}
export const battle2 = new Scene({
    getData: getStartData,

    update(dt, exit) {
        this.data.player.update(dt);
        this.data.player.unCollide(this.data.fgTiles);
        this.data.player.goThroughDoor(this.data.doors, exit, this.data);
        this.data.player.checkInteractables(this.data.interactables);
        this.data.player.checkLadders(this.data.ladders);
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

        ctx.scale(this.data.camera.scale, this.data.camera.scale);

        this.data.bgTiles.forEach(t => t.render());
        this.data.fgTiles.forEach(t => t.render());
        ctx.drawImage(this.data.redImg, 0, 0, 32, 32, 400-128, 150-128, 256, 256)
        this.data.interactables.forEach(i => i.render(dt));
        this.data.player.render(dt);
        this.data.doors.forEach(d => d.render(dt));
        ctx.restore();
    },
});
