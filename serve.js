const qs = require('querystring');
const sqlite3 = require('sqlite3');
const express = require('express')
const session  = require('express-session')
const fs = require('fs');
const https = require('https');
const http = require('http');
var EventEmitter = require("events").EventEmitter;
const { frcapi, myteam, season } = require('./config.json');
const multer  = require('multer')
const upload = multer({ dest: 'images/' })
const { exec } = require('child_process');
const rateLimit = require('express-rate-limit')

var app = express();

const options = {
  key: fs.readFileSync(__dirname + '/ssl/privatekey.pem', 'utf8'),
  cert: fs.readFileSync(__dirname + '/ssl/certificate.crt', 'utf8')
};

//checks file size of ssl, if it exists (is filled), use HTTPS on port 443
if (fs.statSync("ssl/certificate.crt").size <= 100 || fs.statSync("ssl/privatekey.pem").size <= 100) {} else {https.createServer(options, app).listen(443)}

const ejs = require('ejs')
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use('/images', express.static('images'))
app.use('/public', express.static('src/public'))

function valueToEmote(value) {
  if (value == null || value == "false") {
    return "❌";
  } else {
    return "✅";
  }
}

function invalidJSON(str) {
  try {
      JSON.parse(str);
      return false
  } catch (error) {
      return true
  }
}

const passport = require('passport')
const Strategy = require('passport-discord').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

//add ratelimit for the /api path
const apiLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 150, // Limit each IP to 150 requests per 10 minutes
	standardHeaders: true, 
	legacyHeaders: false
})

//use the ratelimiter
app.use('/api', apiLimiter)

const scopes = ['identify', 'email', 'guilds', 'guilds.join'];
//honestly not sure why I need guilds.join
const { clientId, clientSec, redirectURI, teamServerID } = require('./config.json');

//check the JSON file to see if the user is in the team discord server
function inTeamServer(json) {
  var isInTheServer = false;
  for (var index = 0; index < json.length; ++index) {
   var server = json[index];
   if(server.id == teamServerID){
     isInTheServer = true;
     break;
   }
  }
  return isInTheServer;
}

//THIS IS NOT THE DISCORD.JS MODULE, THIS IS THE FILE NAMED DISCORD.JS
const discordSendData = require("./discord.js");

passport.use(new Strategy({
  clientID: clientId,
  clientSecret: clientSec,
  callbackURL: redirectURI,
  scope: scopes
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    return done(null, profile);
  });
}));

//before server creation
console.log('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' + '\x1b[32m', '[INFO] ' ,'\x1b[0m' + "Preparing...")

app.use(session({
  //i have no clue what this secret is but stackoverflow said to make it a random string
  secret: require('crypto').randomBytes(48).toString('hex'),
  resave: false,
  saveUninitialized: false,
  maxAge: 24 * 60 * 60 * 1000 * 183 // 183 days
}));
app.use(passport.initialize());
app.use(passport.session());

//send users to discord to login when the /login url is visited
app.get('/login', passport.authenticate('discord', { scope: scopes }), function(req, res) {});

//get the auth code from discord (the code parameter) and use it to get a token
app.get('/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }), function(req, res) { res.redirect('/') } // auth success
);

//destroy session
app.get('/logout', function(req, res) {
  if (req.session) {req.session.destroy(); res.redirect('/');} else {res.send("error!")}
});

//use for lets encrypt verification
app.get('/.well-known/acme-challenge/', function(req, res) {
  res.send("");
});

//i have no idea why i wrote this
app.get('/dataProcessing', function(req, res) {
  res.send("Recorded Data: Username, user ID, avatar ID, user discriminator (tag), email with discord account, and time of first login. Also collected is submitted scouting data, all of which is associated with discord account. Data that is sent by discord but not saved on disk include list of member servers, used only to confirm membership with team server. This data is not shared and kept within the scouting app's database. If you would like to see all of this data, send a GET request to the /info URL while logged in with discord.");
});

