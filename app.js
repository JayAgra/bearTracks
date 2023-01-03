const http = require('http');
const fs = require('fs');
const formidable = require('formidable');
const sqlite3 = require('sqlite3').verbose();
var querystring = require('querystring');
const {
    mainhostname,
    myteam
} = require('./config.json');

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
    if (typeof callback !== 'function') return null;

    if (request.method == 'POST') {
        request.on('data', function(data) {
            queryData += data;
            if (queryData.length > 1e8) {
                queryData = "";
                response.writeHead(413, {
                    'Content-Type': 'text/plain'
                }).end();
                request.connection.destroy();
            }
        });

        request.on('end', function() {
            request.post = querystring.parse(queryData);
            callback();
        });

    } else {
        response.writeHead(405, {
            'Content-Type': 'text/plain'
        });
        response.write('405 - METHOD NOT ALLOWED')
        response.end();
    }
}

http.createServer(function(request, response) {
    if (request.method == 'POST') {
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
                                response.writeHead(500, "INTERNAL SERVER ERROR", {
                                    'Content-Type': 'text/html'
                                });
                                response.write('<!DOCTYPE html><body><h2>FATAL ERROR!</h2><h5>500 Internal Server Error</h5><h4>Try re-sending POST (reload)</h4><p>SENDER IP: "' + ip + '"</p><p>Submission ID: "main.' + err.message + '"</p></body>')
                                response.end();
                                //log error message, notify user of failure
                                console.log('\x1b[35m', err.message);
                            } else {
                                // get the last insert id
                                console.log('[', '\x1b[32m', 'SUBMISSION', '\x1b[0m', '] on ', '\x1b[36m', 'main', '\x1b[0m', ' form, at ' + time + ', scout with IP "' + ip + '". Submission ID: "main.' + this.lastID + '".')
                                    //send success message
                                response.writeHead(200, "OK", {
                                    'Content-Type': 'text/html'
                                });
                                response.write(`<!DOCTYPE html><head><meta http-equiv="refresh" content="3;url=http://${mainhostname}/scout/"><style>body {background-color: #121212;color: #fff;}</style></head><body><h1 style="color: green; text-align: center">Submitted!</h1><h3 style="text-align: center; color: lightgray;">Redirecting...</h3><p style="text-align: center">SENDER IP: "${ip}"</p><p style="text-align: center">Submission ID: "main.${this.lastID}"</p><p style="color: purple; text-align: center;">Submission Time: ${time}</p></body>`)
                                response.end();
                            }
                        });
                    } else if (request.post.formType === 'pitform') {
                        if (req.method === 'POST' && req.headers['content-type'].startsWith('multipart/form-data')) {
                            //upload prog
                            res.writeHead(200, {
                                'Content-Type': 'text/html'
                            });
                            res.write('<html><head><title>Upload Progress</title></head><body>');
                            res.write('<div id="progress">0%</div>');
                            res.write('</body></html>');
                            res.flush();

                            // formidable parses the incoming form
                            const form = new formidable.IncomingForm();
                            form.parse(req, (error, fields, files) => {
                                if (error) {
                                    console.error(error);
                                    res.statusCode = 500;
                                    res.end();
                                } else {
                                            // get each image field
                                            for (let i = 1; i <= 5; i++) {
                                                const fieldName = `img${i}`;
                                                if (files[fieldName]) {
                                                    // random string based on time
                                                    const fileName = `${Math.floor(Date.now() / 1000)}`;

                                                    // imagemagik convert to PNG
                                                    const gm = require('gm');
                                                    gm(files[fieldName].path)
                                                        .write(`${fileName}.png`, (error) => {
                                                            if (error) {
                                                                console.error(error);
                                                                res.statusCode = 500;
                                                                res.end();
                                                            } else {
                                                                // put the file name in the DB
                                                                db.run(`INSERT INTO pit (${fieldName}) VALUES (?)`, fileName, (error) => {
                                                                    if (error) {
                                                                        console.error(error);
                                                                        res.statusCode = 500;
                                                                        res.end();
                                                                    } else {
                                                                        //update prog
                                                                        //move progress, but there are other bits too so make it out of 6 not 5
                                                                        res.write(`<script>document.getElementById("progress").innerHTML = "${Math.floor((i / 6) * 100)}%";</script>`);
                                                                        res.flush();
                                                                    }
                                                                });
                                                            }
                                                        });
                                                } else {
                                                    //move progress, but there are other bits too so make it out of 6 not 5
                                                    res.write(`<script>document.getElementById("progress").innerHTML = "${Math.floor((i / 6) * 100)}%";</script>`);
                                                    res.flush();
                                                }
                                            }

                                            //insert all other items
                                            //THIS MAY BE AN AWFUL IDEA
                                            //I DO NOT CARE
                                            for (const fieldName in fields) {
                                                db.run(`INSERT INTO pit (${fieldName}) VALUES (?)`, fields[fieldName], (error) => {
                                                    if (error) {
                                                        console.error(error);
                                                        res.statusCode = 500;
                                                        res.end();
                                                    }
                                                });
                                            }

                                            //log entry
                                            console.log(fields);

                                            //done!
                                            res.statusCode = 200;
                                            res.end('Submitted');
                                        }
                                    });
                                }
            } else {
                console.log('no type specified')
                response.writeHead(400, "BAD REQUEST - MISSING CRITICAL DATA formType", {
                    'Content-Type': 'text/plain'
                });
                response.write("400 - BAD REQUEST - MISSING CRITICAL DATA formType\nVALID VALUES OF formType: mainform, pitform")
                response.end();
                return;
            }
          } else {
            console.log('non-POST request')
            response.writeHead(400, "BAD REQUEST - NOT A POST REQUEST", {
                'Content-Type': 'text/plain'
            });
            response.write("PLEASE USE THE POST METHOD")
            response.end();
            return;
          }
        });
} else {
    response.writeHead(400, "BAD REQUEST", {
        'Content-Type': 'text/plain'
    });
    response.write("400 - BAD REQUEST - MISSING ALL POST DATA")
    response.end();
    return;
}
}).listen(766);
console.log("server running on http://localhost:766/");