var http = require('http');
var querystring = require('querystring');
var sqlite3 = require('sqlite3')
var RequestIp = require('@supercharge/request-ip');
const { mainhostname, myteam } = require('./config.json');

//conenct to form database
let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
    console.log("DATABASE CONNECTION FAILED")
  }
  console.log('Connected to database.');
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
              //insert data into table
              db.run(`INSERT INTO data(eventcode, name, teamnum, teamnam, match, madeupper, missedupper, madelower, missedlower, barsatt, barsdone, autoattempt, shootauto, getauto, taxiauto, failauto, violate, human, performance, defend, teleop, driving, overall, matchlvl) VALUES ('${request.post.event}','${request.post.name}','${request.post.teamnum}','${request.post.teamnam}','${request.post.matchno}','${request.post.madeupper}','${request.post.missedupper}','${request.post.madelower}','${request.post.missedlower}','${request.post.barsatt}','${request.post.barsdone}','${request.post.autonATTSCOREFAIL}','${request.post.autonSHOOT}','${request.post.autonINTAKE}','${request.post.autonTAXI}','${request.post.autonATTSCOREFAIL}','no response','${request.post.humanplayer}','${request.post.consistent}','${request.post.defenseThought}','${request.post.drivingThought}','${request.post.overallThought}','${request.post.matchlvl}'`, function(err) {
                if (err) {
                  response.writeHead(500, "INTERNAL SERVER ERROR", {'Content-Type': 'text/html'});
                  response.write('<!DOCTYPE html><body><h2>FATAL ERROR!</h2><h5>500 Internal Server Error</h5><h4>Try re-sending POST (reload)</h4><p>SENDER IP: "' + ip + '"</p><p>Submission ID: "main.' + err.message + '"</p></body>')
                  response.end();
                  //log error message, notify user of failure
                  return console.log(err.message);
                }
                // get the last insert id
                console.log('At ' + time + ', scout with IP "' + ip + '" submitted to main form. Submission ID: "main.' + this.lastID + '".')
              });
              //send success message
              response.writeHead(200, "OK", {'Content-Type': 'text/html'});
              response.write(`<!DOCTYPE html><head><meta http-equiv="refresh" content="3;url=http://${mainhostname}/scout/"></head><body><h2>Done!</h2><p>SENDER IP: "${ip}"</p><p>Submission ID: "main.${this.lastID}"</p></body>`)
              response.end();
            } else {
              const ip = RequestIp.getClientIp(request)
              console.log('Submission on pit form - sender IP "' + ip + '"');
              //insert data into table
              //send success message
              response.writeHead(200, "OK", {'Content-Type': 'text/html'});
              response.write(`<!DOCTYPE html><head><meta http-equiv="refresh" content="3;url=http://${mainhostname}/scout/"></head><body><h2>Done!</h2><p>SENDER IP: "${ip}"</p><p>Submission ID: "main.${this.lastID}"</p></body>`)
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