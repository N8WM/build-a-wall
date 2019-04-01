const express = require('express');
const app = express();
const port = /*8080;*/process.env.PORT;
var http = require('http').Server(app);
var io = require('socket.io')(http);

var colors = ["green", "blue", "red", "purple"];
var stageSize = 64;

function Room(roomKey) {
  this.roomKey = roomKey;
  this.stage = function() {
    var tmpStage = [];
    for (var i = 0; i < stageSize; i++) {
      var tmp = [];
      for (var j = 0; j < stageSize; j++) {
        tmp.push(0);
      }
      tmpStage.push(tmp);
    }
    return tmpStage;
  };
  this.time = 300;
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
    var colors = ["red", "green", "blue", "purple"];
    var color = colors[Math.floor(Math.random()*colors.length)];
    var roomKey = "1234";
    socket.emit('join valid', color, roomKey);
  });

  console.log("load");
});

app.use(express.static('static'));

http.listen(port, () => console.log('Example app listening on port ' + port + '!'));
