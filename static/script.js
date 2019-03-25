// TODO: switch from SVG to canvas

var viewport = (9.0/16.0);
var transVPX = 256.0;
var transVPY = 144.0;
var stageSize = 128;
var blockSize = 16;

var playerX = 128;
var playerY = 72;

var blocks = [];
for (var i = 0; i < stageSize; i++) {
  var tmp = [];
  for (var j = 0; j < stageSize; j++) {
    tmp.push((Math.floor(Math.random()*5)===2)?1:0);
  }
  blocks.push(tmp);
}

// viewport translated: (256, 144)

var gameplayWidth = 0;
var gameplayHeight = 0;

function initiate() {
  var gameplay = document.getElementById("gameplay");
  var gameplayContainer = document.getElementById("gameplay-container");
  var canvas = document.getElementById("canvas");
  if (gameplayContainer.offsetWidth * viewport < gameplayContainer.offsetHeight) {
    gameplayWidth = gameplayContainer.offsetWidth;
    gameplayHeight = gameplayWidth * viewport;
  } else {
    gameplayHeight = gameplayContainer.offsetHeight;
    gameplayWidth = gameplayHeight * (1.0/viewport);
  }
  gameplay.style.width = gameplayWidth + "px";
  gameplay.style.height = gameplayHeight + "px";
  canvas.width = gameplayWidth;
  canvas.height = gameplayHeight;
}

function run() {
  draw();

  //window.requestAnimationFrame(run);
}

function draw() {
  for (var i = 0; i < blocks.length; i++) {
    for (var j = 0; j < blocks[0].length; j++) {
      if (blocks[i][j] === 1) {
        drawWall(i, j);
      }
    }
  }
}

function vpx2rx(x) {
  return (x / transVPX) * gameplayWidth;
}

function vpy2ry(y) {
  return (y / transVPY) * gameplayHeight;
}

function rx2vpx(x) {
  return (x / gameplayWidth) * transVPX;
}

function ry2vpy(y) {
  return (y / gameplayHeight) - transVPY;
}

function sx2vpx(x) {
  return x * blockSize;
}

function sy2vpy(y) {
  return y * blockSize;
}

function vpx2sx(x) {
  return x / blockSize;
}

function vpy2sy(y) {
  return y / blockSize;
}

function placeWall(x, y) {
  blocks.push[vpx2sx(x)][vpy2sy(y)];
}

function drawWall(x, y) {
  var ctx = document.getElementById("canvas").getContext("2d");
  // svg.innerHTML += "<rect x='" + vpx2rx((sx2vpx(x) - playerX + (transVPX / 2))) + "' y='" + vpy2ry((sy2vpy(y) - playerY + (transVPY / 2))) + "' width='" + vpx2rx(blockSize) + "' height='" + vpy2ry(blockSize) + "' style='fill:blue;stroke-width:5;' />";
  var cx = vpx2rx((sx2vpx(x) - playerX + (transVPX / 2)));
  var cy = vpy2ry((sy2vpy(y) - playerY + (transVPY / 2)));
  var width = vpx2rx(blockSize);
  var height = vpy2ry(blockSize);
  ctx.beginPath();
  ctx.lineWidth = "4";
  ctx.strokeStyle = "green";
  ctx.rect(cx, cy, width, height);
  ctx.stroke();
}
