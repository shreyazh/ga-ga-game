import { Scene } from "../scene";
import { getPlayer } from "../player";
import { AnimatedSprite, getCtx, loadImage } from "../render";
import { bgMapWorkshop1, loadBgTileMap, loadFgTileMap, fgMapWorkshop1 } from "./sceneTiles";
import { generateTileMap } from "../tileGen";
import { Door } from "../door";
import door1Url from "../../assets/png/sprites/door1.png";
import workbenchUrl from "../../assets/png/workbench.png";
import { attackUpAnimations, defenseUpAnimations, door1Animations, stickAnimations, swordAnimations } from "../../assets/png/sprites/animations";
import { startCorridor } from "./startCorridor.scene";
import stickUrl from "../../assets/png/sprites/shop/stick.png";
import swordUrl from "../../assets/png/sprites/shop/sword.png";
import defenseUrl from "../../assets/png/sprites/shop/defense_up.png";
import speedUrl from "../../assets/png/sprites/shop/attack_up.png";
import { getKey } from "../input";

async function getStartData(oldData) {
    const redefines = {
        camera: { x: 0, y: 0, scale: 1.5 },
        bgTiles: generateTileMap(
            bgMapWorkshop1,
            await loadBgTileMap(),
            { x: -300, y: -1000 },
            64,
        ),
        fgTiles: generateTileMap(
            fgMapWorkshop1,
            await loadFgTileMap(),
            { x: -300, y: -1000 },
            64, true
        ),
        doors: [
            new Door(
                await loadImage(door1Url), door1Animations,
                -207, 47,
                startCorridor, { x: 700, y: -112 }, [], true,
            ),
        ],
        workbench: await loadImage(workbenchUrl),
        sword: oldData.player.badges["stick"] ? "sword" : "stick",
        stickSprite: new AnimatedSprite(
            await loadImage(stickUrl),
            stickAnimations,
            3, 3,
        ),
        swordSprite: new AnimatedSprite(
            await loadImage(swordUrl),
            swordAnimations,
            3, 3,
        ),
        defenseUp: new AnimatedSprite(
            await loadImage(defenseUrl),
            defenseUpAnimations,
            3, 3,
        ),
        speedUp: new AnimatedSprite(
            await loadImage(speedUrl),
            attackUpAnimations,
            3, 3,
        ),
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
export const workshop1 = new Scene({
    getData: getStartData,

    update(dt, exit) {
        const player = this.data.player;
        player.update(dt);
        player.unCollide(this.data.fgTiles);
        player.goThroughDoor(this.data.doors, exit, this.data);

        if (getKey("1")) {
            console.log(player.blood);
            if (player.blood > 50 && this.data.sword == "stick") {
                player.blood -= 50;
                player.weapon = { name: "stick", damage: 20 };
                player.badges["stick"] = true;
                this.data.sword = "sword";
            } else if (player.blood > 250 && this.data.sword == "sword") {
                player.blood -= 250;
                player.weapon = { name: "sword", damage: 50 };
                player.attackRange += 50;
                player.badges["sword"] = true;
                this.data.sword = "none";
            }
        }


        if (
            getKey("2") &&
            !player.badges["defense"] &&
            player.blood > 150
        ) {
            player.blood -= 150;
            player.regenRate *= 3;
            player.bloodChargeRate *= 2;
            player.badges["defense"] = true;
        }
        
        if (
            getKey("3") &&
            !player.badges["speed"] &&
            player.blood > 300
        ) {
            player.blood -= 300;
            player.speed *= 1.4;
            player.cooldown /= 1.5;
            player.bloodChargeRate *= 3;
            player.badges["speed"] = true;
        }
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
        ctx.drawImage(this.data.workbench, -50, 50, 192, 108);

        ctx.save();
        ctx.font = "12px BulkyPix";
        ctx.fillStyle = "#F53";

        if (
            this.data.player.badges["sword"] &&
            this.data.player.badges["speed"] &&
            this.data.player.badges["defense"]
        ) {
            ctx.fillText("There's nothing left!", -225, -20);
        } else {
            ctx.fillText("Press number key to purchase:", -225, -20);
        }
        if (this.data.sword == "stick") {
            ctx.fillText("[1] Stick: 50 Blood", -225, 0);
        } else if (this.data.sword == "sword") {
            ctx.fillText("[1] Sword: 250 Blood", -225, 0);
        }
        if (!this.data.player.badges["defense"]) ctx.fillText("[2] Defence Up: 150 Blood", -225, 15);
        if (!this.data.player.badges["speed"]) ctx.fillText("[3] Speed Up: 300 Blood", -225, 30);

        ctx.translate(8, 40);
        if (this.data.sword == "stick") {
            this.data.stickSprite.render(dt);
        } else if (this.data.sword == "sword") {
            this.data.swordSprite.render(dt);
        }

        ctx.translate(48, 0);
        if (!this.data.player.badges["defense"]) this.data.defenseUp.render(dt);
        ctx.translate(48, 0);
        if (!this.data.player.badges["speed"]) this.data.speedUp.render(dt);
        ctx.restore();


        this.data.player.render(dt);
        this.data.doors.forEach(d => d.render(dt));
        ctx.restore();
    },
});