//get the main form submissions
app.post('/submit', function(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let formData = qs.parse(body);
      if (formData.formType == 'pit') {
        res.end("WRONG FORM IDIOT            ADFHOISDHAFBYDIUHO:FJUOIFBUHOIJKNJSJD:NFBHODS:KNJFB")
      } else if (formData.formType == 'main') {
        let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
              console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' +  err.message);
              res.end('pit form error! ' + err.message);
            }
        });
        let stmt = `INSERT INTO main (event, name, team, match, level, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, game21, game22, game23, game24, game25, teleop, defend, driving, overall, discordID, discordName, discordTag, discordAvatarId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let values = [formData.event, formData.name, formData.team, formData.match, formData.level, formData.game1, formData.game2, formData.game3, formData.game4, formData.game5, formData.game6, formData.game7, formData.game8, formData.game9, formData.game10, formData.game11, formData.game12, formData.game13, formData.game14, formData.game15, formData.game16, formData.game17, formData.game18, formData.game19, formData.game20, formData.game21, formData.game22, formData.game23, formData.game24, formData.game25, formData.teleop, formData.defend, formData.driving, formData.overall, req.user.id, req.user.username, req.user.discriminator, req.user.avatar];
        db.run(stmt, values, function(err) {
            if (err) {
              console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' +  err.message);
              res.end('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' + 'pit form error! ' + err.message);
            }
            discordSendData.newSubmission("main", this.lastID, req.user.username, formData.name);
        });
        db.close((err) => {
            if (err) {
              console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' +  err.message);
              res.end('pit form error! ' + err.message);
            }
        });
        res.render('../src/submitted.ejs', { 
          root: __dirname,
          SubmissionDetails: "User ID: " + req.user.id + "\nUsername: " + req.user.username + "\nUser Tag: " + req.user.discriminator
        })
      } else {
        console.log(formData);
        return res.status(500).send(
          "unknown form type"
        );
      }
    });
});

//use this thing to do the pit form image thing
const imageUploads = upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }, { name: 'image5', maxCount: 1 }])
app.post('/submitPit', imageUploads, function(req, res) {
  let formData = req.body
  exec(`mv images/${req.files.image1[0].filename} images/${req.files.image1[0].filename+"."+(req.files.image1[0].mimetype).substr(6)}`, (err, stdout, stderr) => {});
  exec(`mv images/${req.files.image2[0].filename} images/${req.files.image2[0].filename+"."+(req.files.image2[0].mimetype).substr(6)}`, (err, stdout, stderr) => {});
  exec(`mv images/${req.files.image3[0].filename} images/${req.files.image3[0].filename+"."+(req.files.image3[0].mimetype).substr(6)}`, (err, stdout, stderr) => {});
  exec(`mv images/${req.files.image4[0].filename} images/${req.files.image4[0].filename+"."+(req.files.image4[0].mimetype).substr(6)}`, (err, stdout, stderr) => {});
  exec(`mv images/${req.files.image5[0].filename} images/${req.files.image5[0].filename+"."+(req.files.image5[0].mimetype).substr(6)}`, (err, stdout, stderr) => {});
  let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' + err.message);
      res.end('pit form error! ' + err.message);
    }
  });
  let stmt = `INSERT INTO pit (event, name, team, drivetype, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, driveTeam, attended, confidence, bqual, overall, discordID, discordName, discordTag, discordAvatarId, image1, image2, image3, image4, image5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  let values = [formData.event, formData.name, formData.team, formData.drivetype, formData.game1, formData.game2, formData.game3, formData.game4, formData.game5, formData.game6, formData.game7, formData.game8, formData.game9, formData.game10, formData.game11, formData.game12, formData.game13, formData.game14, formData.game15, formData.game16, formData.game17, formData.game18, formData.game19, formData.game20, formData.driveTeam, formData.attended, formData.confidence, formData.bqual, formData.overall, req.user.id, req.user.username, req.user.discriminator, req.user.avatar, req.files.image1[0].filename+"."+(req.files.image1[0].mimetype).substr(6), req.files.image2[0].filename+"."+(req.files.image2[0].mimetype).substr(6), req.files.image3[0].filename+"."+(req.files.image3[0].mimetype).substr(6), req.files.image4[0].filename+"."+(req.files.image4[0].mimetype).substr(6), req.files.image5[0].filename+"."+(req.files.image5[0].mimetype).substr(6)];
  db.run(stmt, values, function(err) {
    if (err) {
      console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' + err.message);
      res.end('pit form error! ' + err.message);
    }
    discordSendData.newSubmission("pit", this.lastID, req.user.username, formData.name);
  });
  db.close((err) => {
    if (err) {
      console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' + err.message);
      res.end('pit form error! ' + err.message);
    }
  });
  res.render('../src/submitted.ejs', { 
    root: __dirname,
    SubmissionDetails: "User ID: " + req.user.id + "\nUsername: " + req.user.username + "\nUser Tag: " + req.user.discriminator
  })
});

