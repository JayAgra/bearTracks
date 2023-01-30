const qs = require('querystring');
const sqlite3 = require('sqlite3');
const express = require('express')
const session  = require('express-session')
const fs = require('fs');

var privateKey = fs.readFileSync('ssl/privatekey.pem');
var certificate = fs.readFileSync('ssl/certificate.crt');
var credentials = {key: privateKey, cert: certificate};

if (fs.statSync("ssl/certificate.crt").size <= 1 || fs.statSync("ssl/privatekey.pem").size <= 1) {
  const app = express();
} else {
  const app = express.createServer(credentials);
}

const ejs = require('ejs')
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

function valueToEmote(value) {
  if (value == null || value == "false") {
    return "❌";
  } else {
    return "✅";
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

const scopes = ['identify', 'email', 'guilds', 'guilds.join'];
const { clientId, clientSec, redirectURI, teamServerID } = require('./config.json');

function inTeamServer(json) {
  var hasMatch =false;
  for (var index = 0; index < json.length; ++index) {
   var server = json[index];
   if(server.id == teamServerID){
     hasMatch = true;
     break;
   }
  }
  return hasMatch;
}

const sendSubmission = require("./discord.js");

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
  secret: 'what_is_this',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', passport.authenticate('discord', { scope: scopes }), function(req, res) {});

app.get('/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }), function(req, res) { res.redirect('/') } // auth success
);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/.well-known/acme-challenge/jpB-Iq2304JeNMrdnLI_VZ1TwWoV-BpV_4cJVXOVYvQ', function(req, res) {
  res.send("jpB-Iq2304JeNMrdnLI_VZ1TwWoV-BpV_4cJVXOVYvQ.4tu7T9hHt8LiTUJIZbBCUVGUFwahEjJOfmjbijpDl98");
});

app.post('/submit', function(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let formData = qs.parse(body);
      if (formData.formType == 'pit') {
        let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {
          if (err) {
            console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' + err.message);
            res.end('pit form error! ' + err.message);
          }
      });
      let stmt = `INSERT INTO pit (event, name, team, drivetype, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, driveTeam, attended, confidence, bqual, overall, discordID, discordName, discordTag, discordAvatarId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      let values = [formData.event, formData.name, formData.team, formData.drivetype, formData.game1, formData.game2, formData.game3, formData.game4, formData.game5, formData.game6, formData.game7, formData.game8, formData.game9, formData.game10, formData.game11, formData.game12, formData.game13, formData.game14, formData.game15, formData.game16, formData.game17, formData.game18, formData.game19, formData.game20, formData.driveTeam, formData.attended, formData.confidence, formData.bqual, formData.overall, req.user.id, req.user.username, req.user.discriminator, req.user.avatar];
      db.run(stmt, values, function(err) {
          if (err) {
            console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' + err.message);
            res.end('pit form error! ' + err.message);
          }
          sendSubmission.newSubmission("pit", this.lastID, req.user.username, formData.name);
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
            sendSubmission.newSubmission("main", this.lastID, req.user.username, formData.name);
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

app.get('/', checkAuth, function(req, res) {
  res.sendFile('./src/index.html', { root: __dirname })
});

app.get('/main', checkAuth, function(req, res) {
  res.render('../src/main.ejs', { 
    root: __dirname,
    discordID: req.user.id,
    discordName: req.user.username,
    discordTag: req.user.discriminator,
    discordAvatarId: req.user.avatar
  })
});

app.get('/pit', checkAuth, function(req, res) {
  res.render('../src/pit.ejs', { 
    root: __dirname,
    discordID: req.user.id,
    discordName: req.user.username,
    discordTag: req.user.discriminator,
    discordAvatarId: req.user.avatar
  })
});

app.get('/2023_float.css', function(req, res) {
  res.sendFile('./src/2023_float.min.css', { root: __dirname })
});

app.get('/fonts/Raleway-300.ttf', function(req, res) {
  res.sendFile('./src/fonts/Raleway-300.ttf', { root: __dirname })
});

app.get('/fonts/Raleway-500.ttf', function(req, res) {
  res.sendFile('./src/fonts/Raleway-500.ttf', { root: __dirname })
});

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

app.get('/info', checkAuth, function(req, res) {
  console.log(req.user.id)
  console.log(req.user.username)
  console.log(req.user.avatar)
  console.log(req.user.discriminator)
  console.log(inTeamServer(req.user.guilds))
  res.json(req.user);
  //res.redirect('/')
});

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

app.get('/', passport.authenticate('discord'));
app.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/')
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated() && inTeamServer(req.user.guilds)) return next();
  if (req.isAuthenticated() && !inTeamServer(req.user.guilds)) return res.redirect('/denied')
  res.redirect('/login');
}

app.listen(80);
//server created and ready for a request
console.log('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' + '\x1b[32m', '[INFO] ' ,'\x1b[0m' + "Ready!");

//TODO: add a stats page that has info about each scout
//# of submitted forms, # of expected forms
//schedule of matches to scout based on scout team role