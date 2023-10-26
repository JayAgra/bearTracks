//////////////////////////////////
//////////////////////////////////
//////        CONFIG        //////
//////////////////////////////////
//////////////////////////////////

/*jslint node: true*/
/*jslint es6*/

"use strict";
const {
    frcapi,
    myteam,
    season,
    baseURLNoPcl,
    serverSecret,
} = require("./config.json");

// sqlite database
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("data.db", sqlite3.OPEN_READWRITE, (err) => {
    console.log(err);
});
db.run("PRAGMA journal_mode = WAL;");
const transactions = new sqlite3.Database("data_transact.db", sqlite3.OPEN_READWRITE, (err) => {
    console.log(err);
});
transactions.run("PRAGMA journal_mode = WAL;");
const authDb = new sqlite3.Database("data_auth.db", sqlite3.OPEN_READWRITE, (err) => {
    console.log(err);
});
authDb.run("PRAGMA journal_mode = WAL;");

// server imports
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
    key: fs.statSync(
        `/etc/letsencrypt/live/${baseURLNoPcl}/privkey.pem`,
        "utf8"
    ),
    cert: fs.statSync(`/etc/letsencrypt/live/${baseURLNoPcl}/cert.pem`, "utf8"),
};

// checks file size of ssl, if it exists (is filled), use HTTPS on port 443
var server;
if (!(certsizes.key <= 100) && !(certsizes.cert <= 100)) {
    server = https.createServer(options, app).listen(443);
}
var expressWs = require("express-ws")(app, server);
app.use("/js", express.static("src/js"));
app.use("/css", express.static("src/css"));
app.use("/images", express.static("images"));
// all cards by Lydia Honerkamp (https://github.com/1yd1a)
app.use(
    "/assets",
    express.static("src/assets", {
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

// image uploading
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

//////////////////////////////////
//////////////////////////////////
//////      HELPER FNS      //////
//////////////////////////////////
//////////////////////////////////

function invalidJSON(str) {
    try {
        JSON.parse(str);
        return false;
    } catch (error) {
        return true;
    }
}

app.use((req, res, next) => {
    if (req.cookies.key) {
        authDb.get("SELECT * FROM keys WHERE key=? LIMIT 1", [req.cookies.key], (err, result) => {
            if (err || !result || Number(result.expires) < Date.now()) {
                res.clearCookie("key");
                req.user = false;
            } else {
                req.user = {
                    "id": result.userId,
                    "name": result.name,
                    "admin": result.admin,
                    "key": result.key,
                    "expires": result.expires,
                }
            }
            return next();
        });
    } else {
        req.user = false;
        return next();
    }
});

// check the authentication and server membership
function checkAuth(req, res, next) {
    if (req.user !== false) {
        if (Number(req.user.expires) < Date.now()) {
            res.clearCookie("key");
            return res.redirect("/login");
        }
        return next();
    }
    return res.redirect("/login");
}

// check the authentication and server membership
function apiCheckAuth(req, res, next) {
    if (req.user !== false) {
        if (Number(req.user.expires) < Date.now()) {
            res.clearCookie("key");
            return res.status(401).send("" + 0x1911);
        }
        return next();
    }
    return res.status(401).send("" + 0x1911);
}

async function checkGamble(req, res, next) {
    let pointStmt = `SELECT score FROM users WHERE id=?`;
    let pointValues = [req.user.id];
    authDb.get(pointStmt, pointValues, (err, result) => {
        if (Number(result.score) > -32768) {
            return next();
        } else {
            return res.status(403).send("" + 0x1933);
        }
    });
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

// if "current" is specified, use current season
function selectSeason(req) {
    return req.params.season == "current" ? season : req.params.season;
}

// before server creation
console.log("Preparing...");
app.disable("etag");


//////////////////////////////////
//////////////////////////////////
////// ACCEPT INCOMING FORM //////
//////////////////////////////////
//////////////////////////////////

// get the main form submissions
app.post("/submit", checkAuth, async (req, res) => {
    require("./routes/submit.js").submitForm(req, res, db, transactions, authDb, __dirname, season);
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
    require("./routes/submitPit.js").submitPit(req, res, db, transactions, authDb, __dirname, season);
});


//////////////////////////////////
//////////////////////////////////
//////     SERVE STATIC     //////
//////////////////////////////////
//////////////////////////////////

// homepage. ok, fine, this is not super static
app.get("/", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/index.html", { root: __dirname });
});

// main scouting form
app.get("/main", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/main.html", { root: __dirname });
});

// pit form
app.get("/pit", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/pit.html", { root: __dirname });
});

// login page
app.get("/login", async (req, res) => {
    res.clearCookie("key");
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/login.html", { root: __dirname });
});

// create account page
app.get("/create", async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/create.html", { root: __dirname });
});

