import { Scene } from "../scene";
import { getPlayer } from "../player";
import { AnimatedSprite, getCtx, loadImage } from "../render";
import { bgMapTutorial, loadBgTileMap, loadFgTileMap, fgMapTutorial } from "./sceneTiles";
import { generateTileMap } from "../tileGen";
import { Door, Trapdoor } from "../door";

import trapdoorUrl from "../../assets/png/sprites/trapdoor.png";
import door1Url from "../../assets/png/sprites/door1.png";

import { trapdoorAnimations, yellowMonsterAnimations, door1Animations } from "../../assets/png/sprites/animations";
import { start } from "./start.scene";
import { battle2 } from "./battle2.scene";

import yellowMonsterUrl from "../../assets/png/sprites/yellow_monster.png";

async function getStartData(oldData) {
    const ctx = getCtx();
    const bgTiles = generateTileMap(
        bgMapTutorial,
        await loadBgTileMap(),
        { x: -600, y: -320 },
        64,
    );
    const redefines = {
        camera: { x: 0, y: 0, scale: 1 },
        fgTiles: generateTileMap(
            fgMapTutorial,
            await loadFgTileMap(),
            { x: -600, y: -320 },
            64, true,
        ),
        bgTiles,
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
                battle2, { x: 395, y: 200 }, ["stick","yellow"],
                true, true,
            ),
        ],
        ladders: bgTiles.flatMap(t => t.isLadder ? new Ladder(t) : []),
        enemies: oldData.player.badges["yellow"]
            ? []
            : [{
                x: -460,
                y: 180,
                velX: 0,
                health: 100,
                sprite: new AnimatedSprite(
                    await loadImage(yellowMonsterUrl),
                    yellowMonsterAnimations,
                    -4, 4, "fester",
                ),
                update(dt, player) {
                    this.x += this.velX * dt;
                    
                    if (Math.abs(player.pos.x - this.x) < 100) {
                        player.bleed("yellow", 5, 2)
                    } else {
                        this.x += 400 * Math.sign(player.pos.x - this.x) * dt;
                    }
                    
                    this.velX *= Math.exp(-dt * Math.log(20));
                    this.facingLeft = this.x > player.pos.x;
                },
                render(dt) {
                    ctx.save();
                    ctx.translate(this.x, this.y);
                    if (this.facingLeft) ctx.scale(-1, 1);
                    this.sprite.render(dt);
                    ctx.restore();
                }
            }
            ],
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
export const tutorial = new Scene({
    getData: getStartData,

    update(dt, exit) {
        const player = this.data.player;
        player.update(dt);
        player.unCollide(this.data.fgTiles);
        player.goThroughDoor(this.data.doors, exit, this.data);
        player.checkLadders(this.data.ladders);
        this.data.enemies.forEach(e => e.update(dt, player));
        player.checkEnemies(this.data.enemies);

        if (this.data.enemies[0] && this.data.enemies[0].health > 0 && !player.badges["yellow"]) return;
        player.badges["yellow"] = true;
        player.blood += 100;
        this.data.enemies.splice(0, 1);
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
        this.data.enemies.forEach(e => e.render(dt));
        ctx.restore();
    },
});
