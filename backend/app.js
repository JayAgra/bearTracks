var http = require('http');
var querystring = require('querystring');
var sqlite = require('sqlite3')

function processPost(request, response, callback) {
    var queryData = "";
    if(typeof callback !== 'function') return null;

    if(request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if(queryData.length > 1e8) {
                queryData = "";
                response.writeHead(413, {'Content-Type': 'text/plain'}).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {'Content-Type': 'text/plain'});
        response.end();
    }
}

http.createServer(function(request, response) {
  if(request.method == 'POST') {
      processPost(request, response, function() {
          console.log(request.post);
          console.log(request.post.event);

          response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
          response.end();
      });
  } else {
      response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
      response.end();
  }

}).listen(8080);