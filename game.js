/*
    Little JS Platforming Game
    - A basic platforming starter project
    - Platforming phyics and controls
    - Includes destructibe terrain
    - Control with keyboard, mouse, touch, or gamepad
*/

'use strict';

const enableMusic = true;
const enableStartMenu = true;
const enableBackground = true;
const TESTAPP = 0;
const debugGameState = undefined; //  GameState.PLAYING

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
const IMAGE_ICONS = 15

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
  'images/icons.png',
];

const SIZE_UI = vec2(1920, 1080);
const SIZE_BUTTON = vec2(600, 300);
const SIZE_LOGOCAT = vec2(1071, 836);
const SIZE_CAVE = vec2(192, 128);
const SIZE_ICON = vec2(200, 150);
const INDEX_HD1 = 2
const STARTING_WARMTH = 20

window.alpha = 1

// enable touch gamepad on touch devices
touchGamepadEnable = true;
showWatermark = false;

const pos = vec2;
const size = vec2;

let uiCreditsScreen;
let uiHighScoresScreen;
let uiAboutScreen;
let uiWinScreen;
let warmthTimer = new Timer;
let savedWarmthTimer;

let currentLevelId = 0

function initLevel(levelId=0) {
  buildLevel(levelId % 2);
  console.log(`initLevel(${levelId})`);
  currentLevelId = levelId;

  score = deaths = 0;
  savedWarmthTimer = STARTING_WARMTH
}


///////////////////////////////////////////////////////////////////////////////
function gameInit()
{
    // create a table of all sprites
    spriteAtlas = {
      // large tiles
      circle:  tile(0),
      crate:   tile(2),
      player:  tile(1, vec2(128)),
      fox:     tile(vec2(1,1), vec2(128)),
      enemy:   tile(5),
      coin:    tile(vec2(0,2), vec2(64)),

      // small tiles
      gun:     tile(2,8),
      grenade: tile(3,8),

      //ham:     tile(3, vec2(64)),
      ham:     tile(vec2(0,2), vec2(64)),
      berries: tile(vec2(1,2), vec2(64)),

      flowers1: tile(0, vec2(128), IMAGE_FLOWERS),
      flowers2: tile(1, vec2(128), IMAGE_FLOWERS),
      bush1: tile(0, vec2(400), IMAGE_BUSH1),
      bush2: tile(0, vec2(400), IMAGE_BUSH2),

      start_menu_background: tile(0, SIZE_UI, IMAGE_UI),
      start_menu_button_play: tile(0, SIZE_BUTTON, IMAGE_UI_BUTTONS),
      start_menu_button_credits: tile(1, SIZE_BUTTON, IMAGE_UI_BUTTONS),
      start_menu_button_about: tile(2, SIZE_BUTTON, IMAGE_UI_BUTTONS),
      start_menu_button_scores: tile(3, SIZE_BUTTON, IMAGE_UI_BUTTONS),

      logocat: tile(0, SIZE_LOGOCAT, IMAGE_LOGOCAT),
      logocat1: tile(1, SIZE_LOGOCAT, IMAGE_LOGOCAT),

      cave: tile(pos(0,3), SIZE_CAVE),

      icon_mouse:  tile(0, SIZE_ICON, IMAGE_ICONS),
      icon_pallas: tile(1, SIZE_ICON, IMAGE_ICONS),
    };

    initLevel(0)

    // init game
    gravity = -.01;
    objectDefaultDamping = .99;
    objectDefaultAngleDamping = .99;
    cameraScale = 4*16 *1.20;
    cameraPos = getCameraTarget();

    buildUI()

    if (enableMusic)
      playAudioFile('music/game jam song final.mp3', 1, true)

    setGameState(debugGameState ? debugGameState : enableStartMenu ? GameState.STARTMENU : GameState.PLAYING )
}

function scaleToFit(containerSize, containedSize) {
  const xScale = containerSize.x / containedSize.x
  const yScale = containerSize.y / containedSize.y
  const scale = Math.min(xScale, yScale)
  return Math.min(scale, 1.0)
}

// Credits
// Our Team
// Jim – The programmer who brought everything together, handling all the technical aspects of the game.
// Polina – The artist responsible for all the visuals, including backgrounds, characters, and animations.
// Jasmine – The composer who created all the music and sound effects in the game.
//
const creditsTextLeft = "Programming\nArt\nMusic\n\nPhotography"
const creditsTextRight = "Jim [link]\nPolina [link]\nJasmine [link]\n\nWikimedia Commons [link]"
const aboutText = 
  "The Pallas's cat (Otocolobus manul)\n" +
  "\n"+
  "    A small wild cat with long and dense light grey fur, and\n" +
  "    rounded ears set low on the sides of the head.\n" +
  "\n"+
  "    IUCN Status: LEAST CONCERN (LC)\n" +
  "\n"+
  "Salt-Marsh Harvest Mouse (Reithrodontomys raviventris)\n" +
  "\n"+
  "    Also known as the red-bellied harvest mouse, an endangered\n" +
  "    rodent endemic to the San Francisco Bay Area\n"+
  "\n"+
  "    IUCN Status: ENDANGERED (EN)"

