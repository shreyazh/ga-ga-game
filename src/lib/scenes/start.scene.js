import { Scene } from "../scene";
import { getPlayer } from "../player";
import { AnimatedSprite, getCtx, loadImage } from "../render";
import { bgMapStart, loadBgTileMap, loadFgTileMap, fgMapStart, pipeMapStart, loadPipeTileMap } from "./sceneTiles";
import { Ladder, generateTileMap } from "../tileGen";
import { Door, Trapdoor } from "../door";
import door1Url from "../../assets/png/sprites/door1.png";
import { door1Animations, trapdoorAnimations, hurtChamberAnimations } from "../../assets/png/sprites/animations";
import { startCorridor } from "./startCorridor.scene";
import { tutorial } from "./tutorial.scene";
import trapdoorUrl from "../../assets/png/sprites/trapdoor.png";
import hurtChamberUrl from "../../assets/png/sprites/hurtChamber.png";
import { cutscene1 } from "./cutscene1"; 

async function getStartData(oldData) {
    const bgTiles = generateTileMap(
        bgMapStart,
        await loadBgTileMap(),
        { x: -430, y: -347 },
        64,
    );
    const ctx = getCtx();
    const redefines = {
        camera: { x: 0, y: 0, scale: 1.25 },
        bgTiles,
        fgTiles: generateTileMap(
            fgMapStart,
            await loadFgTileMap(),
            { x: -430, y: -347 },
            64, true,
        ),
        pipeTiles: generateTileMap(
            pipeMapStart,
            await loadPipeTileMap(),
            { x: -728.5, y: -340 },
            192,
        ),
        doors: [
            new Door(
                await loadImage(door1Url), door1Animations,
                303, 124,
                startCorridor, { x: -681, y: -130 }, [], false, false
            ),
            new Trapdoor(
                await loadImage(trapdoorUrl), trapdoorAnimations,
                80, -160,
                oldData.player ? (oldData.player.badges["yellow"] ? tutorial : cutscene1 ) : cutscene1 , { x: 395, y: 200 }, ["stick"], true,
            ),
        ],
        interactables: [
            {
                playerIsIn: false,
                isUsable: true,
                collider: { x: -300, y: 58, w: 100, h: 120 },
                animatedSprite: new AnimatedSprite(
                    await loadImage(hurtChamberUrl),
                    hurtChamberAnimations,
                    6, 6,
                ),
                callback(player) {
                    this.player = player;
                    this.isUsable = false;
                    setTimeout(() => this.isUsable = true, 2000);

                    if (this.playerIsIn) {
                        player.vel.x = 0;
                        player.vel.y = 0;
                        player.disablePhysics = false;
                        player.isHurting = false;
                        this.playerIsIn = false;
                        this.animatedSprite.setAnimation("idle");
                        return;
                    }

                    player.pos.x = -247;
                    player.pos.y = 145;
                    player.disablePhysics = true;
                    this.playerIsIn = true;
                    this.animatedSprite.setAnimation("hurt");
                },
                update(dt) {
                    if (!this.playerIsIn) return;
                    this.player.bleed("hurtChamber", 2, 2);
                    this.player.blood += this.player.bloodChargeRate * dt;
                },
                render(dt) {
                    ctx.save();
                    ctx.translate(-250, 131);
                    this.animatedSprite.render(dt);
                    ctx.restore();
                }
            },
        ],
        ladders: bgTiles.flatMap(t => t.isLadder ? new Ladder(t) : []),
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
export const start = new Scene({
    getData: getStartData,

    update(dt, exit) {
        const player = this.data.player;
        player.update(dt);
        player.unCollide(this.data.fgTiles);
        player.goThroughDoor(this.data.doors, exit, this.data);
        player.checkInteractables(this.data.interactables);
        player.checkLadders(this.data.ladders);
        this.data.interactables.forEach(i => i.update(dt));
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
        this.data.pipeTiles.forEach(t => t.render());

        if (!this.data.player.badges["stick"]) {
            ctx.save();
            ctx.font = "12px BulkyPix";
            ctx.fillStyle = "#5AF";
            ctx.fillText("You need to arm", -80, -190);
            ctx.fillText("yourself before heading", -130, -170);
            ctx.fillText("into danger!", -60, -150);
            ctx.fillText("<- Get blood!", -60, 70);
            ctx.fillText("Go equip yourself! ->", -100, 90);
            ctx.restore();
        }

        this.data.fgTiles.forEach(t => t.render());
        this.data.interactables.forEach(i => i.render(dt));
        this.data.player.render(dt);
        this.data.doors.forEach(d => d.render(dt));
        ctx.restore();
    },
});
