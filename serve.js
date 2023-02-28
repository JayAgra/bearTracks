//CONFIG
const { frcapi, myteam, season, scoutteama, scoutteamb, leadscout, drive, pit, clientId, clientSec, redirectURI, teamServerID } = require('./config.json');

//SETUP OAUTH
const DiscordOauth2 = require("discord-oauth2");
const getOauthData = new DiscordOauth2;
const passport = require('passport')
const Strategy = require('passport-discord').Strategy;
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
const scopes = ['identify', 'email', 'guilds', 'guilds.members.read', 'role_connections.write'];
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

//SETUP DATABASE
const sqlite3 = require('sqlite3');
let db = new sqlite3.Database('data.db', sqlite3.OPEN_READWRITE, (err) => {});
db.run( 'PRAGMA journal_mode = WAL;' );

//SETUP SERVER(S)
const fs = require('fs');
const express = require('express');
const session  = require('express-session');
const lusca = require('lusca')
const https = require('https');
const http = require('http');
const cookieParser = require("cookie-parser");
const crypto = require('crypto');
const seasonProcess = require('./src/2023.js')
var RateLimit = require('express-rate-limit');
var EventEmitter = require("events").EventEmitter;
const helmet = require('helmet')
var sanitize = require("sanitize-filename");
var app = express();
app.disable('x-powered-by');
app.use(cookieParser());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'"],
  },
}));
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
app.use(session({
  secret: crypto.randomBytes(48).toString('hex'),
  resave: false,
  saveUninitialized: false,
  maxAge: 24 * 60 * 60 * 1000 * 183, // 183 days
  cookie : {
    sameSite: 'lax',
    secure: 'true'
  }
}));
var limiter = RateLimit({
  windowMs: 10*60*1000, // 10 minutes
  max: 1000,
  standardHeaders: true,
	legacyHeaders: false
});
app.use(lusca({
  csrf: true,
  xframe: 'SAMEORIGIN',
  hsts: {maxAge: 31536000, includeSubDomains: true, preload: true},
  xssProtection: true,
  nosniff: true,
  referrerPolicy: 'same-origin'
}));
app.use(limiter);
app.use(passport.initialize());
app.use(passport.session());

//SETUP IMAGE UPLOADING
const qs = require('querystring');
const multer  = require('multer');
const { exec } = require('child_process');
const mulstorage = multer.diskStorage(
  {
      destination: './images/',
      filename: function (req, file, cb ) {
          cb(crypto.randomBytes(12).toString('hex') + sanitize(file.originalname) + (file.mimetype).substring(6));
      }
  }
);
const upload = multer( { storage: mulstorage } );

//BASIC FUNCTIONS TO SHORTEN CODE
function valueToEmote(value) {
  if ( value == null || value == "false" ) { return "❌"; } else { return "✅"; }
}

function invalidJSON(str) {
  try { JSON.parse(str); return false } catch (error) { return true }
}

function logInfo(info) {
  console.log('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' + '\x1b[32m', '[INFO] ' ,'\x1b[0m' + info)
}

function logErrors(errortodisplay) {
  console.log('\x1b[35m', '[FORM PROCESSING] ' ,'\x1b[0m' +'\x1b[31m', '[ERROR] ' ,'\x1b[0m' +  errortodisplay);
}

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

function findTopRole(roles) {
  var rolesOut = [];
  if (roles.indexOf(leadscout) >= 0) {
    rolesOut.push(["Lead Scout", "rgb(233, 30, 99)", "rgba(233, 30, 99, 0.1)"]);
  }
  if (roles.indexOf(drive) >= 0) {
    rolesOut.push(["Drive Team", "rgb(241, 196, 15)", "rgba(241, 196, 15, 0.1)"]);
  } 
  if (roles.indexOf(pit) >= 0) {
    rolesOut.push(["Pit Team", "rgb(230, 126, 34)", "rgba(230, 126, 34, 0.1)"]);
  } 
  if (roles.indexOf(scoutteama) >= 0) {
    rolesOut.push(["Scout Team A", "rgb(26, 188, 156)", "rgba(26, 188, 156, 0.1)"]);
  } 
  if (roles.indexOf(scoutteamb) >= 0) {
    rolesOut.push(["Scout Team B", "rgb(52, 152, 219)", "rgba(52, 152, 219, 0.1)"]);
  }
  return rolesOut;
}