function buildUI() {
    initUISystem();

    //const scale = scaleToFit(mainCanvasSize, SIZE_UI)
    //uiScale = scale
    //console.log(scale)

    w.uiRoot = new UIObject(mainCanvasSize.scale(0.5)); // size is 0
    uiRoot.visible = true

    // tiles are positioned in center of parent
    w.uiStartMenuBackground = new UITile(vec2(0), SIZE_UI, spriteAtlas['start_menu_background'])
    uiRoot.addChild(uiStartMenuBackground);

    const buttonx = -360
    const catPos = vec2(180, 180); // vec2(180, 120)
    const uiButtonPlay = new UITile(vec2(buttonx, -200), SIZE_BUTTON, spriteAtlas['start_menu_button_play'])
    const uiButtonCredits = new UITile(vec2(buttonx, 0), SIZE_BUTTON, spriteAtlas['start_menu_button_credits'])
    const uiButtonAbout = new UITile(vec2(buttonx, 200), SIZE_BUTTON, spriteAtlas['start_menu_button_about'])
    const uiButtonHighScores = new UITile(vec2(buttonx, 400), SIZE_BUTTON, spriteAtlas['start_menu_button_scores'])
    const uiLogocat = new UIAnim(catPos, SIZE_LOGOCAT.scale(0.8), spriteAtlas['logocat'], 5, 8)

    uiStartMenuBackground.addChild(uiButtonPlay);
    uiStartMenuBackground.addChild(uiButtonCredits);
    uiStartMenuBackground.addChild(uiButtonAbout);
    uiStartMenuBackground.addChild(uiButtonHighScores);
    uiStartMenuBackground.addChild(uiLogocat);

    uiButtonPlay.onClick = () => setGameState(GameState.PLAYING)
    uiButtonCredits.onClick = () => setGameState(GameState.CREDITS)
    uiButtonAbout.onClick = () => setGameState(GameState.ABOUT)
    uiButtonHighScores.onClick = () => setGameState(GameState.HIGHSCORE)

    uiCreditsScreen    = buildScreen('Credits', GameState.CREDITS, creditsTextLeft, creditsTextRight);
    uiHighScoresScreen = buildScreen('High Scores', GameState.HIGHSCORE, "50\n40\n30");
    uiAboutScreen = buildScreen('About Pallas', GameState.ABOUT, aboutText);
    uiWinScreen = buildScreen('A winner is you!', GameState.WIN, undefined, undefined, GameState.INITLEVEL, "Next Level")
}

function buildScreen(text, gameState, content, content2, nextGameState=GameState.STARTMENU, buttonText = "Ok") {
  const half = mainCanvasSize.scale(0.5)
  const icons = gameState == GameState.ABOUT

  const uiScreen = new UIObject(half, half)

  //const background = new UIObject(vec2(0,mainCanvasSize.y/2), vec2(800,300))
  const uiTitle = new UIText(vec2(0, -200), vec2(1000, 70), text);
  uiScreen.addChild(uiTitle)

  if (icons) {
    const textX = -220
    const iconX = -350
    uiScreen.addChild(new UIText(vec2(textX, -130), vec2(800, 22), content, 'left'));
    uiScreen.addChild(new UITile(vec2(iconX,-80), SIZE_ICON, spriteAtlas['icon_pallas']));  // https://en.wikipedia.org/wiki/Pallas%27s_cat
    uiScreen.addChild(new UITile(vec2(iconX, 90), SIZE_ICON, spriteAtlas['icon_mouse']));
    uiScreen.addChild(new UIText(vec2(textX, -130), vec2(800, 22), content, 'left'));
  } else if (content2) {
    const x = -80
    uiScreen.addChild(new UIText(vec2(x - 20, -100), vec2(600, 40), content, 'right'));
    uiScreen.addChild(new UIText(vec2(x + 20, -100), vec2(600, 40), content2, 'left'));
  } else if (content) {
    uiScreen.addChild(new UIText(vec2(-400, -100), vec2(800, 25), content, 'left'));
  }


  const okButton = new UIButton(vec2(0, 200), vec2(400, 40), buttonText, GameState.STARTMENU)
  okButton.onClick = () => setGameState(nextGameState)
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

          savedWarmthTimer = STARTING_WARMTH
          warmthTimer.set(savedWarmthTimer)
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
    //const offset = 200/cameraScale*percent(mainCanvasSize.y, 300, 400);
    //console.log(offset)
    //return player.pos.add(vec2(0, offset));
    return player.pos;
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
      //drawTile(vec2(mainCanvasSize.x / 2, mainCanvasSize.y / 2), vec2(SIZE_UI), spriteAtlas['start_menu_background'], GRAY, 0, false, undefined, false, true);
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
      drawText(`Warmth: ${Math.max(-Math.floor(warmthTimer.get()/2), 0)}`, overlayCanvas.width*1/8, 20);
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
