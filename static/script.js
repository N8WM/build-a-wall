var gameplayWidth = 0;
var gameplayHeight = 0;

function initiate() {
  var gameplay = document.getElementById("gameplay");
  var gameplayContainer = document.getElementById("gameplay-container");
  gameplayWidth = gameplayContainer.offsetWidth * 0.9;
  gameplayHeight = gameplayWidth * 0.5625;
  gameplay.style.width = gameplaySize + "px";
  gameplay.style.height = gameplaySize + "px";
}
