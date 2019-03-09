function initiate() {
  var gameplay = document.getElementById("gameplay");
  var gameplayContainer = document.getElementById("gameplay-container");
  if (gameplay.offsetWidth > gameplay.offsetHeight) {
    gameplay.style.width = gameplay.offsetHeight + "px";
  } else {
    gameplay.style.height = gameplay.offsetWidth + "px";
  }
}
