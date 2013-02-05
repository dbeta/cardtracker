var activeSockets = 0;
var stats = new Array(new Array());
var stats = [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]];
var players = 0;
var rooms = new room("default", 0, 0);
function start(port) {
	var io = require('socket.io').listen(port);
	io.sockets.on('connection', function (socket) {
		activeSockets+=1;
		socket.on('my other event', function (data) {console.log(data)});
		socket.on('updaterequest', function() {updateclient(socket)});
		socket.on('disconnect', function() {socketDisconnect(socket)});
		socket.on('setstats', function(val) {setStats(socket, val)});
		socket.on('setplayers', function(val) {setPlayers(socket, val)});
		socket.emit('news', "Hello World");
		console.log("New client. Total: " + activeSockets);
		socket.broadcast.emit("clients", activeSockets);
	});
	console.log("The Socket server has started.");
}
exports.start = start;

function setStats(socket, val){
	stats = val;
	socket.broadcast.emit("stats", stats, players);
}


function socketDisconnect(socket){
	activeSockets -=1;
	socket.broadcast.emit("clients", activeSockets);
	console.log("Client Disconnect. Total: " + activeSockets);
}
function updateclient(socket){
	socket.emit("clients", activeSockets);
	socket.emit("stats", stats, players);
}

function setPlayers(socket, val){
	players = val;
	for(var i = 0; i <= players; i++){
		if(stats[i]){
			stats[i] = [0,0,"Player " + i];
		}
	};
}

function player(name, gear, lvl, gender) {
	this.name=name;
	this.gear=gear;
	this.lvl=lvl;
	this.gender=gender;
}
function room(name, password) {
	this.name=name;
	this.sockets=new Array();
	this.password=password;
	function join(socket){
		this.sockets.push(socket);
	}
	function leave(socket){
		this.socket.remove(socket);
	}
}