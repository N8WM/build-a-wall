const express = require('express');
const app = express();
const port = 8080;//process.env.PORT;
var http = require('http').Server(app);
var io = require('socket.io')(http);

var colors = ["green", "blue", "red", "purple"];
var stageSize = 64;
var rooms = new Rooms();

/*
function Rooms() {                     // an object that holds rooms
  this.rooms = []
  function addRoom(r) {                // takes room key, generates a room with that key
    this.rooms.push(r);
  }
  function addRoom() {                 // generates a room with random room key
    var rtmp = generateRoomKey();
    while (!this.getRoom(rtmp)) {
      rtmp = generateRoomKey();
    }
    var nr = new Room(rtmp);
    this.rooms.push(nr);
    return nr;
  }
  function getRoom(k) {                // takes room key, returns room
    for (var r in this.rooms) {
      if (room.getRoomKey() === k) {
        return r;
      }
    }
    return false;
  }
  function getVacantRooms() {          // returns an array of unfilled rooms
    var vr = [];
    for (var vrtmp in this.rooms) {
      if (r.isVacant()) {
        vr.push(vrtmp);
      }
    }
    return vr;
  }
  function addPlayer(apk) {
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
  function getRoomKey() {
    return this.roomKey;
  }
  function getStage() {
    return this.stage;
  }
  function addBlock(x, y, c) {
    this.stage[x][y] = c;
  }
  function getTime() {
    return this.time;
  }
  function getColors() {
    return this.colors;
  }
  function addColor(ac) {
    this.colors.push(ac);
  }
  function isVacant() {
    return this.colors.length < colors.length;
  }
  function addPlayer() {
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
*/

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
    var color = colors[Math.floor(Math.random()*colors.length)];
    var roomKey = "1234";
    socket.emit('join valid', color, roomKey);
  });

  console.log("load");
});

app.use(express.static('static'));

http.listen(port, () => console.log('Example app listening on port ' + port + '!'));
