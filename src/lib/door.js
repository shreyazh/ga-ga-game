import { getCtx, AnimatedSprite } from "./render";

let ctx;

export class Door {
    constructor(img, animations, x, y, scene, newPlayerPos, requiredBadges, reversed = false) {
        this.x = x;
        this.y = y;
        this.w = 4;
        this.h = 96;
        this.scene = scene;
        this.newPlayerPos = newPlayerPos;
        this.requiredBadges = requiredBadges;
        this.reversed = reversed;
        this.animatedSprite = new AnimatedSprite(img, animations, reversed ? -4 : 4, 4);
        ctx = getCtx();
    }

    render(dt) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        this.animatedSprite.render(dt);
        ctx.restore();
    }
}

export class Trapdoor {
    constructor(img, animations, x, y, scene, newPlayerPos, requiredBadges, reversed = false, isGoingDownLadder = false) {
        this.x = x;
        this.y = y;
        this.w = 64;
        this.h = 8;
        this.scene = scene;
        this.newPlayerPos = newPlayerPos;
        this.requiredBadges = requiredBadges;
        this.reversed = reversed;
        this.animatedSprite = new AnimatedSprite(img, animations, 4, reversed ? -4 : 4);
        this.isGoingDownLadder = isGoingDownLadder;
        ctx = getCtx();
    }

    render(dt) {
        ctx.save();
        ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
        this.animatedSprite.render(dt);
        ctx.restore();
    }
}