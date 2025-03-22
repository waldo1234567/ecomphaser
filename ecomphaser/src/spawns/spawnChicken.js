export class Chicken extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'chicken');

        scene.add.existing(this);
        scene.physics.world.enable(this);
        this.setCollideWorldBounds(true);
        
        this.direction = 'left';

        scene.chickens.add(this);

        this.createAnimations();
        this.moveRandomly();
    }

    createAnimations() {
        this.anims.create({
            key: 'chicken-idle',
            frames: this.anims.generateFrameNumbers('chicken', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        this.anims.create({
            key: 'chicken-walk',
            frames: this.anims.generateFrameNumbers('chicken', { start: 4, end: 7 }),
            frameRate: 3,
            repeat: -1
        });
    }

    moveRandomly() {
        this.scene.time.addEvent({
            delay: Phaser.Math.Between(1000, 3000),
            loop: true,
            callback: () => {
                const direction = ['left', 'right', 'up', 'down'];
                const newDirection = Phaser.Utils.Array.GetRandom(direction);

                this.anims.play('chicken-idle', true);
                this.setVelocityX(0);
                this.setVelocityY(0);

                if (newDirection === 'left') {
                    this.setVelocityX(-30);
                    this.setFlipX(true);
                    this.anims.play('chicken-walk');
                } else if (newDirection === 'right') {
                    this.setVelocityX(30);
                    this.setFlipX(false);
                    this.anims.play('chicken-walk');
                } else if (newDirection === 'up') {
                    this.setVelocityY(30);
                    this.anims.play('chicken-walk');
                } else {
                    this.setVelocityY(-30);
                    this.anims.play('chicken-walk');
                }

                this.direction = newDirection;
            }
        })
    }
}