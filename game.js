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

const IMAGES = ['tiles2.png', 'tilesLevel.png', 'hd1.jpg', 'bg1_sky.png', 'bg2_mountains.png', 'bg3_big_rocks.png', 'bg4_trees.png',
  'bg5_short_rocks.png', 'sun.png', 'tiles3.png'];
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
        coin:    tile(6),

        // small tiles
        gun:     tile(2,8),
        grenade: tile(3,8),

        //ham:     tile(3, vec2(64)),
        ham:     tile(6, vec2(64)),

        // background tiles
        hd1:     tile(0, SIZE_HD, INDEX_HD1),
    };
    // setup level
    buildLevel();
    //const hd1 = new EngineObject(pos(0), SIZE_HD, spriteAtlas['hd1']); // falls down. way pixelated

    // init game
    score = deaths = 0;
    gravity = -.01;
    objectDefaultDamping = .99;
    objectDefaultAngleDamping = .99;
    cameraScale = 4*16;
    cameraPos = getCameraTarget();

    //new GameObject(vec2(0), vec2(64), spriteAtlas['ham']);
    //w.ham = new GameObject(vec2(0), vec2(64/8), spriteAtlas['ham']);
    //w.ham.gravityScale = 0
    //w.ham.renderOrder = 1000;
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