//index.html, read the code
app.get('/', checkAuth, function(req, res) {
  res.sendFile('./src/index.html', { root: __dirname })
});

//service worker for PWA installs
app.get('/sw.js', checkAuth, function(req, res) {
  res.sendFile('./src/sw.js', { root: __dirname })
});

//main scouting form
app.get('/main', checkAuth, function(req, res) {
  res.render('../src/main.ejs', { 
    root: __dirname,
    discordID: req.user.id,
    discordName: req.user.username,
    discordTag: req.user.discriminator,
    discordAvatarId: req.user.avatar
  })
});

//webmanifest for PWAs
app.get('/app.webmanifest', function(req, res) {
  res.sendFile('./src/app.webmanifest', { root: __dirname })
});

//pit form
app.get('/pit', checkAuth, function(req, res) {
  res.render('../src/pit.ejs', { 
    root: __dirname,
    discordID: req.user.id,
    discordName: req.user.username,
    discordTag: req.user.discriminator,
    discordAvatarId: req.user.avatar
  })
});

//serve resources
app.get('/2023_float.css', function(req, res) {
  res.sendFile('./src/2023_float.min.css', { root: __dirname })
});

//serve resources
app.get('/fonts/Raleway-300.ttf', function(req, res) {
  res.sendFile('./src/fonts/Raleway-300.ttf', { root: __dirname })
});

//serve resources
app.get('/fonts/Raleway-500.ttf', function(req, res) {
  res.sendFile('./src/fonts/Raleway-500.ttf', { root: __dirname })
});

//allow people to get denied :)
app.get('/denied', function(req, res) {
  try {
  res.render('../src/denied.ejs', { 
    root: __dirname,
    SubmissionDetails: "User ID: " + req.user.id + "\nUsername: " + req.user.username + "\nUser Tag: " + req.user.discriminator
  })
  } catch (error) {
    res.write("Access Denied!" + "\nCould not render 404 page!" + "\n Error: " + error)
  } 
});

//print out all info discord gives
app.get('/info', checkAuth, function(req, res) {
  console.log(req.user.id)
  console.log(req.user.username)
  console.log(req.user.avatar)
  console.log(req.user.discriminator)
  console.log(inTeamServer(req.user.guilds))
  res.json(req.user);
  //res.redirect('/')
});