// webmanifest for PWAs
app.get("/app.webmanifest", async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("./src/app.webmanifest", { root: __dirname });
});

// settings page
app.get("/settings", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/settings.html", { root: __dirname });
});

app.get("/teams", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/teams.html", { root: __dirname });
});

app.get("/manage", checkAuth, async (req, res) => {
    if (req.user.admin == "true") {
        res.set("Cache-control", "public, max-age=23328000");
        res.sendFile("src/manage.html", { root: __dirname });
    } else {
        res.redirect("/denied");
    }
});

app.get("/manageScouts", checkAuth, async (req, res) => {
    if (req.user.admin == "true") {
        res.set("Cache-control", "public, max-age=23328000");
        res.sendFile("src/manageScouts.html", { root: __dirname });
    } else {
        res.redirect("/denied");
    }
});

// CSS (should be unused in favor of minified css)
app.get("/float.css", async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("./src/float.css", { root: __dirname });
});

// minified css
app.get("/float.min.css", async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("./src/float.min.css", { root: __dirname });
});

// font file
app.get("/fonts/Raleway-300.ttf", async (req, res) => {
    res.set("Cache-control", "public, max-age=233280000");
    res.sendFile("./src/css/Raleway-300.ttf", { root: __dirname });
});

// font file
app.get("/fonts/Raleway-500.ttf", async (req, res) => {
    res.set("Cache-control", "public, max-age=233280000");
    res.sendFile("./src/css/Raleway-500.ttf", { root: __dirname });
});

// JS for form (should be unused in favor of minified js)
app.get("/form.js", async (req, res) => {
    res.set("Cache-control", "public, max-age=31104000");
    res.sendFile("./src/form.js", { root: __dirname });
});

// minified JS for form
app.get("/form.min.js", async (req, res) => {
    res.set("Cache-control", "public, max-age=15552000");
    res.sendFile("./src/js/form.min.js", { root: __dirname });
});

// favicon
app.get("/favicon.ico", async (req, res) => {
    res.set("Cache-control", "public, max-age=311040000");
    res.sendFile("src/favicon.ico", { root: __dirname });
});

// scout rank page
app.get("/scouts", async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/scouts.html", { root: __dirname });
});

// play blackjack
app.get("/blackjack", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/blackjack.html", { root: __dirname });
});

// spin wheel
app.get("/spin", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/spin.html", { root: __dirname });
});

// list of gambling opportunities
app.get("/points", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/points.html", { root: __dirname });
});

// teams left to pit scout (data with XHR request)
app.get("/topitscout", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/topitscout.html", { root: __dirname });
});

// notes feature
app.get("/notes", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/notes.html", { root: __dirname });
});

// per-scout profile
app.get("/profile", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/profile.html", { root: __dirname });
});

// scout point transactions
app.get("/pointRecords", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/pointRecords.html", { root: __dirname });
});

// get images from pit scouting. images are located in scouting-app/images
app.get("/pitimages", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/pitimg.html", { root: __dirname });
});

// page with fake blue banners for future use
app.get("/awards", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/awards.html", { root: __dirname });
});

// match list
app.get("/matches", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/matches.html", { root: __dirname });
});

// data browsing tool
app.get("/browse", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/browse.html", { root: __dirname });
});

// data browsing tool with detail
app.get("/detail", checkAuth, async (req, res) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/detail.html", { root: __dirname });
});

// allow people to get denied :)
app.get("/denied", (req, res) => {
    res.status(400).send("access denied");
});


