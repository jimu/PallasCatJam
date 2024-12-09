const GameState = {
  INIT: 0,
  STARTMENU: 1,
  PLAYING: 2,
  WIN: 3,
  CREDITS: 4,
  HIGHSCORE: 5,
  ABOUT: 6,
  INITLEVEL: 7,
}
  
let gameState = GameState.INIT;

function setGameState(state) {
  console.log(`setGameState: ${gameState} => ${state}`)

  if (state == GameState.INITLEVEL) {
    initLevel(currentLevelId + 1)
    console.log("init level")
    state = GameState.PLAYING
  }

  if (gameState == GameState.PLAYING)
    savedWarmthTimer = warmthTimer.get()
  else if (state == GameState.PLAYING && savedWarmthTimer)
    warmthTimer.set(savedWarmthTimer)

  gameState = state
  setPaused(gameState != GameState.PLAYING)

  uiRoot.visible = gameState == GameState.STARTMENU
  uiCreditsScreen.visible = gameState == GameState.CREDITS
  uiAboutScreen.visible = gameState == GameState.ABOUT
  uiWinScreen.visible = gameState == GameState.WIN
  uiHighScoresScreen.visible = gameState == GameState.HIGHSCORE

  renderMask = gameState == GameState.PLAYING ? 1 : 2;
}
