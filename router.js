var fs = require('fs');
function route(pathname, response) {
	console.log("About to route a request for " + pathname);
	if(pathname == "/"){
		fs.readFile('./client.html', function(err, content){
			if(err){
				response.writeHead(500);
				response.end();
				console.log(err);
			}else{
				response.writeHead(200, {'Content-Type': 'text/html'});
				response.end(content, 'utf-8');
			}
		});
	}
}

exports.route = route;
