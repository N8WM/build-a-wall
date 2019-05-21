var socket = io();

var manager;
var colors = ["green", "blue", "red", "purple"];

var viewport = (9.0/16.0);
var transVPX = 256.0;
var transVPY = 144.0;
var stageSize = 64;
var blockSize = 8;
var lineSize = 1;
var edgeBuffer = 0.5;

var nplSize;

var playerX = 0;
var playerY = 0;
var crosshairSize = blockSize;
var playerSpeed = 3;

var playerColor = "";
var roomKey = "";

var position;

var blocks = [];
for (var i = 0; i < stageSize; i++) {
  var tmp = [];
  for (var j = 0; j < stageSize; j++) {
    tmp.push(false);
  }
  blocks.push(tmp);
}

// viewport translated: (256, 144)
var touch = false;
var joinValid = false;
var joinInvalid = false;
var dots = 0.0;

var gameplayWidth = 0;
var gameplayHeight = 0;

function initiate() {
  document.getElementById("input-container").addEventListener("touchstart", function(){ touch = true; });
  document.getElementById("input-container").addEventListener("touchend", function(){ touch = false; play = 1; });
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
  if (!joinValid && !joinInvalid) {
    window.requestAnimationFrame(join);
  } else if (joinInvalid) {
    end();
  } else {
    setup();
  }
}

socket.on('join valid', function(pColor, pRoomKey) {
  playerColor = pColor;
  roomKey = pRoomKey;
  joinValid = true;
});

socket.on('join invalid', function() {
  joinInvalid = true;
});

socket.on('ssub', function(stg) {
  blocks = stg;
});

function end() {
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.clearRect(0, 0, gameplayWidth, gameplayHeight);
  ctx.font = vpy2ry(20) + "px Arial";
  ctx.fillStyle = "darkred";
  ctx.fillText("Error: something went wrong!", vpx2rx(5), vpy2ry(transVPY - 5));
}

function tempRun() {
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.clearRect(0, 0, gameplayWidth, gameplayHeight);
  ctx.font = vpy2ry(20) + "px Arial";
  ctx.fillStyle = playerColor;
  ctx.fillText("Success! " + roomKey + ", " + playerColor, vpx2rx(5), vpy2ry(transVPY - 5));
}

function loading() {
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.clearRect(0, 0, gameplayWidth, gameplayHeight);
  ctx.font = vpy2ry(20) + "px Arial";
  var loadingDots = (Math.floor(dots)===0)?"":(Math.floor(dots)===1)?".":(Math.floor(dots)===2)?"..":(Math.floor(dots)===3)?"...":"....";
  dots = (dots >= 5)?0.0:(dots + 0.1);
  ctx.fillText("Loading" + loadingDots, vpx2rx(5), vpy2ry(transVPY - 5));
}

function setup() {
  if (playerColor === colors[0]) {
    playerX = 0 + edgeBuffer;
    playerY = 0 + edgeBuffer;
    run();
  } else if (playerColor === colors[1]) {
    playerX = 0 + edgeBuffer;
    playerY = sy2vpy(stageSize) - edgeBuffer;
    run();
  } else if (playerColor === colors[2]) {
    playerX = sx2vpx(stageSize) - edgeBuffer;
    playerY = sy2vpy(stageSize) - edgeBuffer;
    run();
  } else if (playerColor === colors[3]) {
    playerX = sx2vpx(stageSize) - edgeBuffer;
    playerY = 0 + edgeBuffer;
    run();
  }
  else {
    end();
  }
}

function run() {
  if (!manager) {
    nplSize = vpy2ry(transVPY / 3);
    var options = {
      zone: document.getElementById("input-container"),                  // active zone
      color: "lightblue",
      size: nplSize,
      multitouch: false,
      //position: {right: vpx2rx(transVPX/7)+'px', bottom: vpx2rx(transVPX/7)+'px'},
      mode: 'dynamic'
    };
    manager = nipplejs.create(options);
  }
  position = manager.get()?manager.get().position:false;
  frontPosition = manager.get()?manager.get().frontPosition:false;
  jx = (frontPosition?frontPosition.x:0 - position?position.x:0)/nplSize*playerSpeed;
  jy = (frontPosition?frontPosition.y:0 - position?position.y:0)/nplSize*playerSpeed;
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.clearRect(0, 0, gameplayWidth, gameplayHeight);
  detectMovement();
  tickWall();
  draw();
  drawBorders();
  drawCrosshair("black");
  window.requestAnimationFrame(run);
}

