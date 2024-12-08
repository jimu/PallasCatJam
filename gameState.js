const GameState = {
  INIT: 0,
  STARTMENU: 1,
  PLAYING: 2,
  WIN: 3,
  CREDITS: 4,
  HIGHSCORE: 5,
  ABOUT: 6,
}
  
let gameState = GameState.INIT;
let savedWarmthTimer;

function setGameState(state) {
  //console.log(`setGameState: ${gameState} => ${state}`)

  if (gameState == GameState.PLAYING)
    savedWarmthTimer = warmthTimer.get()
  else if (state == GameState.PLAYING && savedWarmthTimer)
    warmthTimer.set(savedWarmthTimer)
    

  gameState = state

  uiRoot.visible = gameState == GameState.STARTMENU
  uiCreditsScreen.visible = gameState == GameState.CREDITS
  uiAboutScreen.visible = gameState == GameState.ABOUT
  uiWinScreen.visible = gameState == GameState.WIN
  uiHighScoresScreen.visible = gameState == GameState.HIGHSCORE

  renderMask = gameState == GameState.PLAYING ? 1 : 2;

}
