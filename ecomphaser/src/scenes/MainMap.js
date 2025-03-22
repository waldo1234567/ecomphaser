import Phaser from "phaser";
import { cropsData, cropsFrame, gidToTexture } from "../datas/mockData";
import { Chicken } from "../spawns/spawnChicken";
import { Player } from "../spawns/spawnPlayer";

export class MainMap extends Phaser.Scene {

    constructor() {
        super({ key: "MainMap" });
    }
    preload() {
        this.load.tilemapTiledJSON("map", "/map.json");
        this.load.image("water", "/Water.png");
        this.load.image("grass", "/Grass.png");
        this.load.image("tree", "/Oak_Tree.png");
        this.load.image("cliff", "/Hills.png");
        this.load.image("Tilled_Dirt", "/Tilled_Dirt_Wide.png");
        this.load.image("fences", "/Fences.png");
        this.load.image("bridge", "/Bridge_Wood.png");
        this.load.image("house", "/House.png");
        this.load.image("chicken_house", "/Free_Chicken_House.png");
        this.load.spritesheet("player", "/Player.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet("crops_all", "crops_all.png", {
            frameWidth: 16,
            frameHeight: 32
        });
        this.load.spritesheet("farm", "/FarmLand_Tile.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet("chicken", "/chicken.png", {
            frameWidth: 16,
            frameHeight: 16
        })
    }

    create(data) {
        this.crops = [];
        this.farmTiles = [];

        const map = this.make.tilemap({ key: "map" })
        map.setRenderOrder('right-down');
        const grassTileset = map.addTilesetImage("grass", "grass");
        const waterTileset = map.addTilesetImage("water", "water");
        const fencesTileset = map.addTilesetImage("fences", "fences");
        const dirtTileset = map.addTilesetImage("Tilled_Dirt", "Tilled_Dirt");
        const cliffTileset = map.addTilesetImage("cliff", "cliff");
        const treeTileset = map.addTilesetImage("tree", "tree");
        const bridgeTileSet = map.addTilesetImage("bridge", "bridge");
        const houseTile = map.addTilesetImage("house", "house");
        const chickenHouseTile = map.addTilesetImage("chicken_house", "chicken_house");

        const waterLayer = map.createLayer("water", waterTileset, -510, -510);
        map.createLayer("ground", [grassTileset, cliffTileset, dirtTileset], -510, 0);
        map.createLayer("bridge", [bridgeTileSet, dirtTileset], 0, 255);
        map.createLayer("dirt_path", dirtTileset, 0, 0);
        const fenceLayer = map.createLayer("fences", [fencesTileset], 0, 0);
        const objectLayer = map.getObjectLayer("objects");
        const farmLayer = map.getObjectLayer("farm_tiles");
        const transition = map.getObjectLayer("door");
        this.obstacles = this.physics.add.staticGroup();
        this.canEnter = null;

        farmLayer.objects.forEach((tile) => {
            let positionType = tile.properties.find(prop => prop.name === "pos")?.value || 0;
            let cropName = tile.properties.find(prop => prop.name === "cropname")?.value || "";

            let farmtile = this.add.sprite(tile.x, tile.y, "farm", positionType);

            farmtile.setDepth(tile.y);
            farmtile.setOrigin(0, 1);

            this.farmTiles.push({ x: tile.x, y: tile.y, frame: positionType, cropName: cropName });

            console.log("Farm tile at:", tile.x, tile.y);
        })

        cropsData.forEach((cropInfo) => {
            let farmTile = this.farmTiles.find(tile => tile.cropName === cropInfo.name && !tile.occupied)

            if (farmTile) {
                let cropFrames = cropsFrame[cropInfo.name];

                let crop = this.add.sprite(farmTile.x, farmTile.y, "crops_all", cropFrames.start);
                crop.setDepth(farmTile.y + 100);
                crop.setOrigin(0, 1);

                crop.growthStage = 0;
                crop.maxGrowthStage = cropFrames.end - cropFrames.start;
                crop.growthTime = cropInfo.growthTime;
                crop.cropName = cropInfo.name;
                crop.plantedTime = this.time.now;

                this.crops.push(crop);
                farmTile.occupied = true;
                console.log(`Placed ${crop.cropName} at: ${farmTile.x}, ${farmTile.y}`);
            } else {
                console.log(`No available farm tile for ${cropInfo.name}`);
            }
        })

        objectLayer.objects.forEach((obj) => {
            let texture = gidToTexture[obj.gid];

            if (texture) {
                let sprite = this.obstacles.create(obj.x, obj.y, texture);
                sprite.setOrigin(0, 1);
                switch (obj.gid) {
                    case 379:
                        sprite.body.setSize(45, 50);
                        sprite.body.setOffset(25, sprite.height - 70);
                        sprite.setDepth(0);
                        break;
                    case 389:
                        sprite.body.setSize(67, 77);
                        sprite.body.setOffset(45, sprite.height - 140);
                        sprite.setDepth(0);
                        break;
                    case 175:
                        sprite.body.setSize(20, 10);
                        sprite.body.setOffset(55, sprite.height - 65);
                        sprite.setDepth(10);
                        break;
                    default:
                        if (obj.width && obj.height) {
                            sprite.body.setSize(obj.width, obj.height);
                            sprite.body.setOffset(0, sprite.height - obj.height);
                        }
                        break;
                }


                sprite.body.immovable = true;

            } else {
                console.warn(`No texture found for gid: ${obj.gid}`);
            }
        });

        waterLayer.setCollisionByProperty({ collides: true });
        fenceLayer.setCollisionByProperty({ collides: true });



        this.player = new Player(this, data?.x || 120, data?.y || 300);
        this.player.setOrigin(0.5, 0.5);

        this.cameras.main.setBounds(0, 0, 4000, 4000);
        this.cameras.main.startFollow(this.player, true, 1, 1);
        this.cameras.main.setZoom(2);
        this.cameras.main.setRoundPixels(true);
        this.time.delayedCall(10, () => {
            this.cameras.main.centerOn(this.player.x, this.player.y);
            console.log("Initial camera center set to:", this.cameras.main.scrollX + this.cameras.main.width / 2,
                this.cameras.main.scrollY + this.cameras.main.height / 2);
        });

        // this.physics.world.createDebugGraphic();
        // waterLayer.renderDebug(this.add.graphics().setAlpha(0.75), {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 128)
        // });

        this.chickens = this.physics.add.group();

        new Chicken(this, 700, 400);
        new Chicken(this, 710, 400);
        new Chicken(this, 710, 400);



        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        if (transition) {
            transition.objects.forEach(obj => {
                if (obj.properties && Array.isArray(obj.properties)) {
                    const enterSceneProp = obj.properties.find(prop => prop.name === "scene");

                    if (enterSceneProp && enterSceneProp.value === "StoreScene") {
                        const spawnX = obj.properties.find(prop => prop.name === "spawnX")?.value || 100;
                        const spawnY = obj.properties.find(prop => prop.name === "spawnY")?.value || 100;

                        const entrance = this.add.zone(obj.x, obj.y, obj.width, obj.height);
                        this.physics.world.enable(entrance);
                        entrance.setOrigin(0, 0);
                        entrance.body.setAllowGravity(false);
                        entrance.body.setImmovable(true);

                        entrance.targetScene = enterSceneProp.value;
                        entrance.spawnX = spawnX;
                        entrance.spawnY = spawnY;

                        this.physics.add.overlap(this.player, entrance, () => {
                            this.canEnter = { scene: entrance.targetScene, x: entrance.spawnX, y: entrance.spawnY };
                            console.log(`player now can enter ${this.canEnter}`);
                        })
                    }
                }
            })
        }



        this.cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.collider([this.player, this.chickens], waterLayer);
        this.physics.add.collider([this.player, this.chickens], fenceLayer);
        this.physics.add.collider([this.player, this.chickens], this.obstacles);

    }

    update(time, delta) {
        this.player.update();
        console.log("Player position:", this.player.x, this.player.y);
        console.log("Camera scroll:", this.cameras.main.scrollX, this.cameras.main.scrollY);
        const crops = this.crops;

        if (this.canEnter && Phaser.Input.Keyboard.JustDown(this.eKey)) {
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start(this.canEnter.scene, { x: this.canEnter.x, y: this.canEnter.y });
            });
        }


        crops.forEach((crop) => {
            if (crop.growthStage < crop.maxGrowthStage) {
                let elapsedTime = time - crop.plantedTime;
                let requiredTimePerStage = crop.growthTime / crop.maxGrowthStage;

                let newGrowthStage = Math.floor(elapsedTime / requiredTimePerStage);

                if (newGrowthStage > crop.growthStage) {
                    crop.growthStage = Math.min(newGrowthStage, crop.maxGrowthStage);
                    let newFrame = cropsFrame[crop.cropName].start + crop.growthStage;
                    crop.setFrame(newFrame);
                    console.log(`Updated ${crop.cropName} to growth stage ${crop.growthStage}`);
                }
            }
        })

    }
}

