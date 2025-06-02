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
import cutsceneUrl from "../../assets/png/yellowcutscene.png";

export const cutscene1 = new Scene({
    getData: async d => {
        return { ...d, t: 0, img: await loadImage(cutsceneUrl) };
    },

    update(dt, exit) {
        this.data.t += dt;
        if (this.data.t > 2) {
            exit([this.data, tutorial])
        }
    },

    render() {
        this.data.ctx.drawImage(this.data.img, 100, 100);
    }
});
