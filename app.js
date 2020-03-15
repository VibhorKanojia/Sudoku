
var express = require('express')
var app = express()
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io').listen(http);


app.use(express.static(path.join(__dirname, 'public')));

app.use("/styles",  express.static(__dirname + '/public/stylesheets'));
app.use("/scripts", express.static(__dirname + '/public/javascripts'));
app.use("/images",  express.static(__dirname + '/public/images'));


app.get('/', function (req, res) {
      res.sendFile(__dirname + '/public/Sudoku.html');
});

io.on('connection', function(socket){

	var client_ip_address = socket.request.connection._peername.address;
	
	socket.on('select', function(data){
		socket.broadcast.emit('select', data);
	});

	socket.on('update', function(data){
		socket.broadcast.emit('update', data);
	});
});



http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});









