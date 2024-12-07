/*
    LittleJS Platformer Example - Level Generator
    - Procedurally generates level geometry
    - Picks colors for the level and background
    - Creates ladders and spawns enemies and crates
*/

'use strict';

const tileType_ladder    = -1;
const tileType_empty     = 0;
const tileType_solid     = 1;
const tileType_breakable = 2;

let player, playerStartPos, tileData, tileLayers, foregroundLayerIndex, sky;
let levelSize, levelColor, levelBackgroundColor, levelOutlineColor, warmup;

const setTileData = (pos, layer, data)=>
    pos.arrayCheck(tileCollisionSize) && (tileData[layer][(pos.y|0)*tileCollisionSize.x+pos.x|0] = data);
const getTileData = (pos, layer)=>
    pos.arrayCheck(tileCollisionSize) ? tileData[layer][(pos.y|0)*tileCollisionSize.x+pos.x|0]: 0;

function buildLevel()
{
    // create the level
    levelColor = randColor(hsl(0,0,.2), hsl(0,0,.8));
    levelBackgroundColor = levelColor.mutate().scale(.4,1);
    levelOutlineColor = levelColor.mutate().add(hsl(0,0,.4)).clamp();
    loadLevel();

    // create sky object with gradient and stars
    sky = new Sky;

    // create parallax layers
    new ParallaxLayer(0, 1920,  977, IMAGE_BG1, vec2(960,437),   -3000);  // sky
    new ParallaxLayer(9,  256,  256, IMAGE_SUN, vec2(5652,3416), -2999);  // sun
    new ParallaxLayer(1, 2143, 1080, IMAGE_BG2, vec2(3108,1507), -2998);  // mountains
    new ParallaxLayer(2, 2143, 1080, IMAGE_BG3, vec2(4597,1507), -2007);
    new ParallaxLayer(3, 2143, 1080, IMAGE_BG4, vec2(5652,3416), -2006);
    new ParallaxLayer(4, 2143, 1080, IMAGE_BG5, vec2(6270,3416), 1000);
    
    // warm up level
    warmup = 1;
    for (let i = 500; i--;)
        engineObjectsUpdate();
    warmup = 0;

    // spawn player
    player = new Player(playerStartPos);
}

function loadLevel(level=0)
{
    // load level data from an exported Tiled js file
    const dataName = Object.keys(TileMaps)[level];
    const tileMapData = TileMaps[dataName];
    levelSize = vec2(tileMapData.width, tileMapData.height);
    initTileCollision(levelSize);
    engineObjectsDestroy();

    // create table for tiles in the level tilemap
    const tileLookup =
    {
        circle: 1,
        ground: 2,  // destructable
        ladder: 4,
        metal:  5,

        object_start: 15,
        bush1:  15,
        bush2:  16,
        player: 17,
        crate:  18,  // why are crates special?
        enemy:  19,
        coin:    20,
        berries: 21,
        flowers1: 22,
        flowers2: 23,
        object_end: 23,

        platform_start: 80,

    }

    // set all level data tiles
    tileData = [];
    tileLayers = [];
    playerStartPos = vec2(1, levelSize.y);
    const layerCount = tileMapData.layers.length;
    foregroundLayerIndex = layerCount-1;
    for (let layer=layerCount; layer--;)
    {
        const layerData = tileMapData.layers[layer].data;
        const tileLayer = new TileLayer(vec2(), levelSize, tile(0,16,1));
        tileLayer.renderOrder = -1e3+layer;
        tileLayers[layer] = tileLayer;
        tileData[layer] = [];

        for (let x=levelSize.x; x--;) 
        for (let y=levelSize.y; y--;)
        {
            const pos = vec2(x,levelSize.y-1-y);
            const tile = layerData[y*levelSize.x+x];

            if (tile >= tileLookup.object_start && tile <= tileLookup.object_end || tile == tileLookup.flowers1)
            {
                // create object instead of tile
                const objectPos = pos.add(vec2(.5));
                if (tile == tileLookup.player)
                    playerStartPos = objectPos;
                if (tile == tileLookup.crate)
                    new Crate(objectPos);
                if (tile == tileLookup.enemy)
                    new Enemy(objectPos);
                else if (tile == tileLookup.coin)
                    new Coin(objectPos, spriteAtlas.ham);
                else if (tile == tileLookup.berries)
                    new Coin(objectPos, spriteAtlas.berries);
                else if (tile == tileLookup.bush1)
                    new Bush(objectPos, spriteAtlas.bush1);
                else if (tile == tileLookup.bush2)
                    new Bush(objectPos, spriteAtlas.bush2);
                else if (tile == tileLookup.flowers1)
                    new Bush(objectPos, spriteAtlas.flowers1);
                else if (tile == tileLookup.flowers2)
                    new Bush(objectPos, spriteAtlas.flowers2);
                continue;
            }

            // set the tile data
            setTileData(pos, layer, tile);

            // get tile type for special tiles
            let tileType = tileType_empty;
            if (tile > 0)
                tileType = tileType_breakable;
            if (tile == tileLookup.ladder)
                tileType = tileType_ladder;
            if (tile == tileLookup.metal || tile > tileLookup.platform_start)
                tileType = tileType_solid;
            if (tileType)
            {
                // set collision for solid tiles - CONFUSING!!!!   "solid" sometimes refers to UNBREAKABLE metal tiles AND alos all FORGROUND tiles that cannot be walked through????
                if (layer == foregroundLayerIndex)
                    setTileCollisionData(pos, tileType);  // JAU how does this work?  
                // randomize tile appearance
                let direction, mirror, color;
                if (tileType == tileType_breakable)  // breakable somehow are rotated and mirrored and colored. why?
                {
                    //direction = randInt(4);
                    mirror = randInt(2);
                    color = layer || tile == tileLookup.flowers1 || tile == tileLookup.flowers2 ? levelColor : levelBackgroundColor;
                    color = color.mutate(.03);
                }

                // set tile layer data - LittleJS Layer Grid treats direction, mirror and color as first order attributes
                const data = new TileLayerData(tile-1, direction, mirror, color);
                tileLayer.setData(pos, data);
            }
        }
        tileLayer.redraw();
    }
}
