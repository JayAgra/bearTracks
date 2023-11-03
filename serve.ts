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
    baseURLNoPcl,
} = require("./config.json");

const season = new Date().getFullYear();

// sqlite database
import * as sqlite3 from "sqlite3";
const db: sqlite3.Database = new sqlite3.Database("data.db", sqlite3.OPEN_READWRITE, (err: any) => {
    if (err) console.error(err);
});
db.run("PRAGMA journal_mode = WAL;");

const transactions: sqlite3.Database = new sqlite3.Database("data_transact.db", sqlite3.OPEN_READWRITE, (err: any) => {
    if (err) console.error(err);
});
transactions.run("PRAGMA journal_mode = WAL;");

const authDb: sqlite3.Database = new sqlite3.Database("data_auth.db", sqlite3.OPEN_READWRITE, (err: any) => {
    if (err) console.error(err);
});
authDb.run("PRAGMA journal_mode = WAL;");

// server imports
import express from "express";
import expressWs from "express-ws";
import cookieParser from "cookie-parser";
import RateLimit from "express-rate-limit";
import helmet from "helmet";
import lusca from "lusca";
import * as fs from "fs";
import * as https from "https";
import * as http from "http";
import { EventEmitter } from "events";
const options = {
    key: fs.readFileSync(`/etc/letsencrypt/live/${baseURLNoPcl}/privkey.pem`),
    cert: fs.readFileSync(`/etc/letsencrypt/live/${baseURLNoPcl}/cert.pem`, "utf8"),
};

const certsizes = {
    key: fs.statSync(`/etc/letsencrypt/live/${baseURLNoPcl}/privkey.pem`),
    cert: fs.statSync(`/etc/letsencrypt/live/${baseURLNoPcl}/cert.pem`)
};

// checks file size of ssl, if it exists (is filled), use HTTPS on port 443
const app: express.Express = express();
var server: https.Server;
if (!(Number(certsizes.key) <= 1) && !(Number(certsizes.cert) <= 1)) {
    server = https.createServer(options, app).listen(443);
} else {
    throw new Error("no ssl");
}
const { app: wsApp } = expressWs(app, server);

app.disable("x-powered-by");
app.use(cookieParser());
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);
app.use("/js", express.static("src/js"));
app.use("/css", express.static("src/css"));
// all cards by Lydia Honerkamp (https://github.com/1yd1a)
app.use(
    "/assets",
    express.static("src/assets", {
        setHeaders: (res: express.Response, path: string) => {
            res.set("X-Artist", "Lydia Honerkamp");
        },
    })
);
var limiter = RateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 750,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: express.Request, res: express.Response) => {
        return req.connection.remoteAddress ? req.connection.remoteAddress : "0";
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

//////////////////////////////////
//////////////////////////////////
//////      HELPER FNS      //////
//////////////////////////////////
//////////////////////////////////

function invalidJSON(str: string) {
    try {
        JSON.parse(str);
        return false;
    } catch (error) {
        return true;
    }
}

type keysDb = {
    id: number;
    key: string;
    userId: number;
    username: string;
    name: string;
    team: number;
    created: string;
    expires: string;
    admin: string;
    teamAdmin: number;
};

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies.key) {
        authDb.get("SELECT * FROM keys WHERE key=? LIMIT 1", [req.cookies.key], (err: any, result: keysDb | null) => {
            if (err || !result || Number(result.expires) < Date.now()) {
                res.clearCookie("key");
                req.user = {
                    "id": 0,
                    "username": "",
                    "name": "",
                    "team": 0,
                    "admin": "",
                    "key": "",
                    "expires": "",
                    "teamAdmin": 0
                };
            } else {
                req.user = {
                    "id": result.userId,
                    "username": result.username,
                    "name": result.name,
                    "team": result.team,
                    "admin": result.admin,
                    "key": result.key,
                    "expires": result.expires,
                    "teamAdmin": result.teamAdmin
                }
            }
            return next();
        });
    } else {
        req.user = {
            "id": 0,
            "username": "",
            "name": "",
            "team": 0,
            "admin": "",
            "key": "",
            "expires": "",
            "teamAdmin": 0
        };
        return next();
    }
});