//tool to browse match scouting data
app.get('/browse', checkAuth, function(req, res) {
  if (req.query.team && req.query.event && req.query.page) {
    let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {});
    db.get(`SELECT * FROM main WHERE team=${req.query.team} AND event="${req.query.event}" ORDER BY id ASC LIMIT 1 OFFSET ${req.query.page}`, (err, dbQueryResult) => {
    if (err) {
      res.render('../src/browse.ejs', { 
        root: __dirname,
        errorDisplay: "block",
        errorMessage: 'Error: No results!',
        displaySearch: "flex",
        displayResults: "none",
        resultsTeamNumber: 0,
        resultsMatchNumber: 0,
        resultsEventCode: 0,
        resultsBody: 0
      })
      return;
    } else {
    if (typeof dbQueryResult == "undefined") {
      res.render('../src/browse.ejs', { 
        root: __dirname,
        errorDisplay: "block",
        errorMessage: 'Error: No results!',
        displaySearch: "flex",
        displayResults: "none",
        resultsTeamNumber: 0,
        resultsMatchNumber: 0,
        resultsEventCode: 0,
        resultsBody: 0
      })
      return;
    } else {
      res.render('../src/browse.ejs', { 
        root: __dirname,
        errorDisplay: "none",
        errorMessage: 'no errors :)',
        errorMessage: null,
        displaySearch: "none",
        displayResults: "flex",
        resultsTeamNumber: `${dbQueryResult.team}`,
        resultsMatchNumber: `${dbQueryResult.match}`,
        resultsEventCode: `${dbQueryResult.event}`,
        resultsBody: `AUTO: <br>Taxi: ${valueToEmote(dbQueryResult.game1)}<br>Score B/M/T: ${valueToEmote(dbQueryResult.game2)}${valueToEmote(dbQueryResult.game3)}${valueToEmote(dbQueryResult.game4)}<br>Charging: ${dbQueryResult.game5} pts<br><br>TELEOP: <br>Score B/M/T: ${valueToEmote(dbQueryResult.game6)}${valueToEmote(dbQueryResult.game7)}${valueToEmote(dbQueryResult.game8)}<br>Charging: ${dbQueryResult.game10} pts<br><br>Other: <br>Alliance COOPERTITION: ${valueToEmote(dbQueryResult.game9)}<br>Cycle Time: ${dbQueryResult.game11} seconds<br>Defense: ${dbQueryResult.defend}<br>Driving: ${dbQueryResult.driving}<br>Overall: ${dbQueryResult.overall}`
      })
      return;
    }
    }
    });
    db.close((err) => {return;});
  } else {
  res.render('../src/browse.ejs', { 
    root: __dirname,
    errorDisplay: "none",
    errorMessage: 'no errors :)',
    errorMessage: null,
    displaySearch: "flex",
    displayResults: "none",
    resultsTeamNumber: 0,
    resultsMatchNumber: 0,
    resultsEventCode: 0,
    resultsBody: 0
  })
  return;
  }
});

