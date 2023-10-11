// CONFIG
/*jslint node: true*/
/*jslint es6*/

"use strict";
const {
    frcapi,
    myteam,
    season,
    clientId,
    clientSec,
    redirectURI,
    teamServerID,
    baseURLNoPcl,
    anotherServerID,
    currentComp,
    serverSecret
} = require("./config.json");

// SETUP DATABASE
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("data.db", sqlite3.OPEN_READWRITE, (err) => {
    console.log(err);
});
db.run("PRAGMA journal_mode = WAL;");

// SETUP SERVER(S)
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const lusca = require("lusca");
const https = require("https");
const http = require("http");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const RateLimit = require("express-rate-limit");
const EventEmitter = require("events").EventEmitter;
const helmet = require("helmet");
const sanitize = require("sanitize-filename");
const leadToken = crypto.randomBytes(48).toString("hex");
const casinoToken = crypto.randomBytes(48).toString("hex");
const app = express();
app.disable("x-powered-by");
app.use(cookieParser());
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

const options = {
    key: fs.readFileSync(
        `/etc/letsencrypt/live/${baseURLNoPcl}/privkey.pem`,
        "utf8"
    ),
    cert: fs.readFileSync(
        `/etc/letsencrypt/live/${baseURLNoPcl}/cert.pem`,
        "utf8"
    ),
};

const certsizes = {
  key: fs.statSync(`/etc/letsencrypt/live/${baseURLNoPcl}/privkey.pem`, "utf8"),
  cert: fs.statSync(`/etc/letsencrypt/live/${baseURLNoPcl}/cert.pem`, "utf8"),
};

// checks file size of ssl, if it exists (is filled), use HTTPS on port 443
var server;
if (!(certsizes.key <= 100) && !(certsizes.cert <= 100)) {
    server = https.createServer(options, app).listen(443);
}
const ejs = require("ejs");
app.set("view engine", "html");
app.engine("html", ejs.renderFile);
app.use("/js", express.static("src/js"));
app.use("/css", express.static("src/css"));
app.use("/images", express.static("images"));
app.use("/public", express.static("src/public"));
// all cards by Lydia Honerkamp (https://github.com/1yd1a)
app.use("/assets", express.static("src/assets", 
    {
        setHeaders: (res, path) => {
            res.set("X-Artist", "Lydia Honerkamp");
        },
    })
);
app.use(
    session({
        secret: serverSecret,
        resave: false,
        saveUninitialized: true,
        maxAge: 31556952000, // 365 days
        cookie: {
            secure: "true",
        },
    })
);
var limiter = RateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        return req.connection.remoteAddress;
    },
});
app.use(
    lusca({
        csrf: false,
        xframe: "SAMEORIGIN",
        hsts: { maxAge: 31556952000, includeSubDomains: true, preload: true },
        xssProtection: true,
        nosniff: true,
        referrerPolicy: "same-origin",
    })
);
app.use(limiter);

// SETUP OAUTH
const passport = require("passport");
const Strategy = require("passport-discord").Strategy;
passport.serializeUser((user, done) => {
    "use strict";
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    "use strict";
    done(null, obj);
});
const scopes = [
    "identify",
    "email",
    "guilds",
    "guilds.members.read",
    "role_connections.write",
];
passport.use(
    new Strategy(
        {
            clientID: clientId,
            clientSecret: clientSec,
            callbackURL: redirectURI,
            scope: scopes,
        },
        function (accessToken, refreshToken, profile, done) {
            "use strict";
            process.nextTick(() => {
                return done(null, profile);
            });
        }
    )
);
app.use(passport.initialize());
app.use(passport.session());

// SETUP IMAGE UPLOADING
const qs = require("querystring");
const multer = require("multer");
const mulstorage = multer.diskStorage({
    destination: "./images/",
    filename: (req, file, cb) => {
        cb(
            null,
            crypto.randomBytes(12).toString("hex") + sanitize(file.originalname)
        );
    },
});
const upload = multer({ storage: mulstorage });

// BASIC FUNCTIONS TO SHORTEN CODE
function invalidJSON(str) {
    try {
        JSON.parse(str);
        return false;
    } catch (error) {
        return true;
    }
}