// check the authentication and server membership
function checkAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.user.id !== 0) {
        if (Number(req.user.expires) < Date.now()) {
            res.clearCookie("key");
            return res.redirect("/login");
        }
        return next();
    }
    return res.redirect("/login");
}

// check the authentication and server membership
function apiCheckAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.user.id !== 0) {
        if (Number(req.user.expires) < Date.now()) {
            res.clearCookie("key");
            return res.status(401).send("" + 0x1911);
        }
        return next();
    }
    return res.status(401).send("" + 0x1911);
}

type scoreOnly = {
    "score": number
}

async function checkGamble(req: express.Request, res: express.Response, next: express.NextFunction) {
    let pointStmt = `SELECT score FROM users WHERE id=?`;
    let pointValues = [req.user.id];
    authDb.get(pointStmt, pointValues, (err: any, result: scoreOnly) => {
        if (Number(result.score) > -32768) {
            return next();
        } else {
            return res.status(403).send("" + 0x1933);
        }
    });
}

// forwards FRC API data for some API endpoints
// insert first forward 2022 pun
async function forwardFRCAPIdata(url: string, req: express.Request, res: express.Response) {
    var dbody: EventEmitter = new EventEmitter();
    var options = {
        method: "GET",
        hostname: "frc-api.firstinspires.org",
        path: url,
        headers: {
            Authorization: "Basic " + frcapi,
        },
        maxRedirects: 20,
    };

    var request = https.request(options, (response: any) => {
        var chunks: any = [];

        response.on("data", (chunk: any) => {
            chunks.push(chunk);
        });

        response.on("end", (chunk: any) => {
            var body = Buffer.concat(chunks);
            dbody.emit("update", body);
        });

        response.on("error", (error: any) => {
            console.error(error);
        });
    });
    request.end();

    dbody.on("update", (body: any) => {
        if (invalidJSON(body)) {
            res.status(500).send("" + 0x1f61);
        } else {
            res.status(200).json(JSON.parse(body));
        }
    });
}

// if "current" is specified, use current season
function selectSeason(req: express.Request<any>) {
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
import { submitForm } from "./routes/submit";
app.post("/submit", checkAuth, async (req: express.Request, res: express.Response) => {
    submitForm(req, res, db, transactions, authDb, __dirname, season);
});


//////////////////////////////////
//////////////////////////////////
//////     SERVE STATIC     //////
//////////////////////////////////
//////////////////////////////////

// homepage. ok, fine, this is not super static
app.get("/", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/index.html", { root: __dirname });
});

// main scouting form
app.get("/main", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/main.html", { root: __dirname });
});

// login page
app.get("/login", async (req: express.Request, res: express.Response) => {
    res.clearCookie("key");
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/login.html", { root: __dirname });
});

// create account page
app.get("/create", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/create.html", { root: __dirname });
});

// charts page
app.get("/charts", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/charts.html", { root: __dirname });
});

// webmanifest for PWAs
app.get("/app.webmanifest", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("./src/app.webmanifest", { root: __dirname });
});

// settings page
app.get("/settings", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/settings.html", { root: __dirname });
});

app.get("/teams", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/teams.html", { root: __dirname });
});

app.get("/manage", checkAuth, async (req: express.Request, res: express.Response) => {
    if (req.user.admin == "true") {
        res.set("Cache-control", "public, max-age=23328000");
        res.sendFile("src/manage.html", { root: __dirname });
    } else {
        res.redirect("/denied");
    }
});

