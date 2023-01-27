const qs = require('querystring');
const sqlite3 = require('sqlite3');
const express = require('express')
const session  = require('express-session')
const app = express();
const ejs = require('ejs');

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

const sendSubmission = require("./discord.js")  

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
          sendSubmission.newSubmission("pit", this.lastID, req.socket.remoteAddress.replace(/^.*:/, ''), formData.name);
      });
      db.close((err) => {
          if (err) {
            console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' + err.message);
            res.end('pit form error! ' + err.message);
          }
      });
      res.sendFile('./src/submitted.min.html', { root: __dirname })
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
            sendSubmission.newSubmission("main", this.lastID, req.socket.remoteAddress.replace(/^.*:/, ''), formData.name);
        });
        db.close((err) => {
            if (err) {
              console.error('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' +  err.message);
              res.end('pit form error! ' + err.message);
            }
        });
        res.sendFile('./src/submitted.min.html', { root: __dirname })
      } else {
        console.log(formData);
        return res.status(500).send(
          "unknown form type"
        );
      }
    });
});

app.get('/', checkAuth, function(req, res) {
  res.sendFile('./src/index.min.html', { root: __dirname })
});

app.get('/main', checkAuth, function(req, res) {
  res.sendFile('./src/main.min.html', { root: __dirname })
});

app.get('/pit', checkAuth, function(req, res) {
  res.sendFile('./src/pit.min.html', { root: __dirname })
});

app.get('/2023_float.css', checkAuth, function(req, res) {
  res.sendFile('./src/2023_float.min.css', { root: __dirname })
});

app.get('/fonts/Raleway-300.ttf', checkAuth, function(req, res) {
  res.sendFile('./src/fonts/Raleway-300.ttf', { root: __dirname })
});

app.get('/fonts/Raleway-500.ttf', checkAuth, function(req, res) {
  res.sendFile('./src/fonts/Raleway-500.ttf', { root: __dirname })
});

app.get('/denied', function(req, res) {
  res.sendFile('./src/denied.min.html', { root: __dirname })
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

app.get('/', passport.authenticate('discord'));
app.get('/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), function(req, res) {
    res.redirect('/')
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated() && inTeamServer(req.user.guilds)) return next();
  if (req.isAuthenticated() && !inTeamServer(req.user.guilds)) return req.redirect('/denied')
  res.redirect('/login');
}

app.listen(80);
//server created and ready for a request
console.log('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' + '\x1b[32m', '[INFO] ' ,'\x1b[0m' + "Ready!");