//check the authentication and server membership
function checkAuth(req, res, next) {
  if (req.isAuthenticated() && inTeamServer(req.user.guilds)) return addToDataBase(req, next);
  if (req.isAuthenticated() && !inTeamServer(req.user.guilds)) return res.redirect('/denied')
  res.redirect('/login');
}

//add scouts to database
function addToDataBase(req, next) {
  const password = crypto.randomBytes(12).toString('hex')
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
  return next();
}

//before server creation
logInfo("Preparing...");

//EXPRESSJS APP RESPONSES
app.get('/login', function(req, res) {
  res.sendFile('src/login.html', {root: __dirname})
});

//send users to discord to login when the /loginDiscord url is visited
app.get('/loginDiscord', passport.authenticate('discord', { scope: scopes }), function(req, res) {});

//get the auth code from discord (the code parameter) and use it to get a token
app.get('/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }), function(req, res) { res.redirect('/') } // auth success
);

app.get('/clearCookies', function(req, res) {
  res.clearCookie('role');
  res.clearCookie('connect.sid');
  res.redirect('/');
});

app.get('/settings', checkAuth, async function(req, res) {
  res.sendFile('src/settings.html', {root: __dirname})
});

//destroy session
app.get('/logout', function(req, res) {
  if (req.session) {req.session.destroy(); res.redirect('/');} else {res.send("error!")}
});

//use for lets encrypt verification
app.get('/.well-known/acme-challenge/', function(req, res) {
  res.send("");
});

