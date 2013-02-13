var activeSockets = new Array();
var stats = new Array(new Array());
var stats = [[0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]];
var rooms = new Array();
var playernamemax = 40;

function start(app) {
	console.log(rooms.name);
	var io = require('socket.io').listen(app);
	io.sockets.on('connection', function (socket) {socketConnect(socket)});
	console.log("The Socket server has started.");
}
exports.start = start;


function socketConnect(socket){
	activeSockets[socket.id] = socket;
	socket.room = 0;
	socket.on('disconnect', function() {socketDisconnect(socket)});
	socket.on('removePlayer', function(pname) {if(socket.room && pname){socket.room.removePlayer(pname)}});
	socket.on('addPlayer', function(pname, gender) {if(socket.room && pname){socket.room.addPlayer(pname, gender)}});
	socket.on('addStat', function(pname, stat, val) {if(socket.room && pname){socket.room.addStat(pname, stat, val); socket.room.updateSockets(socket, 1);}});
	socket.on('joinRoom', function(rname, password) {joinRoom(socket, rname, password);});
	console.log("New client. Total: " + aaSize(activeSockets));
	
}

function socketDisconnect(socket){
	delete activeSockets[socket.id];
	if(socket.room){
		socket.room.roomLeave(socket);
	}
	console.log("Client Disconnect. Total: " + aaSize(activeSockets));
}

function joinRoom(socket, rname, password){
	if(rname && rname.length < 30){
		if(rooms[rname]){
			if(rooms[rname].password == password){
				rooms[rname].roomJoin(socket);
			} else {
				socket.emit("alert", "Invalid Password");
			}
		} else {
			newroom = new room(rname, password);
			rooms[newroom.name] = newroom;
			rooms[newroom.name].roomJoin(socket)
		}
	} else {
		socket.emit("alert", "Room name too long or short");
	}
}

function player(name,gender) {
	this.name=name;
	this.gear=0;
	this.lvl=1;
	this.gender=gender;
}
function room(name, password) {
	this.name=name;
	this.sockets= {};
	this.password=password;
	this.players=new Array();
	console.log("New room " + name);
	this.updateSockets = function(socket, broadcast) {
		var statupdate = new Array(new Array());
		statupdate[0]=[0,1,0]
		for(var i = 0; i < this.players.length; i++){
			statupdate[i+1] = [this.players[i].gear, this.players[i].lvl, this.players[i].name];
		}
		if(socket && broadcast){
			for(var i in this.sockets) {
				if(this.sockets[i].id != socket.id) {
					this.sockets[i].emit("stats", statupdate, this.players.length);
					this.sockets[i].emit("clients", aaSize(this.sockets));
				}
			}
		} else if(socket && !broadcast){
			socket.emit("stats", statupdate, this.players.length);
			socket.emit("clients", aaSize(this.sockets));
		} else if(broadcast){
			for(var i in this.sockets) {
				this.sockets[i].emit("stats", statupdate, this.players.length);
				this.sockets[i].emit("clients", aaSize(this.sockets));
			}
		}
	}
	this.addStat = function(pname, stat, val){
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i].name == pname){
				if(stat == "gear"){
					if(this.players[i].gear + val >= 0 && this.players[i].gear + val < 100){
						this.players[i].gear+=val;
						console.log("Gear:" + stat + ":" + val);
					}
				}else if(stat == "lvl") {
					if(this.players[i].lvl + val > 0 && this.players[i].lvl + val < 10){
						this.players[i].lvl+=val;
						console.log("Level:" + stat);
					}
				}
				this.updateSockets(0, 1);
				console.log(this.players[i]);
				break;
			}
		}
	}
	
	this.addPlayer = function(pname, gender){
		duplicate=0
		for(var i = 0; i <this.players.length; i++){
			if(this.players[i].name === pname){
				console.log("Duplicate name attempt");
				duplicate = 1;
				break
			}
		}
		if(!duplicate){
			if(pname.length <= playernamemax) {
				this.players.push(new player(pname, gender));
				console.log(pname + " added to room " + this.name);
				this.updateSockets(0, 1);
			}else{
				console.log("Player name too long")
			}
		}
	}
	this.removePlayer = function(pname){
		for(var i = 0; i < this.players.length; i++){
			if(this.players[i].name === pname){
				this.players.splice(i,1);
				this.updateSockets(0, 1);
				break;
			}
		}
	}
	this.roomJoin = function(socket){
		this.sockets[socket.id] = socket;
		socket.room=this;
		socket.emit("inRoom", this.name);
		console.log(this.sockets[socket.id].id +" joined " + this.name + " room, number in room:" + aaSize(this.sockets));
		this.updateSockets(0, 1);
	}
	this.roomLeave = function(socket){
		if(this.sockets[socket.id]){
			delete this.sockets[socket.id];
			console.log(socket.id + " removed from room " + aaSize(this.sockets) + " remaining");
			this.updateSockets(0, 1);
		}
	}
}

function aaSize(myArray) {
	var arrSize = 0
	for (var e in myArray) { arrSize++; }
	return arrSize;
};