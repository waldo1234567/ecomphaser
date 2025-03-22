import Phaser from "phaser"
import { Player } from "../spawns/spawnPlayer";

export class StoreScene extends Phaser.Scene {
    constructor() {
        super({ key: "StoreScene" });
    }

    preload() {
        this.load.tilemapTiledJSON("store", "/store.json");
        this.load.spritesheet("walls_and_floor", "/Wooden_House_Walls_Tilset.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("furnitures_sprite", "/Interiors_free_16x16.png", {
            frameWidth: 16,
            frameHeight: 16,
        })
        this.load.spritesheet("clock", "Basic_Furniture.png", {
            frameWidth: 16,
            frameHeight: 16
        })
        this.load.spritesheet("player", "/Player.png", {
            frameWidth: 32,
            frameHeight: 32
        })

    }

    create(data) {
        const map = this.make.tilemap({ key: "store" });

        const walls_and_floor_tiles = map.addTilesetImage("walls_and_floor", "walls_and_floor");
        const furnitures = map.addTilesetImage("furnitures_2", "furnitures_sprite");

        const wallsAndFloor = map.createLayer("walls_floor", walls_and_floor_tiles, 0, 0);
        map.createLayer("carpet", furnitures, 0, 0);

        wallsAndFloor.setCollisionByProperty({ collides: true });

        this.player = new Player(this, data?.x || 100, data?.y || 100);

        const furnituresLayer = map.getObjectLayer("furnitures");
        this.furnitureGroup = this.physics.add.staticGroup();
        const furnitureTileset = map.tilesets.find(t => t.name === "furnitures");

        if (!furnitureTileset) {
            console.error("Furniture tileset not found!");
            return;
        }

        const firstFurnitureGID = furnitureTileset.firstgid;
        console.log("First Furniture GID:", firstFurnitureGID);

        furnituresLayer.objects.forEach(obj => {
            if (obj.gid) {
                const frameIndex = obj.gid - firstFurnitureGID;

                if (frameIndex >= 0) {
                    const hasCollides = obj.properties && Array.isArray(obj.properties) &&
                        obj.properties.some(prop => prop.name === 'collides' && prop.value === true);

                    if (hasCollides) {
                        const furniture = this.add.sprite(obj.x, obj.y, "furnitures_sprite", frameIndex);
                        furniture.setOrigin(0, 1);
                        this.furnitureGroup.add(furniture);
                        furniture.setSize(16, 16);
                        this.physics.add.collider(this.player, furniture);
                    } else {
                        console.log(`Object with GID ${obj.gid} is not marked for collision.`);
                        const furniture = this.add.sprite(obj.x, obj.y, "furnitures_sprite", frameIndex);
                        furniture.setOrigin(0, 1);
                    }
                } else {
                    console.warn(`Invalid frame index: ${frameIndex} for GID: ${obj.gid}`);
                }
            }
        });;

        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        const transition = map.getObjectLayer("door");
        this.canExit = null;

        if (transition) {
            transition.objects.forEach(obj => {
                if (obj.properties && Array.isArray(obj.properties)) {
                    const exitSceneProp = obj.properties.find(prop => prop.name === "exitScene");

                    if (exitSceneProp && exitSceneProp.value === "MainMap") {
                        const spawnX = obj.properties.find(prop => prop.name === "spawnX")?.value || 100;
                        const spawnY = obj.properties.find(prop => prop.name === "spawnY")?.value || 100;

                        const exitDoor = this.add.zone(obj.x, obj.y, obj.width, obj.height)
                        this.physics.world.enable(exitDoor);
                        exitDoor.setOrigin(0, 0);
                        exitDoor.body.setAllowGravity(false);
                        exitDoor.body.setImmovable(true);

                        exitDoor.targetScene = exitSceneProp.value;
                        exitDoor.spawnX = spawnX;
                        exitDoor.spawnY = spawnY;

                        this.physics.add.overlap(this.player, exitDoor, () => {
                            this.canExit = { scene: exitDoor.targetScene, x: exitDoor.spawnX, y: exitDoor.spawnY };
                            console.log(`player now exiting ${this.canExit}`);
                        });
                    }
                }
            })
        }

        this.physics.add.collider(this.player, wallsAndFloor);
    }

    update() {
        this.player.update();

        if (this.canExit && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start(this.canExit.scene, { x: this.canExit.x, y: this.canExit.y });
            });
        }
    }
}