//get the main form submissions
app.post('/submit', checkAuth, function(req, res) {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let formData = qs.parse(body);
      if (formData.formType == 'pit') {
        res.end("WRONG FORM")
      } else if (formData.formType == 'main') {
        let stmt = `INSERT INTO main (event, season, name, team, match, level, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, game21, game22, game23, game24, game25, teleop, defend, driving, overall, discordID, discordName, discordTag, discordAvatarId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let values = [formData.event, '2023', formData.name, formData.team, formData.match, formData.level, formData.game1, formData.game2, formData.game3, formData.game4, formData.game5, formData.game6, formData.game7, formData.game8, formData.game9, formData.game10, formData.game11, formData.game12, formData.game13, formData.game14, formData.game15, formData.game16, formData.game17, formData.game18, formData.game19, formData.game20, formData.game21, formData.game22, formData.game23, formData.game24, formData.game25, formData.teleop, formData.defend, formData.driving, formData.overall, req.user.id, req.user.username, req.user.discriminator, req.user.avatar];
        db.run(stmt, values, function(err) {
            if (err) {
              logErrors(err.message);
              res.end(err.message);
            }
            discordSendData.newSubmission("main", this.lastID, req.user.username, formData.name);
        });
        res.sendFile('src/submitted.html', { 
          root: __dirname
        })
      } else {
        return res.status(500).send(
          "unknown form type"
        );
      }
    });
});

//use this thing to do the pit form image thing
const imageUploads = upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }, { name: 'image5', maxCount: 1 }])
app.post('/submitPit', checkAuth, imageUploads, function(req, res) {
  let formData = req.body
  let stmt = `INSERT INTO pit (event, season, name, team, drivetype, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, driveTeam, attended, confidence, bqual, overall, discordID, discordName, discordTag, discordAvatarId, image1, image2, image3, image4, image5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  let values = [formData.event, '2023', formData.name, formData.team, formData.drivetype, formData.game1, formData.game2, formData.game3, formData.game4, formData.game5, formData.game6, formData.game7, formData.game8, formData.game9, formData.game10, formData.game11, formData.game12, formData.game13, formData.game14, formData.game15, formData.game16, formData.game17, formData.game18, formData.game19, formData.game20, formData.driveTeam, formData.attended, formData.confidence, formData.bqual, formData.overall, req.user.id, req.user.username, req.user.discriminator, req.user.avatar, req.files.image1[0].filename, req.files.image2[0].filename, req.files.image3[0].filename, req.files.image4[0].filename, req.files.image5[0].filename];
  db.run(stmt, values, function(err) {
    if (err) {
      logErrors(err.message);
      res.end('pit form error! ' + err.message);
    }
    discordSendData.newSubmission("pit", this.lastID, req.user.username, formData.name);
  });
  res.sendFile('src/submitted.html', { 
    root: __dirname
  })
});

//index.html, read the code
app.get('/', checkAuth, async function(req, res) {
  if (!req.cookies.role) {
    //set cookie if not exists
    //I am setting a cookie because it takes a while to wait for role data from API
    var oauthDataCookieSet =  await Promise.resolve(getOauthData.getGuildMember(req.user.accessToken, teamServerID).then( data => {return findTopRole(data.roles)}));
    //btoa and atob bad idea
    //Buffer.from(str, 'base64') and buf.toString('base64') instead
    res.cookie("role", JSON.stringify(oauthDataCookieSet), {expire: 7200000 + Date.now(), sameSite: 'Lax', secure: true, httpOnly: true }); 
    var rolesHTML = "";
    for (let i = 0; i < oauthDataCookieSet.length; i++) {
      if (i===0) {rolesHTML += `<span style="color: ${oauthDataCookieSet[i][1]}; background-color: ${oauthDataCookieSet[i][2]}; border-radius: 4px; padding: 5px;" class="roleThing">${oauthDataCookieSet[i][0]}</span><br class="roleThing"><br class="roleThing">`} else {
      rolesHTML += `<span style="color: ${oauthDataCookieSet[i][1]}; background-color: ${oauthDataCookieSet[i][2]}; border-radius: 4px; padding: 5px;" class="roleThing">${oauthDataCookieSet[i][0]}</span><br class="roleThing">`
      }
    }
    if (oauthDataCookieSet[0][0] == "Pit Team" || oauthDataCookieSet[0][0] == "Drive Team") {
      res.render('../src/index.ejs', { 
        root: __dirname, userName: req.user.username, rolesBody: rolesHTML, order1: "2", order2: "0", order3: "1", order4: "3", additionalURLs: "<span></span>"
      })
    } else if (oauthDataCookieSet[0][0] == "Lead Scout") {
      res.render('../src/index.ejs', { 
        root: __dirname, userName: req.user.username, rolesBody: rolesHTML, order1: "0", order2: "3", order3: "2", order4: "1", additionalURLs: `<a href="delete" class="gameflair1" style="order: <%- order4 %>; margin-bottom: 5%;">Delete Submissions<br></a>`
      })
    } else {
      res.render('../src/index.ejs', { 
        root: __dirname, userName: req.user.username, rolesBody: rolesHTML, order1: "0", order2: "3", order3: "2", order4: "1", additionalURLs: "<span></span>"
      })
    }
  } else {
  var oauthData =  JSON.parse(req.cookies.role);
  var rolesHTMLfromCookie = "";
  for (let i = 0; i < oauthData.length; i++) {
    if (i===0) {rolesHTMLfromCookie += `<span style="color: ${oauthData[i][1]}; background-color: ${oauthData[i][2]}; border-radius: 4px; padding: 5px;" class="roleThing">${oauthData[i][0]}</span><br class="roleThing"><br class="roleThing">`} else {
    rolesHTMLfromCookie += `<span style="color: ${oauthData[i][1]}; background-color: ${oauthData[i][2]}; border-radius: 4px; padding: 5px;" class="roleThing">${oauthData[i][0]}</span><br class="roleThing">`
    }
  }
  if (oauthData[0][0] == "Pit Team" || oauthData[0][0] == "Drive Team") {
    res.render('../src/index.ejs', { 
      root: __dirname, userName: req.user.username, rolesBody: rolesHTMLfromCookie, order1: "2", order2: "0", order3: "1", order4: "3", additionalURLs: "<span></span>"
    })
  } else if (oauthData[0][0] == "Lead Scout") {
    res.render('../src/index.ejs', { 
      root: __dirname, userName: req.user.username, rolesBody: rolesHTMLfromCookie, order1: "0", order2: "3", order3: "2", order4: "1", additionalURLs: `<a href="delete" class="gameflair1" style="order: 4; margin-bottom: 5%;">Delete Submissions<br></a>`
    })
  } else {
    res.render('../src/index.ejs', { 
      root: __dirname, userName: req.user.username, rolesBody: rolesHTMLfromCookie, order1: "0", order2: "3", order3: "2", order4: "1", additionalURLs: "<span></span>"
    })
  }
  }
});

//main scouting form
app.get('/main', checkAuth, function(req, res) {
  res.sendFile('src/main.html', { 
    root: __dirname
  })
});

//pit form
app.get('/pit', checkAuth, function(req, res) {
  res.sendFile('src/pit.html', { 
    root: __dirname
  })
});

//webmanifest for PWAs
//serve resources
app.get('/app.webmanifest', function(req, res) {
  res.sendFile('./src/app.webmanifest', { root: __dirname })
});

//serve resources
app.get('/2023_float.css', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('./src/2023_float.css', { root: __dirname });
});

//serve resources
app.get('/2023_float.min.css', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('./src/2023_float.min.css', { root: __dirname });
});

