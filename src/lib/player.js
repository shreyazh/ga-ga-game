import { getCtx, getUiCtx, loadImage } from "./render";
import { getKey } from "./input";
import { AnimatedSprite } from "./render";
import playerUrl from "../assets/png/sprites/player.png";
import { playerAnimations } from "../assets/png/sprites/animations";
import bloodUrl from "../assets/png/sprites/ui/blud.png";

const COLLISION_LEEWAY = 32;
export const UP = 1, DOWN = 2, LEFT = 4, RIGHT = 8;

export async function getPlayer() {
    const ctx = getCtx(), uiCtx = getUiCtx();
    return {
        pos: { x: 0, y: 180 },
        vel: { x: 0, y: 0 },
        gravity: 1500,
        speed: 1000,
        ladderSpeed: 128,
        jumpPower: 300,
        canMove: true,
        direction: "none",
        isInteractable: false,
        canAttack: true,

        weapon: undefined,
        badges: {},

        maxLifeForce: 100,
        lifeForce: 100,
        cooldown: 400,
        attackRange: 150,
        blood: 0,
        regenRate: .75,
        bloodChargeRate: 2,
        timeWithoutHarm: 0,

        bleedEvents: {},

        animatedSprite: new AnimatedSprite(
            await loadImage(playerUrl),
            playerAnimations,
            4,
            4,
        ),

        bleed(event, strength, time) {
            this.bleedEvents[event] = { strength, time };
        },

        update(dt) {
            if (this.canAttack) this.isAttacking = getKey("q") || getKey("Q")
            this.timeWithoutHarm += dt;
            if (this.timeWithoutHarm > 5) {
                this.lifeForce += this.regenRate * dt;
                this.lifeForce = Math.min(this.lifeForce, this.maxLifeForce);
            }

            for (const bleedEvent in this.bleedEvents) {
                const bleedData = this.bleedEvents[bleedEvent];
                if (bleedData.time - dt < 0) {
                    delete this.bleedEvents[bleedEvent];
                    continue;
                }
                bleedData.time -= dt;
                this.lifeForce -= dt * bleedData.strength;
                this.timeWithoutHarm = 0;

                console.log(this.lifeForce, this.blood);
            }

            if (this.isInteractable) {
                if (getKey("e") || getKey("e")) {
                    this.callback();
                }
            }

            if (this.disablePhysics) {
                this.direction = "none";
                this.animatedSprite.enforceAnimation("idle");
                return;
            }

            if (this.isLadderingDown) {
                this.vel.x = 0;
                this.pos.y += this.ladderSpeed * dt;
                return;
            }

            if (this.isLaddering) {
                this.vel.x = 0;
                this.pos.y -= this.ladderSpeed * dt;
                return;
            }

            if (!this.isGrounded || this.canMove) {
                this.vel.y += this.gravity * dt;
                this.vel.x *= Math.exp(-dt * Math.log(this.isGrounded ? 20 : 8000));
                this.vel.y *= Math.exp(-dt * Math.log(1.5));
                this.pos.x += this.vel.x * dt;
                this.pos.y += this.vel.y * dt;
            }

            if (this.canMove) {
                if (getKey("a") || getKey("A")) {
                    this.vel.x -= this.speed * dt;
                }

                if (getKey("d") || getKey("D")) {
                    this.vel.x += this.speed * dt;
                }

                if ((getKey("w") || getKey("W")) && this.canLadder) {
                    this.isLaddering = true;
                } else if ((getKey("w") || getKey("W")) && this.isGrounded) {
                    this.vel.y -= this.jumpPower;
                }
            }

            if (this.vel.x < 0) {
                this.direction = "left";
            }

            if (this.vel.x > 0) {
                this.direction = "right";
            }

            if (Math.abs(this.vel.x) < 15) {
                this.direction = "none";
                this.animatedSprite.enforceAnimation("idle");
            }
        },

        render(dt) {
            ctx.save();

            if (this.canAttack && this.inAttackRange) {
                ctx.fillStyle = "#22000F";
                ctx.fillRect(this.pos.x - 22, this.pos.y - 90, 40, 40);
                ctx.fillStyle = "#A04";
                ctx.font = "14px BulkyPix";
                ctx.textBaseline = "middle";
                ctx.fillText("[Q]", this.pos.x - 14, this.pos.y - 70);
            } else if (this.canLadder && !this.isLaddering && !this.isLadderingDown) {
                ctx.fillStyle = "#210";
                ctx.fillRect(this.pos.x - 22, this.pos.y - 90, 40, 40);
                ctx.fillStyle = "#A73";
                ctx.font = "14px BulkyPix";
                ctx.textBaseline = "middle";
                ctx.fillText("[W]", this.pos.x - 17, this.pos.y - 70);
            } else if (this.isInteractable) {
                ctx.fillStyle = "#120";
                ctx.fillRect(this.pos.x - 22, this.pos.y - 90, 40, 40);
                ctx.fillStyle = "#9A4";
                ctx.font = "14px BulkyPix";
                ctx.textBaseline = "middle";
                ctx.fillText("[E]", this.pos.x - 14, this.pos.y - 70);
            }

            ctx.translate(this.pos.x, this.pos.y);
            ctx.font = "12px BulkyPix";
            ctx.fillStyle = "#F53";
            ctx.fillText("Health: " + (this.lifeForce|0), 25, -30);
            ctx.fillText("Blood: " + (this.blood|0), 35, -10);

            if (this.direction == "left") {
                ctx.scale(-1, 1);
                ctx.translate(6, 0);
            }
            if (this.isAttacking && this.inAttackRange && this.canAttack) this.animatedSprite.enforceAnimation("stickAttack");
            else if (this.isLadderingDown) this.animatedSprite.enforceAnimation("ladderDown");
            else if (this.isLaddering) this.animatedSprite.enforceAnimation("ladderUp");
            else if (this.direction != "none") this.animatedSprite.enforceAnimation("move");
            if (Object.keys(this.bleedEvents).length > 0) ctx.globalAlpha = 0.6;
            this.animatedSprite.render(dt);
            ctx.restore();
        },

        isColliding(collideable) {
            // [-20, -40, 14, 48]
            return !(
                collideable.x > this.pos.x + 14 ||
                collideable.x + collideable.w < this.pos.x - 20 ||
                collideable.y > this.pos.y + 48 ||
                collideable.y + collideable.h < this.pos.y - 40
            );
        },

        unCollide(collideables) {
            this.isGrounded = false;

            // [-20, -40, 14, 48]
            for (const collideable of collideables) {
                if (!this.isColliding(collideable)) continue;
                if (
                    collideable.mask == (collideable.mask | UP) &&
                    Math.abs(collideable.y - 48 - this.pos.y) < COLLISION_LEEWAY
                ) {
                    this.pos.y = collideable.y - 48;
                    this.vel.y = Math.min(0, this.vel.y);
                    this.isGrounded = true;
                    this.isLadderingDown = false;
                    continue;
                }

                if (
                    collideable.mask == (collideable.mask | DOWN) &&
                    Math.abs(collideable.y + collideable.h + 40 - this.pos.y) < COLLISION_LEEWAY
                ) {
                    this.pos.y = collideable.y + collideable.h + 40;
                    this.vel.y = Math.max(0, this.vel.y);
                    continue;
                }

                if (
                    collideable.mask == (collideable.mask | LEFT) &&
                    Math.abs(collideable.x - 14 - this.pos.x) < COLLISION_LEEWAY
                ) {
                    this.pos.x = collideable.x - 14;
                    this.vel.x = Math.min(0, this.vel.x);
                }

                if (
                    collideable.mask == (collideable.mask | RIGHT) &&
                    Math.abs(collideable.x + collideable.w + 20 - this.pos.x) < COLLISION_LEEWAY
                ) {
                    this.pos.x = collideable.x + collideable.w + 20;
                    this.vel.x = Math.max(0, this.vel.x);
                }
            }
        },

        goThroughDoor(doors, exit, currentData) {
            for (const door of doors) {
                if (!this.isColliding(door)) continue;
                for (const badge of door.requiredBadges) {
                    if (!(badge in this.badges)) {
                        if (this.isLaddering) {
                            this.isLaddering = false;
                            this.isLadderingDown = true;
                        }
                        // add dialogue saying u cant go up or whatever
                        return;
                    }
                }
                door.animatedSprite.enforceAnimation("open");
                this.canMove = false;
                this.direction = "none";
                this.animatedSprite.enforceAnimation("idle");
                if (door.animatedSprite.currentAnimationTime > 1) {
                    this.pos = door.newPlayerPos;
                    this.vel.x = this.vel.y = 0;
                    let interval = setInterval(() => {
                        this.canMove = true;
                        this.isLaddering = false
                        this.canLadder = false;
                    }, 0);
                    setTimeout(() => clearInterval(interval), 1000);
                    if (door.isGoingDownLadder) {
                        this.isLadderingDown = true;
                    }
                    exit([currentData, door.scene]);
                }
            }
        },

        checkInteractables(interactables) {
            this.isInteractable = false;
            for (const interactable of interactables) {
                if (!this.isColliding(interactable.collider) || !interactable.isUsable) continue;
                this.isInteractable = true;
                this.callback = () => interactable.callback(this);
                return;
            }
        },

        checkLadders(ladders) {
            this.canLadder = false;
            for (const ladder of ladders) {
                if (!this.isColliding(ladder)) continue;
                this.canLadder = true;
                return;
            }
        },

        checkEnemies(enemies) {
            if (!this.canAttack) return;
            this.inAttackRange = false;

            for (const enemy of enemies) {
                if (!((enemy.x - this.pos.x) ** 2 + (enemy.y - this.pos.y) ** 2 < this.attackRange ** 2)) continue;
                this.inAttackRange = true;

                if (!this.isAttacking) return;
                enemy.health -= this.weapon.damage;
                enemy.velX += 1600 * (enemy.x < this.pos.x ? -1 : 1);
                this.canAttack = false;
                setTimeout(() => {
                    this.canAttack = true
                }, this.cooldown);
                return;
            }
        }
    }
};
