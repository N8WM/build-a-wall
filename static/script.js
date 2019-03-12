var viewport = (9.0/16.0);
var transVPX = 144.0;
var transVPY = 256.0;

// viewport translated: (144, 256) radius

var gameplayWidth = 0;
var gameplayHeight = 0;

function initiate() {
  var gameplay = document.getElementById("gameplay");
  var gameplayContainer = document.getElementById("gameplay-container");
  if (gameplayContainer.offsetWidth * viewport < gameplayContainer.offsetHeight) {
    gameplayWidth = gameplayContainer.offsetWidth;
    gameplayHeight = gameplayWidth * viewport;
  } else {
    gameplayHeight = gameplayContainer.offsetHeight;
    gameplayWidth = gameplayHeight * (1.0/viewport);
  }
  gameplay.style.width = gameplayWidth + "px";
  gameplay.style.height = gameplayHeight + "px";
}

function run() {
  window.requestAnimationFrame(run);
}

function getRealX(x) {
  return ((x + transVPX) / (2.0 * transVPX)) * gameplayWidth;
}

function getRealY(y) {
  return gameplayHeight - ((y + transVPY) / (2.0 * transVPY)) * gameplayHeight;
}

function getEasyX(x) {
  return ((x / gameplayWidth) * (2.0 * transVPX)) - transVPX;
}

function getEasyY(y) {
  return (((gameplayHeight - y) / gameplayHeight) * (2.0 * transVPY)) - transVPY;
}
