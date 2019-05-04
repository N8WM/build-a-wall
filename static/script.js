var socket = io();

var manager;
var colors = ["green", "blue", "red", "purple"];

var viewport = (9.0/16.0);
var transVPX = 256.0;
var transVPY = 144.0;
var stageSize = 64;
var blockSize = 16;

var playerX = 0;
var playerY = 0;
var crosshairSize = blockSize;
var playerSpeed = 5;

var playerColor = "";
var roomKey = "";

var up = false;
var right = false;
var down = false;
var left = false;

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
    playerX = 0;
    playerY = 0;
    run();
  } else if (playerColor === colors[1]) {
    playerX = 0;
    playerY = transVPY;
    run();
  } else if (playerColor === colors[2]) {
    playerX = transVPX;
    playerY = transVPY;
    run();
  } else if (playerColor === colors[3]) {
    playerX = transVPX;
    playerY = 0;
    run();
  }
  else {
    end();
  }
}

function run() {
  if (!manager) {
    var options = {
      zone: document.getElementById("input-container"),                  // active zone
      color: "lightblue",
      size: vpy2ry(transVPY / 3),
      multitouch: false,
      //position: {right: vpx2rx(transVPX/7)+'px', bottom: vpx2rx(transVPX/7)+'px'},
      mode: 'dynamic'
    };
    manager = nipplejs.create(options);
  }
  manager.on('dir:up', function() {
    up = true;
    right = false;
    down = false;
    left = false;
  });
  manager.on('dir:right', function() {
    right = true;
    up = false;
    down = false;
    left = false;
  });
  manager.on('dir:down', function() {
    down = true;
    up = false;
    right = false;
    left = false;
  });
  manager.on('dir:left', function() {
    left = true;
    up = false;
    right = false;
    down = false;
  });
  manager.on('end', function() {
    left = false;
    up = false;
    right = false;
    down = false;
  });
  var ctx = document.getElementById("canvs").getContext("2d");
  ctx.clearRect(0, 0, gameplayWidth, gameplayHeight);
  playerColor = (up?"green":right?"blue":down?"red":left?"purple":"black");
  draw();
  drawBorders();
  drawCrosshair("black");
  detectMovement();
  window.requestAnimationFrame(run);
}

function detectMovement() {
  if (up && playerY > sy2vpy(1)) {
    playerY -= playerSpeed;
  }
  if (right && playerX < sx2vpx(stageSize - 1)) {
    playerX += playerSpeed;
  }
  if (down && playerY < sy2vpy(stageSize - 1)) {
    playerY += playerSpeed;
  }
  if (left && playerX > sx2vpx(1)) {
    playerX -= playerSpeed;
  }
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

function drawCrosshair(color) {
  var ctx = document.getElementById("canvs").getContext("2d");
  var cx = vpx2rx(transVPX / 2);
  var cy = vpy2ry(transVPY / 2);
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = color;
  ctx.moveTo(cx - vpx2rx(crosshairSize / 2), cy);
  ctx.lineTo(cx + vpx2rx(crosshairSize / 2), cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.lineWidth = "3";
  ctx.strokeStyle = color;
  ctx.moveTo(cx, cy - vpy2ry(crosshairSize / 2));
  ctx.lineTo(cx, cy + vpy2ry(crosshairSize / 2));
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
