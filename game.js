/*
    Little JS Platforming Game
    - A basic platforming starter project
    - Platforming phyics and controls
    - Includes destructibe terrain
    - Control with keyboard, mouse, touch, or gamepad
*/

'use strict';

const TESTAPP = 0
const w = window

let spriteAtlas, score, deaths;

const IMAGE_BG1 = 3
const IMAGE_BG2 = 4
const IMAGE_BG3 = 5
const IMAGE_BG4 = 6
const IMAGE_BG5 = 7
const IMAGE_SUN = 8
const IMAGE_FLOWERS = 9
const IMAGE_BUSH1 = 10
const IMAGE_BUSH2 = 11

const IMAGES = [
  'tiles2.png',
  'tilesLevel.png',
  'tilesLevel.png',
  'bg1_sky.png',
  'bg2_mountains.png',
  'bg3_big_rocks.png',
  'bg4_trees.png',
  'bg5_short_rocks.png',
  'sun.png',
  'images/flowers_128x128.png',
  'images/bush_1.png',
  'images/bush_2.png',
];
const SIZE_HD = vec2(1920, 1024);
const INDEX_HD1 = 2

window.alpha = 1

// enable touch gamepad on touch devices
touchGamepadEnable = true;
showWatermark = false;

const pos = vec2;
const size = vec2;

///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    // create a table of all sprites
    spriteAtlas =
    {
        // large tiles
        circle:  tile(0),
        crate:   tile(2),
        player:  tile(1, vec2(128)),
        enemy:   tile(5),
        coin:    tile(20, vec2(64)),

        // small tiles
        gun:     tile(2,8),
        grenade: tile(3,8),

        //ham:     tile(3, vec2(64)),
        ham:     tile(20, vec2(64)),
        berries: tile(21, vec2(64)),

        flowers1: tile(0, vec2(128), IMAGE_FLOWERS),
        flowers2: tile(1, vec2(128), IMAGE_FLOWERS),
        bush1: tile(0, vec2(400), IMAGE_BUSH1),
        bush2: tile(0, vec2(400), IMAGE_BUSH2),
    };

    // setup level
    buildLevel();

    // init game
    score = deaths = 0;
    gravity = -.01;
    objectDefaultDamping = .99;
    objectDefaultAngleDamping = .99;
    cameraScale = 4*16 *1.20;
    cameraPos = getCameraTarget();

    playAudioFile('music/game jam song fuller.mp3', 1, true)
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
    // respawn player
    if (player.deadTimer > 1)
    {
        player = new Player(playerStartPos);
        player.velocity = vec2(0,.1);
        sound_jump.play();
    }

    // mouse wheel = zoom
    cameraScale = clamp(cameraScale*(1-mouseWheel/10), 1, 1e3);

    // T = drop test crate
    if (keyWasPressed('KeyT'))
        new Crate(mousePos);

    // E = drop enemy
    if (keyWasPressed('KeyE'))
        new Enemy(mousePos);

    // X = make explosion
    if (keyWasPressed('KeyX'))
        explosion(mousePos);

    // M = move player to mouse
    if (keyWasPressed('KeyM'))
        player.pos = mousePos;
}

///////////////////////////////////////////////////////////////////////////////
function getCameraTarget()
{
    // camera is above player
    const offset = 200/cameraScale*percent(mainCanvasSize.y, 300, 600);
    return player.pos.add(vec2(0, offset));
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdatePost()
{
    // update camera
    cameraPos = cameraPos.lerp(getCameraTarget(), clamp(player.getAliveTime()/2));
}

///////////////////////////////////////////////////////////////////////////////
function gameRender()
{
}

///////////////////////////////////////////////////////////////////////////////
function gameRenderPost()
{
    // draw to overlay canvas for hud rendering
    const drawText = (text, x, y, size=40) =>
    {
        overlayContext.textAlign = 'center';
        overlayContext.textBaseline = 'top';
        overlayContext.font = size + 'px arial';
        overlayContext.fillStyle = '#fff';
        overlayContext.lineWidth = 3;
        overlayContext.strokeText(text, x, y);
        overlayContext.fillText(text, x, y);
    }
    drawText('Grumpiness: 2' ,   overlayCanvas.width*1/4, 20);
    drawText('Snacks: ' , overlayCanvas.width*3/4, 20);

    var x = overlayCanvas.width*3/4 + 110
    const inc = 64
    drawTile(vec2(x, 35), vec2(64), spriteAtlas['ham'], undefined, 0, false, undefined, false, true);
    drawTile(vec2(x += inc, 35), vec2(64), spriteAtlas['ham'], undefined, 0, false, undefined, true, true);
    drawTile(vec2(x += inc, 35), vec2(64), spriteAtlas['ham'], GRAY, 0, false, undefined, true, true);
    drawTile(vec2(x += inc, 35), vec2(64), spriteAtlas['ham'], GRAY, 0, false, undefined, true, true);
    drawTile(vec2(x += inc, 35), vec2(64), spriteAtlas['ham'], GRAY, 0, false, undefined, true, true);
}


// TESTAPP

function noop() { }

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine

if (TESTAPP)
  engineInit(noop, noop, noop, noop, noop, IMAGES);
else
  engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, IMAGES);