function detectMovement() {
  if (playerX + jx < edgeBuffer) {
    playerX = edgeBuffer;
    jx = 0;
  }
  if (playerY + jy < edgeBuffer) {
    playerY = edgeBuffer;
    jy = 0;
  }
  if (playerX + jx > sx2vpx(stageSize) - edgeBuffer) {
    playerX = sx2vpx(stageSize) - edgeBuffer;
    jx = 0;
  }
  if (playerY + jy > sy2vpy(stageSize) - edgeBuffer) {
    playerY = sy2vpy(stageSize) - edgeBuffer;
    jy = 0;
  }
  playerX += jx;
  playerY += jy;
}

function draw() {
  for (var i = 0; i < blocks.length; i++) {
    for (var j = 0; j < blocks[0].length; j++) {
      if (blocks[i][j] !== false) {
        drawWall(i, j, colors[blocks[i][j]]);
      }
    }
  }
}

function tickWall() {
  var i = Math.floor(vpx2sx(playerX));
  var j = Math.floor(vpy2sy(playerY));
  var currBlock = blocks[i][j];
  if (currBlock === false) {
    addWall(i, j, playerColor);
  } else if (currBlock !== colors.indexOf(playerColor)) {
    death();
  }
}

function addWall(x, y, color) {
  // blocks[x][y] = colors.indexOf(color);  // for demo. If use, remove next line
  socket.emit('block', roomKey, x, y, color);
}

function death(){

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

function drawWall(x, y, color) {
  var ctx = document.getElementById("canvs").getContext("2d");
  var cx = vpx2rx((sx2vpx(x) - playerX + (transVPX / 2)));
  var cy = vpy2ry((sy2vpy(y) - playerY + (transVPY / 2)));
  var width = vpx2rx(blockSize);
  var height = vpy2ry(blockSize);
  ctx.beginPath();
  ctx.lineWidth = lineSize;
  ctx.strokeStyle = color;
  ctx.rect(cx, cy, width, height);
  ctx.stroke();
}

function drawCrosshair(color) {
  var ctx = document.getElementById("canvs").getContext("2d");
  var cx = vpx2rx(transVPX / 2);
  var cy = vpy2ry(transVPY / 2);
  ctx.beginPath();
  ctx.lineWidth = lineSize;
  ctx.strokeStyle = color;
  ctx.moveTo(cx - vpx2rx(crosshairSize / 2), cy);
  ctx.lineTo(cx + vpx2rx(crosshairSize / 2), cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = lineSize;
  ctx.strokeStyle = color;
  ctx.moveTo(cx, cy - vpy2ry(crosshairSize / 2));
  ctx.lineTo(cx, cy + vpy2ry(crosshairSize / 2));
  ctx.stroke();
}

function drawBorders() {
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.beginPath();
  ctx.lineWidth = lineSize;
  ctx.strokeStyle = "black";
  ctx.moveTo(vpx2rx((sx2vpx(0) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(0) - playerY + (transVPY / 2))));
  ctx.lineTo(vpx2rx((sx2vpx(stageSize) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(0) - playerY + (transVPY / 2))));
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = lineSize;
  ctx.strokeStyle = "black";
  ctx.moveTo(vpx2rx((sx2vpx(stageSize) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(0) - playerY + (transVPY / 2))));
  ctx.lineTo(vpx2rx((sx2vpx(stageSize) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(stageSize) - playerY + (transVPY / 2))));
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = lineSize;
  ctx.strokeStyle = "black";
  ctx.moveTo(vpx2rx((sx2vpx(stageSize) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(stageSize) - playerY + (transVPY / 2))));
  ctx.lineTo(vpx2rx((sx2vpx(0) - playerX + (transVPX / 2))), vpy2ry((sy2vpy(stageSize) - playerY + (transVPY / 2))));
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = lineSize;
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
