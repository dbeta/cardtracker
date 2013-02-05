var server = require("./server");
var socket = require("./socket");
var router = require("./router");
server.start(30000,router.route)
socket.start(30001)