app.get("/manageScouts", checkAuth, async (req: express.Request, res: express.Response) => {
    if (req.user.admin == "true") {
        res.set("Cache-control", "public, max-age=23328000");
        res.sendFile("src/manageScouts.html", { root: __dirname });
    } else {
        res.redirect("/denied");
    }
});

app.get("/manageTeam", checkAuth, async (req: express.Request, res: express.Response) => {
    if (req.user.teamAdmin !== 0) {
        res.set("Cache-control", "public, max-age=23328000");
        res.sendFile("src/manageTeam.html", { root: __dirname });
    } else {
        res.redirect("/denied");
    }
});

app.get("/manageTeams", checkAuth, async (req: express.Request, res: express.Response) => {
    if (req.user.admin == "true") {
        res.set("Cache-control", "public, max-age=23328000");
        res.sendFile("src/manageTeams.html", { root: __dirname });
    } else {
        res.redirect("/denied");
    }
});

// CSS (should be unused in favor of minified css)
app.get("/float.css", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=933120000");
    res.sendFile("./src/float.css", { root: __dirname });
});

// minified css
app.get("/float.min.css", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=933120000");
    res.sendFile("./src/float.min.css", { root: __dirname });
});

// font file
app.get("/fonts/Raleway-300.ttf", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=933120000");
    res.sendFile("./src/css/Raleway-300.ttf", { root: __dirname });
});

// font file
app.get("/fonts/Raleway-500.ttf", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=933120000");
    res.sendFile("./src/css/Raleway-500.ttf", { root: __dirname });
});

// JS for form (should be unused in favor of minified js)
app.get("/form.js", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=933120000");
    res.sendFile("./src/form.js", { root: __dirname });
});

// minified JS for form
app.get("/form.min.js", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=933120000");
    res.sendFile("./src/js/form.min.js", { root: __dirname });
});

// favicon
app.get("/favicon.ico", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=9331200000");
    res.sendFile("src/favicon.ico", { root: __dirname });
});

// scout rank page
app.get("/scouts", async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/scouts.html", { root: __dirname });
});

// play blackjack
app.get("/blackjack", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=259200");
    res.sendFile("src/blackjack.html", { root: __dirname });
});

// spin wheel
app.get("/spin", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/spin.html", { root: __dirname });
});

// list of gambling opportunities
app.get("/points", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/points.html", { root: __dirname });
});

// scout point transactions
app.get("/pointRecords", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/pointRecords.html", { root: __dirname });
});

// page with fake blue banners for future use
app.get("/awards", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/awards.html", { root: __dirname });
});

// match list
app.get("/matches", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/matches.html", { root: __dirname });
});

// data browsing tool
app.get("/browse", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/browse.html", { root: __dirname });
});

// make passkey
app.get("/createPasskey", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/passkey.html", { root: __dirname });
});

// data browsing tool with detail
app.get("/detail", checkAuth, async (req: express.Request, res: express.Response) => {
    res.set("Cache-control", "public, max-age=23328000");
    res.sendFile("src/detail.html", { root: __dirname });
});

