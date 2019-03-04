const express = require('express');
const app = express();
const port = /*8080;*/ process.env.PORT;
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/template/index.html');
});

io.on('connection', function(socket){
  /**
  socket.emit('request', ####); // emit an event to the socket
  io.emit('broadcast', ####); // emit an event to all connected sockets
  socket.on('reply', function(){ #### }); // listen to the event
  **/
  console.log("load");
});

app.use(express.static('static'));

http.listen(port, () => console.log('Example app listening on port ' + port + '!'));
