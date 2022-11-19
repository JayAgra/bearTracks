var http = require('http');
var querystring = require('querystring');
var sqlite3 = require('sqlite3')
var RequestIp = require('@supercharge/request-ip');
const fs = require('fs');
const { mainhostname, myteam } = require('./config.json');
const process = require('process');
var time = new Date();

//conenct to form database
let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
    console.log("DATABASE CONNECTION FAILED")
  }
  console.log('Connected to database.');
});

function fileString() {
  const characters ="abcdefghijklmnopqrstuvwxyz766";
  const randomArray = Array.from({ length: 20 },(v, k) => characters[Math.floor(Math.random() * characters.length)]);
  const randomString = randomArray.join("");
  return randomString + myteam;
};

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
              //TO-DO: Change game-specific values (madeupper, missedupper, etc.) to general terms (game-element1-complete, game-element1-failure)
              db.run(`INSERT INTO data(eventcode, name, teamnum, teamnam, match, madeupper, missedupper, madelower, missedlower, barsatt, barsdone, autoattempt, shootauto, getauto, taxiauto, failauto, human, performance, defend, teleop, driving, overall, matchlvl, scoutip, season) 
                      VALUES ("${request.post.event}","${request.post.name}","${request.post.teamnum}","${request.post.teamnam}","${request.post.matchno}","${request.post.madeupper}","${request.post.missedupper}","${request.post.madelower}","${request.post.missedlower}","${request.post.barsatt}","${request.post.barsdone}","${request.post.autonATTSCOREFAIL}","${request.post.autonSHOOT}","${request.post.autonINTAKE}","${request.post.autonTAXI}","${request.post.autonNOSCORE}","${request.post.humanplayer}","${request.post.consistent}","${request.post.defenseThought}","${request.post.teleopThought}","${request.post.drivingThought}","${request.post.overallThought}","${request.post.matchlvl}", "${ip}", "2022")`, function(err) {
                if (err) {
                  response.writeHead(500, "INTERNAL SERVER ERROR", {'Content-Type': 'text/html'});
                  response.write('<!DOCTYPE html><body><h2>FATAL ERROR!</h2><h5>500 Internal Server Error</h5><h4>Try re-sending POST (reload)</h4><p>SENDER IP: "' + ip + '"</p><p>Submission ID: "main.' + err.message + '"</p></body>')
                  response.end();
                  //log error message, notify user of failure
                  console.log('\x1b[35m', err.message);
                } else {
                // get the last insert id
                console.log('[','\x1b[32m','SUBMISSION','\x1b[0m','] on ','\x1b[36m','main','\x1b[0m',' form, at ' + time + ', scout with IP "' + ip + '". Submission ID: "main.' + this.lastID + '".')
                //send success message
                response.writeHead(200, "OK", {'Content-Type': 'text/html'});
                response.write(`<!DOCTYPE html><head><meta http-equiv="refresh" content="3;url=http://${mainhostname}/scout/"><style>body {background-color: #121212;color: #fff;}</style></head><body><h1 style="color: green; text-align: center">Submitted!</h1><h3 style="text-align: center; color: lightgray;">Redirecting...</h3><p style="text-align: center">SENDER IP: "${ip}"</p><p style="text-align: center">Submission ID: "main.${this.lastID}"</p><p style="color: purple; text-align: center;">Submission Time: ${time}</p></body>`)
                response.end();
                }
              });
            } else if (request.post.formType === 'pitform') {
              console.log(request.post);
              const ip = RequestIp.getClientIp(request)
              console.log('[','\x1b[32m','SUBMISSION','\x1b[0m','] on ','\x1b[35m','pit','\x1b[0m',' form - sender IP "' + ip + '"');
              //insert data into table
              //game-question1 is held cargo
              //game-question2 is upper hub scoring
              //game-question3 is lower hub scoring
              //game-question4 is low rung climbing
              //game-question5 is mid rung climbing
              //game-question6 is high rung climbing
              //game-question7 is traversal rung climbing
              //write files
              const filenamebase = fileString();
              const filename1 = "1_" + filenamebase
              const filename2 = "2_" + filenamebase
              const filename3 = "3_" + filenamebase
              const filename4 = "4_" + filenamebase
              const filename5 = "5_" + filenamebase
              db.run(`INSERT INTO pit(name,eventcode,teamnum,teamnam,game-question1,game-question2,game-question3,game-question4,game-question5,game-question6,game-question7,drivetype,dteam,confid,buildqual,overall,filename1,filename2,filename3,filename4,filename5,season)
               VALUES ("${request.post.name}","${request.post.event}","${request.post.teamnum}","${request.post.teamnam}","${request.post.game-question1}","${request.post.game-question2}","${request.post.game-question3}","${request.post.game-question4}","${request.post.game-question5}","${request.post.game-question6}","${request.post.game-question7}","${request.post.drivetype}","${request.post.dteam}","${request.post.confid}","${request.post.buildqual}","${request.post.overall}","${request.post.filename1}","${request.post.filename2}","${request.post.filename3}","${request.post.filename4}","${request.post.filename5}")`, function(err) {
                if (err) {
                  response.writeHead(500, "INTERNAL SERVER ERROR", {'Content-Type': 'text/html'});
                  response.write('<!DOCTYPE html><body><h2>FATAL ERROR!</h2><h5>500 Internal Server Error</h5><h4>Try re-sending POST (reload)</h4><p>SENDER IP: "' + ip + '"</p><p>Submission ID: "main.' + err.message + '"</p></body>')
                  response.end();
                  //log error message, notify user of failure
                  console.log('\x1b[35m', err.message);
                } else {
                // get the last insert id
                console.log('[','\x1b[32m','SUBMISSION','\x1b[0m','] on ','\x1b[33m','pit','\x1b[0m',' form, at ' + time + ', scout with IP "' + ip + '". Submission ID: "pit.' + this.lastID + '".')
                //send success message
                response.writeHead(200, "OK", {'Content-Type': 'text/html'});
                response.write(`<!DOCTYPE html><head><meta http-equiv="refresh" content="3;url=http://${mainhostname}/scout/"><style>body {background-color: #121212;color: #fff;}</style></head><body><h1 style="color: green; text-align: center">Submitted!</h1><h3 style="text-align: center; color: lightgray;">Redirecting...</h3><p style="text-align: center">SENDER IP: "${ip}"</p><p style="text-align: center">Submission ID: "main.${this.lastID}"</p><p style="color: purple; text-align: center;">Submission Time: ${time}</p></body>`)
                response.end();
                }
              });
            }
          } else {
            console.log('no type specified')
            response.writeHead(400, "BAD REQUEST - MISSING CRITICAL DATA formType", {'Content-Type': 'text/plain'});
            response.write("400 - BAD REQUEST - MISSING CRITICAL DATA formType\nVALID VALUES OF formType: mainform, pitform")
            response.end();
            return;
          }
      });
  } else {
      response.writeHead(400, "BAD REQUEST", {'Content-Type': 'text/plain'});
      response.write("400 - BAD REQUEST - MISSING ALL POST DATA")
      response.end();
      return;
  }
}).listen(766);
console.log("server running on http://localhost:766/");