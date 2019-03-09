var gameplaySize = 0;

function initiate() {
  var gameplay = document.getElementById("gameplay");
  var gameplayContainer = document.getElementById("gameplay-container");
  if (gameplayContainer.offsetWidth > gameplayContainer.offsetHeight) {
    gameplaySize = gameplayContainer.offsetHeight * 0.9;
  } else {
    gameplaySize = gameplayContainer.offsetWidth * 0.9;
  }
  gameplay.style.width = gameplaySize + "px";
  gameplay.style.height = gameplaySize + "px";
}
