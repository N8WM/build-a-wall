var viewport = (9.0/16.0);

var gameplayWidth = 0;
var gameplayHeight = 0;

function initiate() {
  var gameplay = document.getElementById("gameplay");
  var gameplayContainer = document.getElementById("gameplay-container");
  if (gameplayContainer.offsetWidth > gameplayContainer.offsetHeight * viewport) {
    gameplayWidth = gameplayContainer.offsetWidth * 0.9;
    gameplayHeight = gameplayWidth * viewport;
  } else {
    gameplayHeight = gameplayContainer.offsetHeight * 0.9;
    gameplayWidth = gameplayHeight * (1.0/viewport);
  }
  gameplay.style.width = gameplayWidth + "px";
  gameplay.style.height = gameplayHeight + "px";
}