// allow people to get denied :)
app.get("/denied", (req: express.Request, res: express.Response) => {
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
import { getAllEventData } from "./routes/api/data/event";
app.get("/api/data/:season/all/:event", apiCheckAuth, async (req: express.Request<{event: string}>, res: express.Response) => {
    getAllEventData(req, res, db, selectSeason(req));
});

// get team match data (by event)
import { getTeamEventData } from "./routes/api/data/team";
app.get("/api/data/:season/team/:event/:team", apiCheckAuth, async (req: express.Request<{event: string, team: string}>, res: express.Response) => {
    getTeamEventData(req, res, db, selectSeason(req));
});

// get match data for a match
import { getEventMatchData } from "./routes/api/data/match";
app.get("/api/data/:season/match/:event/:match", apiCheckAuth, async (req: express.Request<{event: string, match: string}>, res: express.Response) => {
    getEventMatchData(req, res, db, selectSeason(req));
});

// get all match scouting data from a scout (by season)
import { getScoutResponses } from "./routes/api/data/scout";
app.get("/api/data/:season/scout/:userId", apiCheckAuth, async (req: express.Request<{userId: string}>, res: express.Response) => {
    getScoutResponses(req, res, db, selectSeason(req));
});

// get detailed data by query
import { detailBySpecs } from "./routes/api/data/detail";
app.get("/api/data/:season/detail/query/:event/:team/:page", apiCheckAuth, async (req: express.Request<{event: string, team: string, page: string}>, res: express.Response) => {
    detailBySpecs(req, res, db, selectSeason(req));
});

// get detailed data by id
import { detailByID } from "./routes/api/data/detailID";
app.get("/api/data/detail/id/:id", apiCheckAuth, async (req: express.Request<{id: string}>, res: express.Response) => {
    detailByID(req, res, db);
});

// see if submission with id exists
import { submissionExists } from "./routes/api/data/exists";
app.get("/api/data/exists/:id", apiCheckAuth, async (req: express.Request<{id: string}>, res: express.Response) => {
    submissionExists(req, res, db);
});

//
// team listings
//

// get weight for teams list page
import { teams } from "./routes/api/teams/teams";
app.get("/api/teams/:season/:event", apiCheckAuth, async (req: express.Request<{event: string}>, res: express.Response) => {
    teams(req, res, db,selectSeason(req));
});

// other ways to get weight - not used by app, but for external use
import { teamsByEvent } from "./routes/api/teams/eventWeight";
app.get("/api/teams/event/:season/:event/:team/weight", apiCheckAuth, async (req: express.Request<{event: string, team: string}>, res: express.Response) => {
    teamsByEvent(req, res, db, selectSeason(req));
});

import { teamsBySeason } from "./routes/api/teams/seasonWeight";
app.get("/api/teams/season/:season/:team/weight", apiCheckAuth, async (req: express.Request<{team: string}>, res: express.Response) => {
    teamsBySeason(req, res, db, selectSeason(req));
});

//
// scout listings
//

// list of scouts & points
import { scouts } from "./routes/api/scouts/scouts";
app.get("/api/scouts", apiCheckAuth, async (req: express.Request, res: express.Response) => {
    scouts(req, res, authDb);
});

// scout's profile (submitted forms)
import { profile } from "./routes/api/scouts/profile";
app.get("/api/scouts/:scout/profile", apiCheckAuth, async (req: express.Request<{scout: string}>, res: express.Response) => {
    profile(req, res, authDb);
});

// scout's point transactions
import { scoutTransactions } from "./routes/api/scouts/transactions";
app.get("/api/scouts/transactions/me", apiCheckAuth, async (req: express.Request, res: express.Response) => {
    scoutTransactions(req, res, transactions);
});

// scout's profile
import { scoutByID } from "./routes/api/scouts/scoutByID";
app.get("/api/scoutByID/:username", apiCheckAuth, async (req: express.Request<{username: string}>, res: express.Response) => {
    scoutByID(req, res, db);
});

//
// management
//

// data management

import { listSubmissions } from "./routes/api/manage/list";
app.get("/api/manage/list", apiCheckAuth, async (req: express.Request, res: express.Response) => {
    listSubmissions(req, res, db);
});

import { deleteSubmission } from "./routes/api/manage/delete";
app.get("/api/manage/:submissionId/delete", apiCheckAuth, async (req: express.Request<{submissionId: string}>, res: express.Response) => {
    deleteSubmission(req, res, db, transactions, authDb);
});

// scout management

import { updateScout } from "./routes/api/manage/user/points";
app.get("/api/manage/user/points/:userId/:modify/:reason", apiCheckAuth, async (req: express.Request<{userId: string, modify: string, reason: string}>, res: express.Response) => {
    updateScout(req, res, transactions, authDb);
});

import { updateAccess } from "./routes/api/manage/user/access";
app.get("/api/manage/user/access/:id/:accessOk", apiCheckAuth, async (req: express.Request<{id: string, accessOk: string}>, res: express.Response) => {
    updateAccess(req, res, authDb);
});

import { deleteUser } from "./routes/api/manage/user/delete";
app.get("/api/manage/user/delete/:id", apiCheckAuth, async (req: express.Request<{id: string}>, res: express.Response) => {
    deleteUser(req, res, authDb);
});

import { revokeKey } from "./routes/api/manage/user/revokeKey";
app.get("/api/manage/user/revokeKey/:id", apiCheckAuth, async (req: express.Request<{id: string}>, res: express.Response) => {
    revokeKey(req, res, authDb);
});

import { updateAdmin } from "./routes/api/manage/user/updateAdmin";
app.get("/api/manage/user/updateAdmin/:id/:admin", apiCheckAuth, async (req: express.Request<{id: string}>, res: express.Response) => {
    updateAdmin(req, res, authDb);
});

import { updateTeamAdmin } from "./routes/api/manage/user/updateTeamAdmin";
app.get("/api/manage/user/updateTeamAdmin/:id/:admin", apiCheckAuth, async (req: express.Request<{id: string}>, res: express.Response) => {
    updateTeamAdmin(req, res, authDb);
});

// team management endpoints

import { updateTeamKey } from "./routes/api/manage/teams/updateKey";
app.get("/api/manage/teams/updateKey/:keyId/:newKey", apiCheckAuth, async (req: express.Request<{keyId: string, newKey: string}>, res: express.Response) => {
    updateTeamKey(req, res, authDb);
});

import { createTeamKey } from "./routes/api/manage/teams/createKey";
app.get("/api/manage/teams/createKey/:key/:team", apiCheckAuth, async (req: express.Request<{key: string, team: string}>, res: express.Response) => {
    createTeamKey(req, res, authDb);
});

import { revokeTeamKey } from "./routes/api/manage/teams/revokeKey";
app.get("/api/manage/teams/deleteKey/:keyId", apiCheckAuth, async (req: express.Request<{keyId: string}>, res: express.Response) => {
    revokeTeamKey(req, res, authDb);
});

import { listTeams } from "./routes/api/manage/teams/list";
app.get("/api/manage/teams/list", apiCheckAuth, async (req: express.Request, res: express.Response) => {
    listTeams(req, res, authDb);
});

// individual team endpoints

import { teamScouts } from "./routes/api/manage/myTeam/list";
app.get("/api/manage/myTeam/list", apiCheckAuth, async (req: express.Request, res: express.Response) => {
    teamScouts(req, res, authDb);
});

import { manageTeamUser } from "./routes/api/manage/myTeam/scouts/access";
app.get("/api/manage/myTeam/scouts/access/:id/:accessOk", apiCheckAuth, async (req: express.Request<{accessOk: string}>, res: express.Response) => {
    manageTeamUser(req, res, authDb);
});

//
// gambling
//

// slots (unused)
import { slotSpin } from "./routes/api/casino/slots/slotSpin";
app.get("/api/casino/slots/slotSpin", apiCheckAuth, async (req: express.Request, res: express.Response) => {
    slotSpin(req, res, authDb, transactions);
});

// spin wheel thing
import { spinWheel } from "./routes/api/casino/spinner/spinWheel";
app.get("/api/casino/spinner/spinWheel", apiCheckAuth, checkGamble, async (req: express.Request, res: express.Response) => {
    spinWheel(req, res, authDb, transactions);
});

import { blackjackSocket } from "./routes/api/casino/blackjack/blackjackSocket";
wsApp.ws('/api/casino/blackjack/blackjackSocket', function(ws: any, req: express.Request) {
    blackjackSocket(ws, req, transactions, authDb);
});

//
// frc api data forwarders
//

// team list for events
app.get("/api/matches/:season/:event/:level/:all", apiCheckAuth, async (req: express.Request<{event: string, level: string, all: string, season: string}>, res: express.Response) => {
    var teamNumParam = "";
    if (req.params.all === "all") {
        teamNumParam = "&start=&end=";
    } else {
        teamNumParam = `&teamNumber=${myteam}`;
    }
    res.set("Cache-control", "public, max-age=23328000");
    forwardFRCAPIdata(`/v3.0/${selectSeason(req)}/schedule/${req.params.event}?tournamentLevel=${req.params.level}${teamNumParam}`, req, res);
});

// frc api team list
import { teamsFrcApi } from "./routes/api/events/teams";
app.get("/api/events/:season/:event/teams", apiCheckAuth, async (req: express.Request<{event: string}>, res: express.Response) => {
    teamsFrcApi(req, res, frcapi, selectSeason(req));
});

// frc api teams data
app.get("/api/events/:event/allTeamData", apiCheckAuth, async (req: express.Request<{event: string}>, res: express.Response) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?eventCode=${req.params.event}`, req, res);
});

// frc api's data on a team
app.get("/api/teams/teamdata/:team", apiCheckAuth, async (req: express.Request<{team: string}>, res: express.Response) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?teamNumber=${req.params.team}`, req, res);
});

