var viewport = (9.0/16.0);
var transVPX = 256.0;
var transVPY = 144.0;

// viewport translated: (256, 144) radius

var gameplayWidth = 0;
var gameplayHeight = 0;

function initiate() {
  var gameplay = document.getElementById("gameplay");
  var gameplayContainer = document.getElementById("gameplay-container");
  var svg = document.getElementById("svg");
  if (gameplayContainer.offsetWidth * viewport < gameplayContainer.offsetHeight) {
    gameplayWidth = gameplayContainer.offsetWidth;
    gameplayHeight = gameplayWidth * viewport;
  } else {
    gameplayHeight = gameplayContainer.offsetHeight;
    gameplayWidth = gameplayHeight * (1.0/viewport);
  }
  gameplay.style.width = gameplayWidth + "px";
  gameplay.style.height = gameplayHeight + "px";
  svg.innerHTML = "";
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 9; j++) {
    svg.innerHTML += "<image xlink:href='https://github.com/N8WM/build-a-wall/blob/master/brick.png?raw=true' width='" + getRealX(16) + "' x='" + getRealX(i*16) + "' y='" + getRealY(j*16) + "'/>";
    }
  }
}

function run() {
  
  window.requestAnimationFrame(run);
  
}

function getRealX(x) {
  return (x / transVPX) * gameplayWidth;
}

function getRealY(y) {
  return (y / transVPY) * gameplayHeight;
}

function getEasyX(x) {
  return (x / gameplayWidth) * transVPX;
}

function getEasyY(y) {
  return (y / gameplayHeight) - transVPY;
}