//serve resources
app.get('/fonts/Raleway-300.ttf', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('./src/fonts/Raleway-300.ttf', { root: __dirname });
});

//serve resources
app.get('/fonts/Raleway-500.ttf', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('./src/fonts/Raleway-500.ttf', { root: __dirname });
});

//serve resources
app.get('/form.js', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('./src/form.js', { root: __dirname });
});

//serve resources
app.get('/form.min.js', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('./src/form.min.js', { root: __dirname });
});

//service worker for PWA installs
//serve resources
app.get('/sw.js', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('src/sw.js', { root: __dirname });
});

//serve resources
app.get('/appinstall.js', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('src/appinstall.js', { root: __dirname });
});

//serve resources
app.get('/favicon.ico', function(req, res) {
  res.set('Cache-control', 'public, max-age=259200');
  res.sendFile('src/favicon.ico', { root: __dirname });
});

//allow people to get denied :)
app.get('/denied', function(req, res) {
  try {
  res.sendFile('src/denied.html', { root: __dirname })
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
});

app.get('/teamRoleInfo', checkAuth, function(req, res) {  
  getOauthData.getGuildMember(req.user.accessToken, teamServerID).then( data => {
    console.log(data.roles)
  }).catch(error);
});

//tool to browse match scouting data
app.get('/browse', checkAuth, function(req, res) {
  if (req.query.team && req.query.event && req.query.page) {
    const stmt = `SELECT * FROM main WHERE team=? AND event=? ORDER BY id ASC LIMIT 1 OFFSET ?`;
    const values = [req.query.team, req.query.event, req.query.page];
    db.get(stmt, values, (err, dbQueryResult) => {
      if (err) {
        res.render('../src/browse.ejs', { root: __dirname, errorDisplay: "block", errorMessage: 'Error: No results!', displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsMatchNumber: 0, resultsEventCode: 0, resultsBody: 0 })
        return;
      } else {
        if (typeof dbQueryResult == "undefined") {
          res.render('../src/browse.ejs', { root: __dirname, errorDisplay: "block", errorMessage: 'Error: No results!', displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsMatchNumber: 0, resultsEventCode: 0, resultsBody: 0 })
          return;
        } else {
          res.render('../src/browse.ejs', { 
            root: __dirname, errorDisplay: "none", errorMessage: null, displaySearch: "none", displayResults: "flex",
            resultsTeamNumber: `${dbQueryResult.team}`,
            resultsMatchNumber: `${dbQueryResult.match}`,
            resultsEventCode: `${dbQueryResult.event}`,
            resultsBody: seasonProcess.createHTMLExport(dbQueryResult)
          })
          return;
        }
      }
    });
  } else {
  res.render('../src/browse.ejs', { root: __dirname, errorDisplay: "none", errorMessage: null, displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsMatchNumber: 0, resultsEventCode: 0, resultsBody: 0 })
  return;
  }
});

//tool to manage match scouting data
//yes, this is almost the exact same as the browse tool
app.get('/delete', checkAuth, function(req, res) {
if (req.cookies.role && JSON.parse(req.cookies.role)[0][0] == "Lead Scout") {
  if (req.query.submissionID) {
    const stmt = `SELECT * FROM main WHERE id=? ORDER BY id ASC LIMIT 1`;
    const values = [req.query.submissionID];
    db.get(stmt, values, (err, dbQueryResult) => {
    if (err) {
      res.render('../src/delete.ejs', { root: __dirname, displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsMatchNumber: 0, resultsEventCode: 0, resultsBody: 0 })
    } else {
    if (typeof dbQueryResult == "undefined") {
      res.render('../src/delete.ejs', { root: __dirname, displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsMatchNumber: 0, resultsEventCode: 0, resultsBody: 0 })
    } else {
      res.render('../src/delete.ejs', { 
        root: __dirname, displaySearch: "none", displayResults: "flex",
        resultsTeamNumber: `${dbQueryResult.team}`,
        resultsMatchNumber: `${dbQueryResult.match}`,
        resultsEventCode: `${dbQueryResult.event}`,
        resultsBody: `AUTO: <br>Taxi: ${valueToEmote(dbQueryResult.game1)}<br>Score B/M/T: ${valueToEmote(dbQueryResult.game2)}${valueToEmote(dbQueryResult.game3)}${valueToEmote(dbQueryResult.game4)}<br>Charging: ${dbQueryResult.game5} pts<br><br>TELEOP: <br>Score B/M/T: ${valueToEmote(dbQueryResult.game6)}${valueToEmote(dbQueryResult.game7)}${valueToEmote(dbQueryResult.game8)}<br>Charging: ${dbQueryResult.game10} pts<br><br>Other: <br>Alliance COOPERTITION: ${valueToEmote(dbQueryResult.game9)}<br>Cycle Time: ${dbQueryResult.game11} seconds<br>Defense: ${dbQueryResult.defend}<br>Driving: ${dbQueryResult.driving}<br>Overall: ${dbQueryResult.overall}`
      })
    }
    }
    });
  } else {
  res.render('../src/delete.ejs', {  root: __dirname, displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsMatchNumber: 0, resultsEventCode: 0, resultsBody: 0 })
  }
} else {
  res.sendFile('src/denied.html', { 
    root: __dirname
  })
}
});

app.get('/deleteSubmission', checkAuth, async function(req, res) {
  if (req.cookies.role && JSON.parse(req.cookies.role)[0][0] == "Lead Scout") {
    const roles = await Promise.resolve(getOauthData.getGuildMember(req.user.accessToken, teamServerID).then( data => {return findTopRole(data.roles)}))
    if (roles[0][0] == "Lead Scout") {
      if (req.query.submissionID) {
        const stmt = `DELETE FROM main WHERE id=?`;
        const values = [req.query.submissionID];
        db.run(stmt, values, (err) => {if(err){console.log(err)}});
        res.redirect('/manage');
      } else {
        res.sendFile('src/denied.html', { 
          root: __dirname
        })
      }
    } else {
      res.sendFile('src/denied.html', { 
        root: __dirname
      })
    }
  } else {
    res.sendFile('src/denied.html', { 
      root: __dirname
    })
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
            root: __dirname, displaySelect: 'none', displayResults: 'flex', matchesBody: matchesContent
          })
          return;
        }
    });
  } else {
  res.render('../src/matches.ejs', { 
    root: __dirname, displaySelect: 'flex', displayResults: 'none', matchesBody: null
  })
  return;
  }
});

