var http = require("http");
var url = require("url");

function start(port, route) {
	function onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		console.log("Request for" + pathname + " received");
		route(pathname, response);
	}
	http.createServer(onRequest).listen(port);
	console.log("The HTTP server has started.");
}
exports.start = start;