//
// other
//

// whoami
app.get("/api/whoami", apiCheckAuth, (req: express.Request, res: express.Response) => {
    res.send("" + req.user.id);
});

//////////////////////////////////
//////////////////////////////////
//////     AUTH & SERVER    //////
//////////////////////////////////
//////////////////////////////////

import { createAccount } from "./routes/api/auth/create";
app.post("/createAccount", (req: express.Request, res: express.Response) => {
    createAccount(req, res, authDb);
});

import { checkLogIn } from "./routes/api/auth/login";
app.post("/loginForm", (req: express.Request, res: express.Response) => {
    checkLogIn(req, res, authDb);
});

import { createPasskey } from "./routes/api/auth/passkey/createPasskey";
app.get("/api/auth/createPasskey", checkAuth, (req: express.Request, res: express.Response) => {
    createPasskey(req, res, authDb);
});

import { verifyPasskey } from "./routes/api/auth/passkey/verifyPasskey";
app.post("/api/auth/verifyPasskey", checkAuth, (req: express.Request, res: express.Response) => {
    verifyPasskey(req, res, authDb);
});

import { authPasskey } from "./routes/api/auth/passkey/authPasskey";
app.get("/api/auth/authPasskey", checkAuth, (req: express.Request, res: express.Response) => {
    authPasskey(req, res, authDb);
});

import { verifyAuthPasskey } from "./routes/api/auth/passkey/verifyAuthPasskey";
app.post("/api/auth/verifyAuthPasskey", checkAuth, (req: express.Request, res: express.Response) => {
    verifyAuthPasskey(req, res, authDb);
});

// clear cookies, used for debugging
app.get("/clearCookies", (req: express.Request, res: express.Response) => {
    authDb.run("DELETE FROM keys WHERE key=?", [req.cookies.key], () => {});
    res.clearCookie("connect.sid");
    res.clearCookie("lead");
    res.clearCookie("key");
    res.redirect("/login");
});

// destroy session
app.get("/logout", (req: express.Request, res: express.Response) => {
    authDb.run("DELETE FROM keys WHERE key=?", [req.cookies.key], () => {});
    res.clearCookie("key");
    res.clearCookie("lead");
    res.redirect("/login");
});

const httpRedirect = express();
httpRedirect.all("*", (req: express.Request, res: express.Response) => res.redirect(`https://${req.hostname}${req.url}`));
const httpServer = http.createServer(httpRedirect);
httpServer.listen(80, () => console.info(`http redirect server ready`));

// server created and ready for a request
console.info("scouting app ready");