//get list of matches
app.get('/matches', checkAuth, function(req, res) {
  if (req.query.event) {
    const eventCode = req.query.event
    var dbody = new EventEmitter();
    var options = {
        'method': 'GET',
        'hostname': 'frc-api.firstinspires.org',
        'path': `/v3.0/${season}/schedule/${req.query.event}?tournamentLevel=qualification&teamNumber=${myteam}`,
        'headers': {
            'Authorization': 'Basic ' + frcapi
        },
        'maxRedirects': 20
    };

    var req = https.request(options, function(res) {
        var chunks = [];

        res.on("data", function(chunk) {
            chunks.push(chunk);
        });

        res.on("end", function(chunk) {
            var body = Buffer.concat(chunks);
            data = body;
            dbody.emit('update');
        });

        res.on("error", function(error) {
            console.error(error);
        });
    });
    req.end();
    dbody.on('update', function() {
        if (invalidJSON(data)) {
            return;
        } else {
          const parsedData = JSON.parse(data);
          var matchesContent = "";
          for (let i = 0; i < parsedData.Schedule.length; i++) {
            matchesContent = matchesContent + `<fieldset><label>${parsedData.Schedule[i].description}<br>${(parsedData.Schedule[i].startTime).replace("T", " ")}</label><br><span style="color: #ff0000;"><a href="browse?team=${parsedData.Schedule[i].teams[0].teamNumber}&page=0&event=${eventCode}">${parsedData.Schedule[i].teams[0].teamNumber}</a>&emsp;<a href="browse?team=${parsedData.Schedule[i].teams[1].teamNumber}&page=0&event=${eventCode}">${parsedData.Schedule[i].teams[1].teamNumber}</a>&emsp;<a href="browse?team=${parsedData.Schedule[i].teams[2].teamNumber}&page=0&event=${eventCode}">${parsedData.Schedule[i].teams[2].teamNumber}</a></span><br><span style="color: #0000ff;"><a href="browse?team=${parsedData.Schedule[i].teams[3].teamNumber}&page=0&event=${eventCode}">${parsedData.Schedule[i].teams[3].teamNumber}</a>&emsp;<a href="browse?team=${parsedData.Schedule[i].teams[4].teamNumber}&page=0&event=${eventCode}">${parsedData.Schedule[i].teams[4].teamNumber}</a>&emsp;<a href="browse?team=${parsedData.Schedule[i].teams[5].teamNumber}&page=0&event=${eventCode}">${parsedData.Schedule[i].teams[5].teamNumber}</a></span></fieldset>`;
          }
          res.render('../src/matches.ejs', { 
            root: __dirname,
            displaySelect: 'none',
            displayResults: 'flex',
            matchesBody: matchesContent
          })
          return;
        }
    });
  } else {
  res.render('../src/matches.ejs', { 
    root: __dirname,
    displaySelect: 'flex',
    displayResults: 'none',
    matchesBody: "null"
  })
  return;
  }
});

//serve the uploaded images
app.get('/pitimages', checkAuth, function(req, res) {
  if (req.query.team && req.query.event) {
    let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {});
    db.get(`SELECT * FROM pit WHERE team=${req.query.team} AND event="${req.query.event}" ORDER BY id LIMIT 1`, (err, dbQueryResult) => {
    if (err) {
      res.render('../src/pitimg.ejs', { 
        root: __dirname,
        errorDisplay: "block",
        errorMessage: 'Error: No results!',
        displaySearch: "flex",
        displayResults: "none",
        resultsTeamNumber: 0,
        resultsEventCode: 0,
        resultsBody: 0
      })
      return;
    } else {
    if (typeof dbQueryResult == "undefined") {
      res.render('../src/pitimg.ejs', { 
        root: __dirname,
        errorDisplay: "block",
        errorMessage: 'Error: No results!',
        displaySearch: "flex",
        displayResults: "none",
        resultsTeamNumber: 0,
        resultsEventCode: 0,
        resultsBody: 0
      })
      return;
    } else {
      res.render('../src/pitimg.ejs', { 
        root: __dirname,
        errorDisplay: "none",
        errorMessage: 'no errors :)',
        errorMessage: null,
        displaySearch: "none",
        displayResults: "flex",
        resultsTeamNumber: `${dbQueryResult.team}`,
        resultsEventCode: `${dbQueryResult.event}`,
        resultsBody: `<img src="${dbQueryResult.image1}"/><br><img src="${dbQueryResult.image2}"/><br><img src="${dbQueryResult.image3}"/><br><img src="${dbQueryResult.image4}"/><br><img src="${dbQueryResult.image5}"/>`
      })
      return;
    }
    }
    });
    db.close((err) => {return;});
  } else {
  res.render('../src/pitimg.ejs', { 
    root: __dirname,
    errorDisplay: "none",
    errorMessage: 'no errors :)',
    errorMessage: null,
    displaySearch: "flex",
    displayResults: "none",
    resultsTeamNumber: 0,
    resultsEventCode: 0,
    resultsBody: 0
  })
  return;
  }
});