//serve the uploaded images
app.get('/pitimages', checkAuth, function(req, res) {
  if (req.query.team && req.query.event) {
    const stmt = `SELECT * FROM pit WHERE team=? AND event=? ORDER BY id LIMIT 1`;
    const values = [req.query.team, req.query.event];
    db.get(stmt, values, (err, dbQueryResult) => {
      if (err) {
        res.render('../src/pitimg.ejs', { 
          root: __dirname, errorDisplay: "block", errorMessage: 'Error: No results!', displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsEventCode: 0, resultsBody: 0
        })
        return;
      } else {
        if (typeof dbQueryResult == "undefined") {
          res.render('../src/pitimg.ejs', { 
            root: __dirname, errorDisplay: "block", errorMessage: 'Error: No results!', displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsEventCode: 0, resultsBody: 0
          })
          return;
        } else {
          res.render('../src/pitimg.ejs', { 
            root: __dirname, errorDisplay: "none", errorMessage: null, displaySearch: "none", displayResults: "flex", 
            resultsTeamNumber: `${dbQueryResult.team}`, 
            resultsEventCode: `${dbQueryResult.event}`, 
            resultsBody: `<img src="images/${dbQueryResult.image1}"/><br><img src="images/${dbQueryResult.image2}"/><br><img src="images/${dbQueryResult.image3}"/><br><img src="images/${dbQueryResult.image4}"/><br><img src="images/${dbQueryResult.image5}"/>`
          })
          return;
        }
      }
    });
  } else {
  res.render('../src/pitimg.ejs', { 
    root: __dirname, errorDisplay: "none", errorMessage: null, displaySearch: "flex", displayResults: "none", resultsTeamNumber: 0, resultsEventCode: 0, resultsBody: 0
  })
  return;
  }
});

