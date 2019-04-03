var socket = io();

var manager;

var viewport = (9.0/16.0);
var transVPX = 256.0;
var transVPY = 144.0;
var stageSize = 64;
var blockSize = 16;

var playerX = 0;
var playerY = 0;
var playerD = 90;
var playerColor = "black";
var roomKey = "";
var up = false;
var right = false;
var down = false;
var left = false;

var blocks = [];
for (var i = 0; i < stageSize; i++) {
  var tmp = [];
  for (var j = 0; j < stageSize; j++) {
    tmp.push(0);
  }
  blocks.push(tmp);
}

// viewport translated: (256, 144)
var touch = false;
var joinValid = false;
var dots = 0.0;

var gameplayWidth = 0;
var gameplayHeight = 0;

function initiate() {
  document.getElementById("input-container").addEventListener("mousedown", function(){ touch = true; });
  document.getElementById("input-container").addEventListener("mouseup", function(){ touch = false; play = 1; });
  var gameplay = document.getElementById("gameplay");
  var gameplayContainer = document.getElementById("gameplay-container");
  var canvas = document.getElementById("canvs");
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
  if (!manager) {
    var options = {
      zone: document.getElementById("input-container"),                  // active zone
      color: "lightblue",
      size: Math.round(vpx2rx(transVPY / 3)),
      multitouch: false,
      mode: 'dynamic'
    };
    manager = nipplejs.create(options);
  }
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.clearRect(0, 0, gameplayWidth, gameplayHeight);
  draw();
  drawBorders()
  playerX += 0.1;
  playerY += 0.1;
  window.requestAnimationFrame(run);
}

var play = 0;
var playSize = transVPY * 0.3;
var playSizeOffset = 0;
var unpressingC = 1;
var pressingC = 0;
var prevTouch = false;

function intro() {
  if (play > 0) {
    play++;
  }
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.clearRect(0, 0, gameplayWidth, gameplayHeight);
  if (touch && !prevTouch) {
    pressingC = 1;
  } else if (prevTouch && !touch) {
    unpressingC = 1;
  }
  prevTouch = touch;
  if (unpressingC > 0 && unpressingC < 20) {
    pressingC = 0;
    unpressingC++;
    playSizeOffset = -1 * (transVPY * 2 * -Math.sin(unpressingC) / (unpressingC * unpressingC * 5));
  } else if (pressingC > 0) {
    unpressingC = 0;
    pressingC++;
    playSizeOffset = (transVPY * 2 * -Math.sin(pressingC) / (pressingC * pressingC * 5) + (transVPY * 0.075));
  } else {
    pressingC = 0;
    unpressingC = 0;
    playSizeOffset = 0;
  }
  drawPlay(playSize + playSizeOffset);
  if (play >= 20) {
    socket.emit('join');
    join();
  } else {
    window.requestAnimationFrame(intro);
  }
}

function join() {
  loading();
  if (!joinValid) {
    window.requestAnimationFrame(join);
  } else {
    run();
  }
}

socket.on('join valid', function(pColor, pRoomKey){
  playerColor = pColor;
  roomKey = pRoomKey;
  joinValid = true;
});

function loading() {
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.clearRect(0, 0, gameplayWidth, gameplayHeight);
  ctx.font = vpy2ry(20) + "px Arial";
  var loadingDots = (Math.floor(dots)===0)?"":(Math.floor(dots)===1)?".":(Math.floor(dots)===2)?"..":(Math.floor(dots)===3)?"...":"....";
  dots = (dots >= 5)?0.0:(dots + 0.1);
  ctx.fillText("Loading" + loadingDots, vpx2rx(5), vpy2ry(transVPY - 5));

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

function placeWall(x, y, color) {
  blocks[vpx2sx(x)][vpy2sy(y)] = color;
}

function drawWall(x, y, color) {
  var ctx = document.getElementById("canvs").getContext("2d");
  var cx = vpx2rx((sx2vpx(x) - playerX + (transVPX / 2)));
  var cy = vpy2ry((sy2vpy(y) - playerY + (transVPY / 2)));
  var width = vpx2rx(blockSize);
  var height = vpy2ry(blockSize);
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = color;
  ctx.rect(cx, cy, width, height);
  ctx.stroke();
}

function drawBorders() {
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = "black";
  ctx.moveTo(vpx2rx((sx2vpx(0) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(0) - playerY + (transVPY / 2))));
  ctx.lineTo(vpx2rx((sx2vpx(stageSize) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(0) - playerY + (transVPY / 2))));
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = "black";
  ctx.moveTo(vpx2rx((sx2vpx(stageSize) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(0) - playerY + (transVPY / 2))));
  ctx.lineTo(vpx2rx((sx2vpx(stageSize) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(stageSize) - playerY + (transVPY / 2))));
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = "black";
  ctx.moveTo(vpx2rx((sx2vpx(stageSize) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(stageSize) - playerY + (transVPY / 2))));
  ctx.lineTo(vpx2rx((sx2vpx(0) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(stageSize) - playerY + (transVPY / 2))));
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = "black";
  ctx.moveTo(vpx2rx((sx2vpx(0) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(stageSize) - playerY + (transVPY / 2))));
  ctx.lineTo(vpx2rx((sx2vpx(0) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(0) - playerY + (transVPY / 2))));
  ctx.stroke();
}

function drawPlay(s) {
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = "green";
  ctx.arc(vpx2rx(transVPX / 2), vpy2ry(transVPY / 2), vpy2ry(s), 0, 2 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = "green";
  ctx.moveTo(vpx2rx((transVPX / 2)-(s * 0.20)), vpy2ry((transVPY / 2)-(s * 0.25)));
  ctx.lineTo(vpx2rx((transVPX / 2)+(s * 0.25)), vpy2ry(transVPY / 2));
  ctx.lineTo(vpx2rx((transVPX / 2)-(s * 0.20)), vpy2ry((transVPY / 2)+(s * 0.25)));
  ctx.lineTo(vpx2rx((transVPX / 2)-(s * 0.20)), vpy2ry((transVPY / 2)-(s * 0.25)));
  ctx.stroke();
}