//api, has been removed for now
/*app.get('/api/matches/:event', function(req, res) {
  if (req.params.event) {
    var dbody = new EventEmitter();
    var options = {
        'method': 'GET',
        'hostname': 'frc-api.firstinspires.org',
        'path': `/v3.0/${season}/schedule/${req.params.event}?tournamentLevel=qualification&teamNumber=${myteam}`,
        'headers': {
            'Authorization': 'Basic ' + frcapi
        },
        'maxRedirects': 20
    };

    var req = https.request(options, function(res) {
        var chunks = [];

        res.on("data", function(chunk) {
            chunks.push(chunk);
        });

        res.on("end", function(chunk) {
            var body = Buffer.concat(chunks);
            data = body;
            dbody.emit('update');
        });

        res.on("error", function(error) {
            console.error(error);
        });
    });
    req.end();
    dbody.on('update', function() {
        if (invalidJSON(data)) {
          res.header("Content-Type",'application/json');
          res.send(`{"error": "got invalid response from FRC API"}`);  
          return;
        } else {
          res.json(JSON.parse(data));
          return;
        }
      });
  } else {
    res.header("Content-Type",'application/json');
    res.send(`{"error": "no specified event code"}`);
  }
});

app.post('/api/auth', function(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
  let authParams = qs.parse(body);
  let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {});
  db.get(`SELECT * FROM scouts WHERE email="${authParams.email}" AND password="${authParams.password}" ORDER BY discordID ASC LIMIT 1`, (err, accountQueryResults) => {
  if (err) {
    res.header("Content-Type",'application/json');
    res.status(401)
    res.send(`{"error": "badCredentials"}`);
    res.end();
    return;
  } else if (accountQueryResults) {
    res.header("Content-Type",'application/json');
    res.send(`{"userID": "${accountQueryResults.discordID}", "discordAvatar": "${accountQueryResults.discordProfile}", "discordUsername": "${accountQueryResults.username}", "discriminator": "${accountQueryResults.discriminator}" }`);
    res.end();
    return;
  } else {
    res.header("Content-Type",'application/json');
    res.status(401)
    res.send(`{"error": "badCredentials"}`);
    res.end();
    return;
  }
  });
});
});*/

//auth functions
app.get('/', passport.authenticate('discord'));
app.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/');
});

//check the authentication and server membership
function checkAuth(req, res, next) {
  if (req.isAuthenticated() && inTeamServer(req.user.guilds)) return addToDataBase(req, next);
  if (req.isAuthenticated() && !inTeamServer(req.user.guilds)) return res.redirect('/denied')
  res.redirect('/login');
}

//add scouts to database
function addToDataBase(req, next) {
  let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {});
  const password = require('crypto').randomBytes(12).toString('hex')
  db.get(`SELECT * FROM scouts WHERE email="${req.user.email}" AND discordID="${req.user.id}" ORDER BY discordID ASC LIMIT 1`, (err, accountQueryResults) => {
    if (err) {
      return;
    } else {
      if (accountQueryResults) {
        return;
      } else {
        //discordSendData.sendPasswordToUser(req.user.id, password, req.user.email);
      }
    }
  });
  db.run(`INSERT OR IGNORE INTO scouts(discordID, email, password, discordProfile, username, discriminator, addedAt) VALUES(${req.user.id}, "${req.user.email}", "${password}", "${req.user.avatar}", "${req.user.username}", ${req.user.discriminator}, "${req.user.fetchedAt}")`);
  db.close((err) => {
    if (err) {
      console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' +  err.message);
      res.end('error! ' + err.message);
    }
  });
  return next();
}

if (fs.statSync("ssl/certificate.crt").size <= 100 || fs.statSync("ssl/privatekey.pem").size <= 100) {app.listen(80)} else {const httpRedirect = express(); httpRedirect.all('*', (req, res) => res.redirect(`https://${req.hostname}${req.url}`)); const httpServer = http.createServer(httpRedirect); httpServer.listen(80, () => console.log(`HTTP server listening: http://localhost`));}

//server created and ready for a request
console.log('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' + '\x1b[32m', '[INFO] ' ,'\x1b[0m' + "Ready!");