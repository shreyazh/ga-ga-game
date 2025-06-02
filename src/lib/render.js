/** @type CanvasRenderingContext2D */
let ctx;
/** @type CanvasRenderingContext2D */
let uiCtx;

export const getCtx = () => ctx,
    getUiCtx = () => uiCtx;

export function setupMainCtx(canvas) {
    ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2d context failed to load!");
    ctx.save();
}

export function setupUiCtx(canvas) {
    uiCtx = canvas.getContext("2d");
    if (!uiCtx) throw new Error("2d context failed to load!");
    ctx.save();
}

export const loadImage = imageUrl => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        img.onload = () => resolve(img);
        img.onerror = e => reject(e);
    });
};

export class AnimatedSprite {
    currentAnimationTime = 0;
    animationQueue = [];

    /** @param {{[name: string]: [x: number, y: number, w: number, h: number, t: number][]}} animations */
    constructor(image, animations, wpp, hpp, fallback = "idle") {
        this.image = image;
        this.animations = animations;
        this.wpp = wpp;
        this.hpp = hpp;
        this.fallback = fallback;
    }

    setAnimation(animation) {
        if (!(animation in this.animations)) throw new Error(`Invalid animation! ${animation}`);
        this.currentAnimationTime = 0;
        this.currentAnimation = this.animations[animation];
        this.currentAnimationName = animation;
    }
    
    enforceAnimation(animation) {
        if (this.currentAnimationName == animation) return;
        this.setAnimation(animation);
    }

    queueAnimation(animation) {
        if (!(animation in this.animations)) throw new Error(`Invalid animation! ${animation}`);
        this.animationQueue.push(animation);
    }

    render(dt) {
        if (!this.currentAnimation) this.setAnimation(this.fallback);
        this.currentAnimationTime += dt;
        let currentAnimationKeyframes = this.currentAnimation, i = 0;
        while (currentAnimationKeyframes[i][4] < this.currentAnimationTime) {
            i++;
            if (i == currentAnimationKeyframes.length) {
                this.currentAnimationTime -= this.currentAnimation[i - 1][4];
                i = 0;
                this.setAnimation(this.currentAnimationName)
                currentAnimationKeyframes = this.currentAnimation;
            }
        }

        const currentAnimationKeyframe = currentAnimationKeyframes[i];
        ctx.save();
        ctx.scale(this.wpp,this.hpp);
		ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            this.image,
            currentAnimationKeyframe[0] | 0,
            currentAnimationKeyframe[1] | 0,
            currentAnimationKeyframe[2] | 0,
            currentAnimationKeyframe[3] | 0,
            (-currentAnimationKeyframe[2] / 2) | 0,
            (-currentAnimationKeyframe[3] / 2) | 0,
            currentAnimationKeyframe[2] | 0,
            currentAnimationKeyframe[3] | 0,
        );
        ctx.restore();
    }
}