//////////////////////////////////
//////////////////////////////////
//////          API         //////
//////////////////////////////////
//////////////////////////////////

//
// data
//

// get all match data (by event)
app.get("/api/data/:season/all/:event", apiCheckAuth, async (req, res) => {
    require("./routes/api/data/event.js").getAllEventData(req, res, db, selectSeason(req));
});

// get team match data (by event)
app.get("/api/data/:season/team/:event/:team", apiCheckAuth, async (req, res) => {
    require("./routes/api/data/team.js").getTeamEventData(req, res, db, selectSeason(req));
});

// get match data for a match
app.get("/api/data/:season/match/:event/:match", apiCheckAuth, async (req, res) => {
    require("./routes/api/data/match.js").getEventMatchData(req, res, db, selectSeason(req));
});

// get all match scouting data from a scout (by season)
app.get("/api/data/:season/scout/:userId", apiCheckAuth, async (req, res) => {
    require("./routes/api/data/scout.js").getScoutResponses(req, res, db, selectSeason(req));
});

// get pit scouting data
app.get("/api/pit/:season/:event/:team", apiCheckAuth, async (req, res) => {
    require("./routes/api/data/pit.js").pit(req, res, db, selectSeason(req));
});

// get detailed data by query
app.get("/api/data/:season/detail/query/:event/:team/:page", apiCheckAuth, async (req, res) => {
    require("./routes/api/data/detail.js").detailBySpecs(req, res, db, selectSeason(req));
});

// get detailed data by id
app.get("/api/data/detail/id/:id", apiCheckAuth, async (req, res) => {
    require("./routes/api/data/detailID.js").detailByID(req, res, db);
});

//
// team listings
//

// get weight for teams list page
app.get("/api/teams/:season/:event", apiCheckAuth, async (req, res) => {
    require("./routes/api/teams/teams.js").teams(req, res, db,selectSeason(req));
});

// pit scouted team list
app.get("/api/teams/:season/:event/pitscoutedteams", apiCheckAuth, async (req, res) => {
    require("./routes/api/teams/pitscoutedteams.js").pitscoutedteams(req, res, db, selectSeason(req));
});

// other ways to get weight - not used by app, but for external use
app.get("/api/teams/event/:season/:event/:team/weight", apiCheckAuth, async (req, res) => {
    require("./routes/api/teams/eventWeight.js").teamsByEvent(req, res, db, selectSeason(req));
 });

app.get("/api/teams/season/:season/:team/weight", apiCheckAuth, async (req, res) => {
    require("./routes/api/teams/seasonWeight.js").teamsBySeason(req, res, db, selectSeason(req));
});

//
// scout listings
//

// list of scouts & points
app.get("/api/scouts", apiCheckAuth, async (req, res) => {
    require("./routes/api/scouts.js").scouts(req, res, authDb);
});

// scout's profile (submitted forms)
app.get("/api/scouts/:scout/profile", apiCheckAuth, async (req, res) => {
    require("./routes/api/scouts/profile.js").profile(req, res, authDb);
});

// scout's point transactions
app.get("/api/scouts/transactions/me", apiCheckAuth, async (req, res) => {
    require("./routes/api/scouts/transactions.js").scoutTransactions(req, res, transactions);
});

// scout's profile
app.get("/api/scoutByID/:userId", apiCheckAuth, async (req, res) => {
    require("./routes/api/scouts/scoutByID.js").scoutByID(req, res, db);
});

//
// management
//

app.get("/api/manage/:database/list", checkAuth, async (req, res) => {
    require("./routes/api/manage/list.js").listSubmissions(req, res, db, leadToken);
});

app.get("/api/manage/:database/:submissionId/delete", checkAuth, async (req, res) => {
    require("./routes/api/manage/delete.js").deleteSubmission(req, res, db, transactions, authDb);
});

app.get("/api/manage/scout/points/:userId/:modify/:reason", checkAuth, async (req, res) => {
    require("./routes/api/manage/user/points.js").updateScout(req, res, transactions, authDb);
});