// check the JSON file to see if the user is in the team discord server
function inTeamServer(json) {
    var isInTheServer = false;
    for (var index = 0; index < json.length; ++index) {
        var server = json[index];
        if (server.id == teamServerID || server.id == anotherServerID) {
            isInTheServer = true;
            break;
        }
    }
    return isInTheServer;
}

// check the authentication and server membership
function checkAuth(req, res, next) {
    if (req.isAuthenticated() && inTeamServer(req.user.guilds)) {
        return addToDataBase(req, next);
    }
    if (req.isAuthenticated() && !inTeamServer(req.user.guilds)) {
        return res.redirect("/denied");
    }
    res.redirect("/login");
}

// check the authentication and server membership
function apiCheckAuth(req, res, next) {
    if (req.isAuthenticated() && inTeamServer(req.user.guilds)) {
        return next();
    }
    if (req.isAuthenticated() && !inTeamServer(req.user.guilds)) {
        return res.status(403).send("" + 0x1932);
    }
    res.status(401).send("" + 0x1911);
}

async function checkGamble(req, res, next) {
    let pointStmt = `SELECT score FROM scouts WHERE discordID=?`;
    let pointValues = [req.user.id];
    db.get(pointStmt, pointValues, (err, result) => {
        if (Number(result.score) > -2000) {
            return next();
        } else {
            return res.status(403).send("" + 0x1933);
        }
    });
}

// add scouts to database
async function addToDataBase(req, next) {
    // creating a password for, uh, something i guess
    const password = crypto.randomBytes(12).toString("hex");
    // update email, avatar, username, discrim, and times
    db.run(`UPDATE scouts SET email="${req.user.email}", discordProfile="${req.user.avatar}", username="${req.user.username}", discriminator=${req.user.discriminator}, addedAt="${req.user.fetchedAt}" WHERE discordID=${req.user.id}`);
    // add to db if not in already
    db.run(`INSERT OR IGNORE INTO scouts(discordID, score, email, password, discordProfile, username, discriminator, addedAt, badges) VALUES(${req.user.id}, 1, "${req.user.email}", "${password}", "${req.user.avatar}", "${req.user.username}", ${req.user.discriminator}, "${req.user.fetchedAt}", 0000000000)`);
    return next();
}

// forwards FRC API data for some API endpoints
// insert first forward 2022 pun
async function forwardFRCAPIdata(url, req, res) {
    var dbody = new EventEmitter();
    var options = {
        method: "GET",
        hostname: "frc-api.firstinspires.org",
        path: url,
        headers: {
            Authorization: "Basic " + frcapi,
        },
        maxRedirects: 20,
    };

    var request = https.request(options, (response) => {
        var chunks = [];

        response.on("data", (chunk) => {
            chunks.push(chunk);
        });

        response.on("end", (chunk) => {
            var body = Buffer.concat(chunks);
            dbody.emit("update", body);
        });

        response.on("error", (error) => {
            console.error(error);
        });
    });
    request.end();

    dbody.on("update", (body) => {
        if (invalidJSON(body)) {
            res.status(500).send("" + 0x1f61);
        } else {
            res.status(200).json(JSON.parse(body));
        }
    });
}

// before server creation
console.log("Preparing...");

// dont want etag on everything
app.disable("etag");

// login url
app.get("/login", (req, res) => {
    res.sendFile("src/login.html", { root: __dirname });
});

// send users to discord to login when the /loginDiscord url is visited
app.get("/loginDiscord", passport.authenticate("discord", { scope: scopes }), (req, res) => {});

// get the auth code from discord (the code parameter) and use it to get a token
app.get("/callback", passport.authenticate("discord", { failureRedirect: "/login" }), (req, res) => {
    res.redirect("/");
});

// clear cookies, used for debugging
app.get("/clearCookies", (req, res) => {
    res.clearCookie("connect.sid");
    res.clearCookie("lead");
    res.clearCookie("isLead");
    res.redirect("/");
});

// settings page
app.get("/settings", checkAuth, async (req, res) => {
    res.sendFile("src/settings.html", { root: __dirname });
});

// destroy session
app.get("/logout", (req, res) => {
    if (req.session) {
        req.session.destroy();
        res.redirect("/");
    } else {
        res.send("error!");
    }
});

