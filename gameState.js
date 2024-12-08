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

function setGameState(state) {
  console.log(`setGameState: ${gameState} => ${state}`)
  gameState = state

  uiRoot.visible = gameState == GameState.STARTMENU
  uiCreditsScreen.visible = gameState == GameState.CREDITS
  uiAboutScreen.visible = gameState == GameState.ABOUT
  uiHighScoresScreen.visible = gameState == GameState.HIGHSCORE

  if (gameState == GameState.CREDITS) console.log("credits")
  if (gameState == GameState.HIGHSCORE) console.log("highscore")
  if (gameState == GameState.ABOUT) console.log("about")
  renderMask = gameState == GameState.PLAYING ? 1 : 2;
}
