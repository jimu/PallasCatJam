/*
    Little JS Platforming Game
    - A basic platforming starter project
    - Platforming phyics and controls
    - Includes destructibe terrain
    - Control with keyboard, mouse, touch, or gamepad
*/

'use strict';

const enableMusic = true
const enableBackground = true;
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
const IMAGE_UI = 12
const IMAGE_UI_BUTTONS = 13
const IMAGE_LOGOCAT = 14

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
  'images/ui.png',
  'images/start_menu_buttons.png',
  'images/logocat.png',
];
const SIZE_HD = vec2(1920, 1080);
const SIZE_BUTTON = vec2(600, 300);
const SIZE_LOGOCAT = vec2(1071, 836);
const INDEX_HD1 = 2

window.alpha = 1

// enable touch gamepad on touch devices
touchGamepadEnable = true;
showWatermark = false;

const pos = vec2;
const size = vec2;

let uiCreditsScreen;
let uiHighScoresScreen;
let uiAboutScreen;

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

        start_menu_background: tile(0, SIZE_HD, IMAGE_UI),
        start_menu_button_play: tile(0, SIZE_BUTTON, IMAGE_UI_BUTTONS),
        start_menu_button_credits: tile(1, SIZE_BUTTON, IMAGE_UI_BUTTONS),
        start_menu_button_about: tile(2, SIZE_BUTTON, IMAGE_UI_BUTTONS),
        start_menu_button_scores: tile(3, SIZE_BUTTON, IMAGE_UI_BUTTONS),
        logocat: tile(0, SIZE_LOGOCAT, IMAGE_LOGOCAT),
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

    if (enableMusic)
      playAudioFile('music/game jam song fuller.mp3', 1, true)

    // UI
    initUISystem();
    const centerX = mainCanvasSize.x / 2.0

    w.uiRoot = new UIObject(vec2(mainCanvasSize.x/2,0));
    uiRoot.visible = true

    w.uiStartMenuBackground = new UITile(vec2(0, mainCanvasSize.y/2), mainCanvasSize, spriteAtlas['start_menu_background'])
    uiStartMenuBackground.color = RED;
    uiRoot.addChild(uiStartMenuBackground);

    //console.log(spriteAtlas['start_menu_buttons'])
    const buttonx = -360
    const uiButtonPlay = new UITile(vec2(buttonx, -200), SIZE_BUTTON, spriteAtlas['start_menu_button_play'])
    const uiButtonCredits = new UITile(vec2(buttonx, 0), SIZE_BUTTON, spriteAtlas['start_menu_button_credits'])
    const uiButtonAbout = new UITile(vec2(buttonx, 200), SIZE_BUTTON, spriteAtlas['start_menu_button_about'])
    const uiButtonHighScores = new UITile(vec2(buttonx, 400), SIZE_BUTTON, spriteAtlas['start_menu_button_scores'])
    w.uiLogocat = new UITile(vec2(180, 120), SIZE_LOGOCAT, spriteAtlas['logocat'])

    uiStartMenuBackground.addChild(uiButtonPlay);
    uiStartMenuBackground.addChild(uiButtonCredits);
    uiStartMenuBackground.addChild(uiButtonAbout);
    uiStartMenuBackground.addChild(uiButtonHighScores);
    uiStartMenuBackground.addChild(uiLogocat);

    uiButtonPlay.onClick = () => setGameState(GameState.PLAYING)
    uiButtonCredits.onClick = () => setGameState(GameState.CREDITS)
    uiButtonAbout.onClick = () => setGameState(GameState.ABOUT)
    uiButtonHighScores.onClick = () => setGameState(GameState.HIGHSCORE)

    uiCreditsScreen    = buildScreen('Credits Placeholder', GameState.CREDITS)
    uiHighScoresScreen = buildScreen('High Scores Placeholder', GameState.HIGHSCORE)
    uiAboutScreen = buildScreen('About Placeholder', GameState.HIGHSCORE)

    setGameState(GameState.STARTMENU)
}

function buildScreen(text, gameState) {
  const centerX = mainCanvasSize.x / 2.0

  const uiScreen = new UIObject(vec2(mainCanvasSize.x/2,0));
  const uiTitle = new UIText(vec2(-300, 50), vec2(1000, 70), text, gameState);
  uiScreen.textColor = WHITE;
  uiScreen.lineWidth = 8;
  uiScreen.visible = false

  const okButton = new UIButton(vec2(0, 200), vec2(400, 70), 'Ok', GameState.STARTMENU)
  okButton.onClick = () => setGameState(GameState.STARTMENU)
  uiScreen.addChild(uiTitle)
  uiScreen.addChild(okButton)

  return uiScreen
}

///////////////////////////////////////////////////////////////////////////////
function gameUpdate()
{
  switch(gameState) {
    case GameState.STARTMENU:
      break;

    case GameState.PLAYING:
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
      break
  }
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
  switch(gameState) {
    case GameState.STARTMENU:
      //drawTile(vec2(mainCanvasSize.x / 2, mainCanvasSize.y / 2), vec2(SIZE_HD), spriteAtlas['start_menu_background'], GRAY, 0, false, undefined, false, true);
      break;

    case GameState.PLAYING:
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
      drawText(`Warmth: ${score}`, overlayCanvas.width*1/8, 20);
      drawText('Snacks: ', overlayCanvas.width*3/4, 20);

      var x = overlayCanvas.width*3/4 + 110
      const inc = 64
      drawSnack(x += inc, score >= 1)
      drawSnack(x += inc, score >= 2)
      drawSnack(x += inc, score >= 3)
      drawSnack(x += inc, score >= 4)
      drawSnack(x += inc, score >= 5)
      break;
  }
}

function drawSnack(x, isOn) {
  drawTile(vec2(x, 35), vec2(64), spriteAtlas['ham'], isOn ? undefined : GRAY, 0, false, undefined, true, true);
}


// TESTAPP

function noop() { }

///////////////////////////////////////////////////////////////////////////////
// Startup LittleJS Engine

if (TESTAPP)
  engineInit(noop, noop, noop, noop, noop, IMAGES);
else
  engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, IMAGES);
