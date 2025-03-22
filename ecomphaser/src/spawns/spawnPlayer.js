import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y,) {
        super(scene, x, y, 'player');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(1000);
        this.setCollideWorldBounds(true);
        this.body.setSize(10, 10);
        this.body.setOffset(8, 15);

        this.scene = scene;
        this.cursors = scene.input.keyboard.createCursorKeys();

        this.createAnimations();
    }

    createAnimations() {
        this.anims.create({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
            frameRate: 6,
            repeat: - 1
        })
        this.anims.create({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player', { start: 30, end: 35 }),
            frameRate: 6,
            repeat: -1
        })
        this.anims.create({
            key: 'walk-right',
            frames: this.anims.generateFrameNumbers('player', { start: 24, end: 29 }),
            frameRate: 6,
            repeat: -1
        })
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
            frameRate: 4,
            repeat: -1
        })
    }
    update() {
        const speed = 100;
        

        if (this.cursors.left.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown) {
            this.body.setVelocityX(-speed);
            this.setFlipX(true);
            this.anims.play('walk-right', true);
        } else if (this.cursors.right.isDown && !this.cursors.up.isDown && !this.cursors.down.isDown) {
            this.body.setVelocityX(speed);
            this.setFlipX(false);
            this.anims.play('walk-right', true);
        } else if (this.cursors.up.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
            this.body.setVelocityY(-speed);
            this.anims.play('walk-up', true);
        } else if (this.cursors.down.isDown && !this.cursors.left.isDown && !this.cursors.right.isDown) {
            this.body.setVelocityY(speed);
            this.anims.play('walk-down', true);
        } else {
            this.body.setVelocity(0);
            if (!this.anims.isPlaying || this.anims.currentAnim.key !== 'idle') {
                this.anims.play('idle', true);
            }
        }
    }
}