// use for lets encrypt verification
// no longer needed, use certbot from scouting.sh instead
/*app.get("/.well-known/acme-challenge/", (req, res) => {
    res.send("");
});*/

// get the main form submissions
app.post("/submit", checkAuth, async (req, res) => {
    require("./routes/submit.js").submitForm(req, res, db, __dirname, season);
});

// use this thing to do the pit form image thing
const imageUploads = upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
]);

app.post("/submitPit", checkAuth, imageUploads, async (req, res) => {
    require("./routes/submitPit.js").submitPit(req, res, db, __dirname, season);
});

// index.html, read the code
app.get("/", checkAuth, async (req, res) => {
    require("./routes/index.js").index(req, res, __dirname, leadToken);
});

// main scouting form
app.get("/main", checkAuth, (req, res) => {
    res.sendFile("src/main.html", { root: __dirname });
    res.set("Cache-control", "public, max-age=7776000");
});

// pit form
app.get("/pit", checkAuth, (req, res) => {
    res.sendFile("src/pit.html", { root: __dirname });
    res.set("Cache-control", "public, max-age=7776000");
});

// webmanifest for PWAs
app.get("/app.webmanifest", (req, res) => {
    res.sendFile("./src/app.webmanifest", { root: __dirname });
    res.set("Cache-control", "public, max-age=7776000");
});

// CSS (should be unused in favor of minified css)
app.get("/float.css", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/float.css", { root: __dirname });
});

// minified css
app.get("/float.min.css", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/float.min.css", { root: __dirname });
});

// font file
app.get("/fonts/Raleway-300.ttf", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/css/Raleway-300.ttf", { root: __dirname });
});

// font file
app.get("/fonts/Raleway-500.ttf", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/css/Raleway-500.ttf", { root: __dirname });
});

// JS for form (should be unused in favor of minified js)
app.get("/form.js", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/form.js", { root: __dirname });
});

// minified JS for form         
app.get("/form.min.js", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/js/form.min.js", { root: __dirname });
});

// favicon
app.get("/favicon.ico", (req, res) => { 
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/favicon.ico", { root: __dirname });
});

// scout rank page
app.get("/scouts", (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/scouts.html", { root: __dirname });
});

// play blackjack
app.get("/blackjack", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/blackjack.html", { root: __dirname });
});

// spin wheel
app.get("/spin", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/spin.html", { root: __dirname });
});

// list of gambling opportunities
app.get("/points", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("src/points.html", { root: __dirname });
});

// teams left to pit scout (data with XHR request)
app.get("/topitscout", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/topitscout.html", { root: __dirname });
});

// notes feature
app.get("/notes", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/notes.html", { root: __dirname });
});

// per-scout profile
app.get("/profile", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/profile.html", { root: __dirname });
});

// get images from pit scouting. images are located in scouting-app/images
app.get("/pitimages", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/pitimg.html", { root: __dirname });
});

// page with fake blue banners for future use
app.get("/awards", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/awards.html", { root: __dirname });
});

// plinko game
app.get("/plinko", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/plinko.html", { root: __dirname });
});

// match list
app.get("/matches", checkAuth, (req, res) => {
    res.set("Cache-control", "public, max-age=2592000");
    res.sendFile("src/matches.html", { root: __dirname });
});

// allow people to get denied :)
app.get("/denied", (req, res) => {
    require("./routes/denied.js").denied(req, res, __dirname);
});

// print out all info discord gives, for debugging
app.get("/info", checkAuth, (req, res) => {
    require("./routes/info.js").info(req, res);
});

/*// for debugging
app.get("/teamRoleInfo", checkAuth, (req, res) => {
    getOauthData.getGuildMember(req.user.accessToken, teamServerID).then((data) => {
        console.log(data.roles);
    }).catch((error) => {
        console.log(error);
    });
});*/

// tool to browse match scouting data
app.get("/detail", checkAuth, async (req, res) => {
    require("./routes/detail.js").detail(req, res, db, __dirname, season);
});

app.get("/browse", checkAuth, async (req, res) => {
    require("./routes/browse.js").browse(req, res, db, __dirname, season);
});

