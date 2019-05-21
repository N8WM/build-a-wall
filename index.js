const express = require('express');
const app = express();
const port = /*8080;*/process.env.PORT;
var http = require('http').Server(app);
var io = require('socket.io')(http);

var colors = ["green", "blue", "red", "purple"];
var stageSize = 64;
var rooms = new Rooms();

var modelStage = function() {
  var tmpStage = [];
  for (var i = 0; i < stageSize; i++) {
    var tmp = [];
    for (var j = 0; j < stageSize; j++) {
      tmp.push(false);
    }
    tmpStage.push(tmp);
  }
  return tmpStage;
};

function Rooms() {                     // an object that holds rooms
  this.rooms = [];
  this.addRoom = function() {                 // generates a room with random room key, returns key
    var rtmp = generateRoomKey();
    while (this.getRoom(rtmp)) {
      rtmp = generateRoomKey();
    }
    var nr = new Room(rtmp);
    this.rooms.push(nr);
    return rtmp;
  };
  this.removeRoom = function (rrk) {           // takes room key, removes room and returns true if removed
    for (var i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].getRoomKey() === rrk) {
        this.rooms.splice(i, 1);
        return true;
      }
    }
    return false;
  };
  this.getRoom = function (rktmps) {                // takes room key, returns room
    for (var i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].getRoomKey() === rktmps) {
        return this.rooms[i];
      }
    }
    return false;
  };
  this.getVacantRooms = function () {          // returns an array of unfilled room keys
    var vr = [];
    for (var i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].isVacant()) {
        vr.push(this.rooms[i].getRoomKey());
      }
    }
    return vr;
  };
  this.addPlayer = function (apk, apsig) {            // add a player to the room with the specified key, returns color
    return this.getRoom(apk).addPlayer(apsig);
  };
}

function Room(roomKey) {                       // an object that stores the necessary values for a room
  this.roomKey = roomKey;                      // roomKey (str), stage (int[][]), colors (int[]), time (int);
  this.stage = modelStage;
  this.colors = [];
  this.signatures = [];
  this.time = 300;
  this.getRoomKey = function () {
    return this.roomKey;
  };
  this.getStage = function () {
    return this.stage;
  };
  this.addBlock = function (x, y, c) {
    console.log(stage[x][y]);
    console.log(c);
    this.stage[x][y] = c;
  };
  this.getTime = function () {
    return this.time;
  };
  this.getColors = function () {
    return this.colors;
  };
  this.isVacant = function () {
    return this.colors.length < colors.length;
  };
  this.addPlayer = function (apsig) {
    var ctmp;
    if (this.isVacant()) {
      ctmp = colors[Math.floor(Math.random()*colors.length)];
      while (this.colors.indexOf(ctmp)!== -1) {
        ctmp = colors[Math.floor(Math.random()*colors.length)];
      }
      this.colors.push(ctmp);
      this.signatures.push(apsig);
      return ctmp;
    }
    return false;
  };
  this.submitStage = function () {
    for (var i = 0; i < this.signatures.length; i++) {
      this.signatures[i].emit('ssub', this.stage);
    }
  };
}

function generateRoomKey() {
  var chars = "abcdefghijklmnopqrstuvwxyz";
  var tmp = "";
  for (var i = 0; i < 6; i++) {
    tmp += chars.substr(Math.floor(Math.random()*chars.length),1);
  }
  return tmp;
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/template/index.html');
});

io.on('connection', function(socket) {
  /**
  socket.emit('request', ####); // emit an event to the socket
  io.emit('broadcast', ####); // emit an event to all connected sockets
  socket.on('reply', function(){ #### }); // listen to the event
  **/
  socket.on('join', function() {
    var vrooms = rooms.getVacantRooms();
    console.log("vacant rooms ok: " + vrooms);
    if (vrooms.length > 0) {
      console.log("if ok");
      var tmpColor = rooms.addPlayer(vrooms[0], socket);
      console.log("add player ok: " + tmpColor);
      if (tmpColor) {
        socket.emit('join valid', tmpColor, vrooms[0]);
      } else {
        socket.emit('join invalid');
      }
    }
    else {
      console.log("else ok");
      var tmpKey = rooms.addRoom();
      console.log("add room ok: " + tmpKey + " ... " + rooms.rooms.length);
      var tmpColor = rooms.addPlayer(tmpKey, socket);
      console.log("add player ok: " + tmpColor);
      if (tmpColor) {
        socket.emit('join valid', tmpColor, tmpKey);
      } else {
        socket.emit('join invalid');
      }
    }
  });
  socket.on('block', function(key, x, y, pcolor) {
    rooms.getRoom(key).addBlock(x, y, pcolor);
    rooms.getRoom(key).submitStage();
  });

  console.log("load");
});

app.use(express.static('static'));

http.listen(port, () => console.log('Example app listening on port ' + port + '!'));