//api
app.get('/api/matches/:season/:event/:level', checkAuth, function(req, res) {
  var dbody = new EventEmitter();
  var options = {
      'method': 'GET',
      'hostname': 'frc-api.firstinspires.org',
      'path': `/v3.0/${req.params.season}/schedule/${req.params.event}?tournamentLevel=${req.params.level}&teamNumber=${req.query.team}`,
      'headers': {
          'Authorization': 'Basic ' + frcapi
      },
      'maxRedirects': 20
  };

  var request = https.request(options, function(response) {
      var chunks = [];

      response.on("data", function(chunk) {
          chunks.push(chunk);
      });

      response.on("end", function(chunk) {
          var body = Buffer.concat(chunks);
          data = body;
          dbody.emit('update');
      });

      response.on("error", function(error) {
          console.error(error);
      });
  });
  request.end();
  dbody.on('update', function() {
      if (invalidJSON(data)) {res.end('{ "ERROR": "ERROR" }')} else {res.json(JSON.parse(data));}
  });
});

app.get('/api/data/:season/:event/:team', checkAuth, function(req, res) {
  const stmt = `SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id LIMIT 1`;
  const values = [req.params.team, req.params.event, req.params.season];
  db.get(stmt, values, (err, dbQueryResult) => {
    res.json(JSON.parse(dbQueryResult));
  });
});

app.get('/api/pit/:season/:event/:team', checkAuth, function(req, res) {
  const stmt = `SELECT * FROM pit WHERE team=? AND event=? AND season=? ORDER BY id LIMIT 1`;
  const values = [req.params.team, req.params.event, req.params.season];
  db.get(stmt, values, (err, dbQueryResult) => {
    res.json(JSON.parse(dbQueryResult));
  });
});

//auth functions
app.get('/', passport.authenticate('discord'));

app.get('/callback', passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) {
    res.redirect('/');
});

//not requiring auth for offline version, you cannot submit with this and submit url is secured anyway
app.get('/offline.html', function(req, res) {
  res.sendFile('src/offline.html', { root: __dirname })
});

if (fs.statSync("ssl/certificate.crt").size <= 100 || fs.statSync("ssl/privatekey.pem").size <= 100) {app.listen(80)} else {const httpRedirect = express(); httpRedirect.all('*', (req, res) => res.redirect(`https://${req.hostname}${req.url}`)); const httpServer = http.createServer(httpRedirect); httpServer.listen(80, () => logInfo(`HTTP server listening: http://localhost`));}

//server created and ready for a request
logInfo("Ready!");