app.get("/api/manage/scout/access/:id/:accessOk", checkAuth, async (req, res) => {
    require("./routes/api/manage/user/access.js").updateAccess(req, res, authDb);
});

app.get("/api/manage/scout/revokeKey/:id", checkAuth, async (req, res) => {
    require("./routes/api/manage/user/revokeKey.js").revokeKey(req, res, authDb);
});

//
// gambling
//

// slots (unused)
app.get("/api/casino/slots/slotSpin", apiCheckAuth, async (req, res) => {
    require("./routes/api/casino/slots/slotSpin.js").slotSpin(req, res, authDb, transactions);
});

// spin wheel thing
app.get("/api/casino/spinner/spinWheel", apiCheckAuth, checkGamble, async (req, res) => {
    require("./routes/api/casino/spinner/spinWheel.js").spinWheel(req, res, authDb, transactions);
});

app.ws('/api/casino/blackjack/blackjackSocket', function(ws, req) {
    require("./routes/api/casino/blackjack/blackjackSocket.js").blackjackSocket(ws, req, transactions, authDb);
});

//
// notes
//

// get note for team
app.get("/api/notes/:event/:team/getNotes", apiCheckAuth, async (req, res) => {
    require("./routes/api/notes/getNotes.js").getNotes(req, res, db, season);
});

// create the notes
app.get("/api/notes/:event/:team/createNote", apiCheckAuth, async (req, res) => {
    require("./routes/api/notes/createNote.js").createNote(req, res, db, season);
});

// save the note
app.post("/api/notes/:event/:team/updateNotes", apiCheckAuth, async (req, res) => {
    require("./routes/api/notes/updateNotes.js").updateNotes(req, res, db, season);
});

//
// frc api data forwarders
//

// team list for events
app.get("/api/matches/:season/:event/:level/:all", apiCheckAuth, async (req, res) => {
    if (req.params.event !== "CCCC") {
        var teamNumParam = "";
        if (req.params.all === "all") {
            teamNumParam = "&start=&end=";
        } else {
            teamNumParam = `&teamNumber=${myteam}`;
        }
        res.set("Cache-control", "public, max-age=23328000");
        forwardFRCAPIdata(`/v3.0/${req.params.season}/schedule/${req.params.event}?tournamentLevel=${req.params.level}${teamNumParam}`, req, res);
    } else {
        res.header("Content-Type", "application/json");
        res.set("Cache-control", "public, max-age=23328000");
        res.sendFile("src/js/CCCC.json", { root: __dirname });
    }
});

// frc api team list
app.get("/api/events/:season/:event/teams", apiCheckAuth, async (req, res) => {
    require("./routes/api/events/teams.js").teams(req, res, frcapi, selectSeason(req));
});

// frc api teams data
app.get("/api/events/:event/allTeamData", apiCheckAuth, async (req, res) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?eventCode=${req.params.event}`, req, res);
});

// frc api's data on a team
app.get("/api/teams/teamdata/:team", apiCheckAuth, async (req, res) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?teamNumber=${req.params.team}`, req, res);
});

//
// other
//

// whoami
app.get("/api/whoami", apiCheckAuth, (req, res) => {
    res.send("" + req.user.id);
});

//////////////////////////////////
//////////////////////////////////
//////     AUTH & SERVER    //////
//////////////////////////////////
//////////////////////////////////

app.post("/createAccount", (req, res) => {
    require("./routes/api/auth/create.js").createAccount(req, res, authDb);
});

app.post("/loginForm", (req, res) => {
    require("./routes/api/auth/login.js").checkLogIn(req, res, authDb);
});

// clear cookies, used for debugging
app.get("/clearCookies", (req, res) => {
    authDb.run("DELETE FROM keys WHERE key=?", [req.cookies.key], (err) => {});
    res.clearCookie("connect.sid");
    res.clearCookie("lead");
    res.clearCookie("key");
    res.redirect("/login");
});

// destroy session
app.get("/logout", (req, res) => {
    authDb.run("DELETE FROM keys WHERE key=?", [req.cookies.key], (err) => {});
    res.clearCookie("key");
    res.clearCookie("lead");
    res.redirect("/login");
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
