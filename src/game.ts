import * as Phaser from 'phaser';
import { GridEngine, Direction } from 'grid-engine';
const height = 20,
    width = 20;
const mapData = {
    compressionlevel: -1,
    height: height,
    width: width,
    infinite: false,
    layers: [
        {
            data: [],
            height: height,
            id: 1,
            name: 'ground',
            opacity: 1,
            type: 'tilelayer',
            visible: true,
            width: width,
            x: 0,
            y: 0,
        },
    ],
    nextlayerid: 8,
    nextobjectid: 1,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.4.3',
    tileheight: 16,
    tilesets: [
        {
            columns: 27,
            firstgid: 1,
            image: 'tileset.png',
            imageheight: 1040,
            imagewidth: 432,
            margin: 0,
            name: 'tileset',
            spacing: 0,
            tilecount: 1755,
            tileheight: 16,
            tilewidth: 16,
        },
    ],
    tilewidth: 16,
    type: 'map',
    version: '1.10',
};

export default class Demo extends Phaser.Scene {
    playerObj!: [Phaser.GameObjects.Sprite, Phaser.GameObjects.Container];
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    creatUp = false;
    creatLeft = false;
    get _gridEngine(): GridEngine {
        return (this as any)['gridEngine'] as GridEngine;
    }
    constructor() {
        super('demo');
    }

    preload() {
        this.load.atlas('tiles', 'assets/punyworld-overworld-tileset.png', 'assets/sprites.json');
    }

    create() {
        const firstMap = this.addMap({ x: 0, y: 0 }, 0)

        this.playerObj = this.createSpriteWithContainer()
        const [npc1Sprite, npc1Container] = this.createSpriteWithContainer();
        const [playerSprite, container] = this.playerObj;
        
        this.cameras.main.setZoom(1.5);
        this.cameras.main.startFollow(container, true);
        this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height);
        const px = width / 4,
            py = height / 4;
        this._gridEngine.create(firstMap, {
            characters: [
                {
                    id: 'player',
                    sprite: playerSprite,
                    startPosition: { x: 1 + px, y: 1 + py },
                    container: container
                },
                {
                    id: 'npc1',
                    sprite: npc1Sprite,
                    startPosition: { x: 0 + px, y: 0 + py },
                    container: npc1Container
                },
            ],
        });
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.add.text(10, 10, `try moving up or left`);
    }

    override update(time: number, delta: number): void {
        const cursors = this.cursors;
        if (cursors.left.isDown) {
            this._gridEngine.move('player', Direction.LEFT);
            // add map and move player
            const { x, y } = this._gridEngine.getFacingPosition('player')
            if (!this.creatLeft && x === -1) {
                this.creatLeft = true
                const newMap = this.addMap({ x: 0 - width * 16, y: 0 }, 1);
                // This has no effect, player does not move to newMap, but instead moves to (width - 1, y) of the initial map
                this._gridEngine.create(newMap, {
                    characters: [
                        {
                            id: 'player',
                            sprite: this.playerObj[0],
                            startPosition: { x: width - 1, y: y },
                            container: this.playerObj[1]
                        },
                    ],
                });
            }
        } else if (cursors.right.isDown) {
            this._gridEngine.move('player', Direction.RIGHT);
        } else if (cursors.up.isDown) {
            this._gridEngine.move('player', Direction.UP);
            // only add map
            if (!this.creatUp && this._gridEngine.getFacingPosition('player').y === -1) {
                this.creatUp = true
                this.addMap({ x: 0, y: 0 - height * 16 }, 2);
            }
        } else if (cursors.down.isDown) {
            this._gridEngine.move('player', Direction.DOWN);
        }
    }
    addMap(position: { x: number; y: number }, mapId = 0) {
        mapData.layers[0].data = makeMap(mapId).flat();
        const { x, y } = position;
        const jungleTilemap = new Phaser.Tilemaps.Tilemap(this, Phaser.Tilemaps.Parsers.Tiled.ParseJSONTiled('tilemap' + mapId, mapData, false)!);
        jungleTilemap.addTilesetImage('tileset', 'tiles');
        jungleTilemap.createLayer(0, 'tileset', x, y);
        return jungleTilemap;
    }
    createSpriteWithContainer(): [Phaser.GameObjects.Sprite, Phaser.GameObjects.Container] {
        const sprite = this.add.sprite(0, 0, 'tiles', 'sprite534');
        const container = this.add.container(0, 0, [sprite]);
        return [sprite, container];
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    scene: Demo,
    plugins: {
        scene: [
            {
                key: 'gridEngine',
                plugin: GridEngine,
                mapping: 'gridEngine',
            },
        ],
    }
};

const game = new Phaser.Game(config);
function makeMap(mapId = 0) {
    const map: number[][] = [];
    for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
            if (x >= width / 5 && x <= (width / 5) * 4 && y >= height / 5 && y < (height / 5) * 4) {
                if (x >= width / 4 && x <= (width / 4) * 3 && y >= height / 4 && y < (height / 4) * 3) {
                    row.push(1 + mapId * 11);
                } else {
                    row.push(1 + mapId * 11);
                }
            } else {
                row.push(2 + mapId * 11);
            }
        }
        map.push(row);
    }
    return map;
}