app.get("/teams", checkAuth, (req, res) => {
    res.sendFile("src/teams.html", { root: __dirname });
});

app.get("/manage", checkAuth, async (req, res) => {
    res.sendFile("src/manage.html", { root: __dirname });
});

app.get("/api/manage/:database/list", checkAuth, async (req, res) => {
    require("./routes/api/manage/list.js").listSubmissions(req, res, db, leadToken);
});

app.get("/api/manage/:database/:submissionId/delete", checkAuth, async (req, res) => {
    require("./routes/api/manage/delete.js").deleteSubmission(req, res, db, leadToken);
});

// api

app.get("/api/whoami", apiCheckAuth, (req, res) => {
    res.send(req.user.id);
});

app.get("/api/matches/:season/:event/:level/:all", apiCheckAuth, async (req, res) => {
    if (req.params.event !== "WOOD") {
        var teamNumParam = "";
        if (req.params.all === "all") {
            teamNumParam = "&start=&end=";
        } else {
            teamNumParam = `&teamNumber=${myteam}`;
        }
        forwardFRCAPIdata(`/v3.0/${req.params.season}/schedule/${req.params.event}?tournamentLevel=${req.params.level}${teamNumParam}`, req, res)
    } else {
        res.header("Content-Type", "application/json");
        res.sendFile("src/js/WOOD.json", { root: __dirname });
    }
});

app.get("/api/data/:season/:event/:team", apiCheckAuth, async (req, res) => {
    require("./routes/api/data.js").data(req, res, db);
});

app.get("/api/pit/:season/:event/:team", apiCheckAuth, async (req, res) => {
    require("./routes/api/pit.js").pit(req, res, db);
});

app.get("/api/teams/:season/:event/:type", apiCheckAuth, async (req, res) => {
    require("./routes/api/teams.js").teams(req, res, db, season);
});

app.get("/api/scouts", apiCheckAuth, async (req, res) => {
    require("./routes/api/scouts.js").scouts(req, res, db);
});

app.get("/api/scouts/:scout/profile", apiCheckAuth, async (req, res) => {
    require("./routes/api/scouts/profile.js").profile(req, res, db);
});

app.get("/api/scoutByID/:discordID", apiCheckAuth, async (req, res) => {
    require("./routes/api/scoutByID.js").scoutByID(req, res, db);
});

// slots API
app.get("/api/casino/slots/slotSpin", apiCheckAuth, async (req, res) => {
    require("./routes/api/casino/slots/slotSpin.js").slotSpin(req, res, db);
});
// end slots API

// blackjack API
// blackjack cards
const possibleCards = [
    { value: "A", suit: "h" }, { value: 2, suit: "h" },{ value: 3, suit: "h" },{ value: 4, suit: "h" },{ value: 5, suit: "h" },{ value: 6, suit: "h" },{ value: 7, suit: "h" },{ value: 8, suit: "h" },{ value: 9, suit: "h" },{ value: 10, suit: "h" },{ value: "J", suit: "h" },{ value: "Q", suit: "h" },{ value: "K", suit: "h" },
    { value: "A", suit: "d" }, { value: 2, suit: "d" },{ value: 3, suit: "d" },{ value: 4, suit: "d" },{ value: 5, suit: "d" },{ value: 6, suit: "d" },{ value: 7, suit: "d" },{ value: 8, suit: "d" },{ value: 9, suit: "d" },{ value: 10, suit: "d" },{ value: "J", suit: "d" },{ value: "Q", suit: "d" },{ value: "K", suit: "d" },
    { value: "A", suit: "s" }, { value: 2, suit: "s" },{ value: 3, suit: "s" },{ value: 4, suit: "s" },{ value: 5, suit: "s" },{ value: 6, suit: "s" },{ value: 7, suit: "s" },{ value: 8, suit: "s" },{ value: 9, suit: "s" },{ value: 10, suit: "s" },{ value: "J", suit: "s" },{ value: "Q", suit: "s" },{ value: "K", suit: "s" },
    { value: "A", suit: "c" }, { value: 2, suit: "c" },{ value: 3, suit: "c" },{ value: 4, suit: "c" },{ value: 5, suit: "c" },{ value: 6, suit: "c" },{ value: 7, suit: "c" },{ value: 8, suit: "c" },{ value: 9, suit: "c" },{ value: 10, suit: "c" },{ value: "J", suit: "c" },{ value: "Q", suit: "c" },{ value: "K", suit: "c" }
];

