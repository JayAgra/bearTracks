var http = require('http');
var querystring = require('querystring');
var sqlite3 = require('sqlite3')
var RequestIp = require('@supercharge/request-ip')

//conenct to form database
let db = new sqlite3.Database('./data.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to database');
});


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
        response.write('405 - METHOD NOT ALLOWED')
        response.end();
    }
}

http.createServer(function(request, response) {
  if(request.method == 'POST') {
      processPost(request, response, function() {
          console.log(request.post);
          if (request.post.formType) {
            if (request.post.formType === 'main') {
              const ip = RequestIp.getClientIp(request)
              console.log('Submission on main form - sender IP "' + ip + '"');
              response.writeHead(200, "OK", {'Content-Type': 'text/html'});
              response.write('<!DOCTYPE html><head><meta http-equiv="refresh" content="3;url=http://example.com/scout/"></head><body><h2>Done!</h2><p>SENDER IP: "'+ip+'"</p></body>')
              response.end();
            } else {
              const ip = RequestIp.getClientIp(request)
              console.log('Submission on pit form - sender IP "' + ip + '"');
              response.writeHead(200, "OK", {'Content-Type': 'text/html'});
              response.write('<!DOCTYPE html><head><meta http-equiv="refresh" content="3;url=http://example.com/scout/"></head><body><h2>Done!</h2><p>SENDER IP: "'+ip+'"</p></body>')
              response.end();
            }
          } else {
            console.log('no type specified')
            response.writeHead(400, "BAD REQUEST - MISSING CRITICAL DATA formType", {'Content-Type': 'text/plain'});
            response.write("400 - BAD REQUEST - MISSING CRITICAL DATA formType\nVALID VALUES OF formType: mainform, pitform")
            response.end();
          }
      });
  } else {
      response.writeHead(400, "BAD REQUEST", {'Content-Type': 'text/plain'});
      response.write("400 - BAD REQUEST - MISSING ALL POST DATA")
      response.end();
  }
}).listen(766);
console.log("server running on http://localhost:766/");