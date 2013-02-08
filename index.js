var socket = require("./socket");
var http = require("http");
var express = require("express");
var app = express();


var server = http.createServer(app);



app.get('/*.(js|css|html)', function(req, res){
  res.sendfile("./public"+req.url);
});


socket.start(server)

server.listen(3000)