// // blackjack websocket
// app.ws('/api/casino/blackjack/blackjackSocket', function(ws, req) {
//     require("./routes/api/casino/blackjack/blackjackSocket.js").blackjackSocket(ws, req, db);
// });

app.get("/api/casino/blackjack/startingCards", apiCheckAuth, checkGamble, async (req, res) => {
    require("./routes/api/casino/blackjack/startingCards.js").startingCards(req, res, db, possibleCards, casinoToken);
});

app.get("/api/casino/blackjack/newCard", apiCheckAuth, async (req, res) => {
    require("./routes/api/casino/blackjack/newCard.js").newCard(req, res);
});

app.get("/api/casino/blackjack/stand/:casinoToken/:playerTotal/:dealerCard", apiCheckAuth, checkGamble, async (req, res) => {
    require("./routes/api/casino/blackjack/stand.js").stand(req, res, db, possibleCards, casinoToken);
});

app.get("/api/casino/blackjack/:cval/:casinoToken/wonViaBlackjack", apiCheckAuth, checkGamble, async (req, res) => {
    require("./routes/api/casino/blackjack/wonViaBlackjack.js").wonViaBlackjack(req, res, db, casinoToken);
});
// end blackjack API

app.get("/api/casino/spinner/spinWheel", apiCheckAuth, checkGamble, async (req, res) => {
    require("./routes/api/casino/spinner/spinWheel.js").spinWheel(req, res, db);
});

// plinko API
app.get("/api/casino/plinko/startGame", apiCheckAuth, checkGamble, async (req, res) => {
    require("./routes/api/casino/plinko/startGame.js").startGame(req, res, db, casinoToken);
});

app.get("/api/casino/plinko/endGame/:token/:pts", apiCheckAuth, checkGamble, async (req, res) => {
    require("./routes/api/casino/plinko/endGame.js").endGame(req, res, db, casinoToken);
});
// end plinko

app.get("/api/events/:event/teams", apiCheckAuth, async (req, res) => {
    require("./routes/api/events/teams.js").teams(req, res, frcapi, season);
});

app.get("/api/events/:event/allTeamData", apiCheckAuth, async (req, res) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?eventCode=${req.params.event}`, req, res);
});

app.get("/api/events/current/allData", apiCheckAuth, async (req, res) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?eventCode=${currentComp}`, req, res);
});

app.get("/api/events/:event/pitscoutedteams", apiCheckAuth, async (req, res) => {
    require("./routes/api/events/pitscoutedteams.js").pitscoutedteams(req, res, db, season);
});

app.get("/api/notes/:event/:team/getNotes", apiCheckAuth, async (req, res) => {
    require("./routes/api/notes/getNotes.js").getNotes(req, res, db, season);
});

app.get("/api/notes/:event/:team/createNote", apiCheckAuth, async (req, res) => {
    require("./routes/api/notes/createNote.js").createNote(req, res, db, season);
});

app.post("/api/notes/:event/:team/updateNotes", apiCheckAuth, async (req, res) => {
    require("./routes/api/notes/updateNotes.js").updateNotes(req, res, db, season);
});

app.get("/api/teams/teamdata/:team", apiCheckAuth, async (req, res) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?teamNumber=${req.params.team}`, req, res);
});

// auth functions
app.get("/", passport.authenticate("discord"));

app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/");
});

// not requiring auth for offline version, you cannot submit with this and submit url is secured anyway
app.get("/offline.html", (req, res) => {
    res.sendFile("src/offline.html", { root: __dirname });
});


if (certsizes.key <= 100 || certsizes.cert <= 100) {
    app.listen(80);
} else {
    const httpRedirect = express();
    httpRedirect.all("*", (req, res) =>
        res.redirect(`https://${req.hostname}${req.url}`)
    );
    const httpServer = http.createServer(httpRedirect);
    httpServer.listen(80, () =>
        console.log(`HTTP server listening: http://localhost`)
    );
}

// server created and ready for a request
console.log("Ready!");