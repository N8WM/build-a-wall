const express = require('express');
const app = express();
const port = /*8080;*/process.env.PORT;
var http = require('http').Server(app);
var io = require('socket.io')(http);

var colors = ["green", "blue", "red", "purple"];
var stageSize = 64;
var rooms = new Rooms();

function Rooms() {                     // an object that holds rooms
  this.rooms = []
  this.addRoom = function (r) {                // takes room key, generates a room with that key
    this.rooms.push(r);
  }
  this.addRoom = function() {                 // generates a room with random room key, returns key
    var rtmp = generateRoomKey();
    while (!this.getRoom(rtmp)) {
      rtmp = generateRoomKey();
    }
    var nr = new Room(rtmp);
    this.rooms.push(nr);
    return rtmp;
  }
  this.removeRoom = function (rrk) {           // takes room key, removes room and returns true if removed
    for (var i = 0; i < this.rooms.length; i++) {
      if (this.rooms[i].getRoomKey() === rrk) {
        this.rooms.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  this.getRoom = function (k) {                // takes room key, returns room
    for (var r in this.rooms) {
      if (room.getRoomKey() === k) {
        return r;
      }
    }
    return false;
  }
  this.getVacantRooms = function () {          // returns an array of unfilled room keys
    var vr = [];
    for (var vrtmp in this.rooms) {
      if (r.isVacant()) {
        vr.push(vrtmp.getRoomKey());
      }
    }
    return vr;
  }
  this.addPlayer = function (apk) {            // add a player to the room with the specified key, returns color
    return this.getRoom(apk).addPlayer();
  }
}

function Room(roomKey) {                       // an object that stores the necessary values for a room
  this.roomKey = roomKey;                      // roomKey (str), stage (int[][]), colors (int[]), time (int);
  this.stage = function() {                    // colors: signifies what colors have already been taken
    for (var i = 0; i < stageSize; i++) {
      var tmp = [];
      for (var j = 0; j < stageSize; j++) {
        tmp.push(null);
      }
      tmpStage.push(tmp);
    }
    return tmpStage;
  };
  this.colors = [];
  this.time = 300;
  this.getRoomKey = function () {
    return this.roomKey;
  }
  this.getStage = function () {
    return this.stage;
  }
  this.addBlock = function (x, y, c) {
    this.stage[x][y] = c;
  }
  this.getTime = function () {
    return this.time;
  }
  this.getColors = function () {
    return this.colors;
  }
  this.addColor = function (ac) {
    this.colors.push(ac);
  }
  this.isVacant = function () {
    return this.colors.length < colors.length;
  }
  this.addPlayer = function () {
    if (this.isVacant()) {
      var ctmp = Math.floor(Math.random()*colors.length);
      while (this.colors.indexOf(ctmp)!== -1) {
        ctmp = Math.floor(Math.random()*colors.length);
      }
      this.colors.push(ctmp);
      return ctmp;
    }
    return false;
  }
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
    /*var color = colors[Math.floor(Math.random()*colors.length)];
    var roomKey = "1234";
    socket.emit('join valid', color, roomKey);*/
    var vrooms = rooms.getVacantRooms();
    if (vrooms.length > 0) {
      var tmpColor = rooms.addPlayer(vrooms[0]);
      if (tmpColor) {
        socket.emit('join valid', tmpColor, vrooms[0], rooms);
      } else {
        socket.emit('join invalid');
      }
    }
    else {
      var tmpKey = rooms.addRoom();
      var tmpColor = rooms.addPlayer(tmpKey);
      if (tmpColor) {
        socket.emit('join valid', tmpColor, tmpKey, rooms);
      } else {
        socket.emit('join invalid');
      }
    }
  });

  console.log("load");
});

app.use(express.static('static'));

http.listen(port, () => console.log('Example app listening on port ' + port + '!'));
