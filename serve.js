// CONFIG
/*jslint node: true*/
/*jslint es6*/

"use strict";
const {
    frcapi,
    myteam,
    season,
    scoutteama,
    scoutteamb,
    leadscout,
    drive,
    pit,
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
const seasonProcess = require(`./${season}.js`);
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
var expressWs = require("express-ws")(app, server);
const ejs = require("ejs");
app.set("view engine", "html");
app.engine("html", ejs.renderFile);
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
const DiscordOauth2 = require("discord-oauth2");
const getOauthData = new DiscordOauth2();
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

function logInfo(info) {
    console.log(
        "\x1b[35m",
        "[FORM PROCESSING] ",
        "\x1b[0m" + "\x1b[32m",
        "[INFO] ",
        "\x1b[0m" + info
    );
}

function logErrors(errortodisplay) {
    console.log(
        "\x1b[35m",
        "[FORM PROCESSING] ",
        "\x1b[0m" + "\x1b[31m",
        "[ERROR] ",
        "\x1b[0m" + errortodisplay
    );
    console.log("╰─> " + Date.now);
}

function escapeHTML(htmlStr) {
    return String(htmlStr)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
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

// THIS IS NOT THE DISCORD.JS MODULE, THIS IS THE FILE NAMED DISCORD.JS
const discordSendData = require("./discord.js");

function findTopRole(roles) {
    var rolesOut = [];
    if (roles.indexOf(leadscout) >= 0) {
        rolesOut.push([
            "Lead Scout",
            "rgb(233, 30, 99)",
            "rgba(233, 30, 99, 0.1)",
        ]);
    }
    if (roles.indexOf(drive) >= 0) {
        rolesOut.push([
            "Drive Team",
            "rgb(241, 196, 15)",
            "rgba(241, 196, 15, 0.1)",
        ]);
    }
    if (roles.indexOf(pit) >= 0) {
        rolesOut.push([
            "Pit Team",
            "rgb(230, 126, 34)",
            "rgba(230, 126, 34, 0.1)"
        ]);
    }
    if (roles.indexOf(scoutteama) >= 0) {
        rolesOut.push([
            "Scout Team A",
            "rgb(26, 188, 156)",
            "rgba(26, 188, 156, 0.1)",
        ]);
    }
    if (roles.indexOf(scoutteamb) >= 0) {
        rolesOut.push([
            "Scout Team B",
            "rgb(52, 152, 219)",
            "rgba(52, 152, 219, 0.1)",
        ]);
    }
    rolesOut.push([
        "Default Role",
        "rgb(200, 200, 200)",
        "rgba(200, 200, 200, 0.1)",
    ]);
    return rolesOut;
}

function checkIfLead(roles) {
    return (roles.indexOf(leadscout) >= 0)
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
        return res.status(401).json(JSON.parse(`{"status": 401}`));
    }
    res.status(401).json(JSON.parse(`{"status": 401}`));
}

function checkGamble(req, res, next) {
    let pointStmt = `SELECT score FROM scouts WHERE discordID=?`;
    let pointValues = [req.user.id];
    db.get(pointStmt, pointValues, (err, result) => {
        if (Number(result.score) > -2000) {
            return next();
        } else {
            return res.status(403).json(JSON.parse(`{"status": 403}`));
        }
    });
}

// add scouts to database
function addToDataBase(req, next) {
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
function forwardFRCAPIdata(url, req, res) {
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
            res.status(500).send("error! invalid data");
        } else {
            res.status(200).json(JSON.parse(body));
        }
    });
}

// before server creation
logInfo("Preparing...");

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
    res.clearCookie("role");
    res.clearCookie("connect.sid");
    res.clearCookie("lead");
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
app.post("/submit", checkAuth, (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        // server has all data!
        // parse form
        let formData = qs.parse(body);
        // well, this should never happen but if a pit form is sent to the main form, stop
        if (formData.formType === "pit") {
            res.end("WRONG FORM");
        } else if (formData.formType === "main") {
            // change score based on response length
            var formscoresdj = 0;
            if (formData.overall.length >= 70) {
                // logarithmic points
                formscoresdj = Math.ceil(20 + 5 * (Math.log(formData.overall.length - 65) / Math.log(6)));
            } else {
                formscoresdj = 20;
            }
            // db statement
            let stmt = `INSERT INTO main (event, season, name, team, match, level, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, game21, game22, game23, game24, game25, teleop, defend, driving, overall, discordID, discordName, discordTag, discordAvatarId, weight, analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            // values (escaped!) from POST data
            let values = [
                escapeHTML(formData.event),
                season,
                escapeHTML(req.user.username),
                escapeHTML(formData.team),
                escapeHTML(formData.match),
                escapeHTML(formData.level),
                escapeHTML(formData.game1),
                escapeHTML(formData.game2),
                escapeHTML(formData.game3),
                escapeHTML(formData.game4),
                escapeHTML(formData.game5),
                escapeHTML(formData.game6),
                escapeHTML(formData.game7),
                escapeHTML(formData.game8),
                escapeHTML(formData.game9),
                escapeHTML(formData.game10),
                escapeHTML(formData.game11),
                escapeHTML(formData.game12),
                escapeHTML(formData.game13),
                escapeHTML(formData.game14),
                escapeHTML(formData.game15),
                escapeHTML(formData.game16),
                escapeHTML(formData.game17),
                escapeHTML(formData.game18),
                escapeHTML(formData.game19),
                escapeHTML(formData.game20),
                escapeHTML(formData.game21),
                escapeHTML(formData.game22),
                escapeHTML(formData.game23),
                escapeHTML(formData.game24),
                escapeHTML(formData.game25),
                "dropped",
                escapeHTML(formData.defend),
                escapeHTML(formData.driving),
                escapeHTML(formData.overall),
                escapeHTML(req.user.id),
                escapeHTML(req.user.username),
                escapeHTML(req.user.discriminator),
                escapeHTML(req.user.avatar),
                0,
                "0",
            ];
            // run the statement, add to the database
            db.run(stmt, values, (err) => {
                if (err) {
                    logErrors(err.message);
                    res.end(err.message);
                }
                // announce new submisison to the discord
                discordSendData.newSubmission("main", this.lastID, req.user.username);
                // weight the team performance
                seasonProcess.weightScores(this.lastID);
            });
            // statement to credit points
            let pointStmt = `UPDATE scouts SET score = score + ? WHERE discordID=?`;
            let pointValues = [formscoresdj, req.user.id];
            db.run(pointStmt, pointValues, (err) => {
                if (err) {
                    logErrors(err.message);
                    res.end(err.message);
                }
            });
            // respond to the user with success page
            res.sendFile("src/submitted.html", {
                root: __dirname,
            });
        } else {
            // unknown form type
            return res.status(500).send("unknown form type");
        }
    });
});

// use this thing to do the pit form image thing
const imageUploads = upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
]);
app.post("/submitPit", checkAuth, imageUploads, (req, res) => {
    // get body of POST data
    let formData = req.body;
    // db statement
    let stmt = `INSERT INTO pit (event, season, name, team, drivetype, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, driveTeam, attended, confidence, bqual, overall, discordID, discordName, discordTag, discordAvatarId, image1, image2, image3, image4, image5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    // escaped data from user added as values
    let values = [
        escapeHTML(formData.event),
        season,
        escapeHTML(req.user.username),
        escapeHTML(formData.team),
        escapeHTML(formData.drivetype),
        escapeHTML(formData.game1),
        escapeHTML(formData.game2),
        escapeHTML(formData.game3),
        escapeHTML(formData.game4),
        escapeHTML(formData.game5),
        escapeHTML(formData.game6),
        escapeHTML(formData.game7),
        escapeHTML(formData.game8),
        escapeHTML(formData.game9),
        escapeHTML(formData.game10),
        escapeHTML(formData.game11),
        escapeHTML(formData.game12),
        escapeHTML(formData.game13),
        escapeHTML(formData.game14),
        escapeHTML(formData.game15),
        escapeHTML(formData.game16),
        escapeHTML(formData.game17),
        escapeHTML(formData.game18),
        escapeHTML(formData.game19),
        escapeHTML(formData.game20),
        escapeHTML(formData.driveTeam),
        escapeHTML(formData.attended),
        escapeHTML(formData.confidence),
        escapeHTML(formData.bqual),
        escapeHTML(formData.overall),
        escapeHTML(req.user.id),
        escapeHTML(req.user.username),
        escapeHTML(req.user.discriminator),
        escapeHTML(req.user.avatar),
        req.files.image1[0].filename,
        req.files.image2[0].filename,
        req.files.image3[0].filename,
        req.files.image4[0].filename,
        req.files.image5[0].filename,
    ];
    // run db statement
    db.run(stmt, values, (err) => {
        if (err) {
            logErrors(err.message);
            res.end("pit form error! " + err.message);
        }
        discordSendData.newSubmission("pit", this.lastID, req.user.username);
    });
    // credit points to scout
    // TODO: variable points on pit form
    let pointStmt = `UPDATE scouts SET score = score + 35 WHERE discordID=?`;
    let pointValues = [req.user.id];
    db.run(pointStmt, pointValues, (err) => {
        if (err) {
            logErrors(err.message);
            res.end(err.message);
        }
    });
    // send success message to user
    res.sendFile("src/submitted.html", {
        root: __dirname,
    });
});

// index.html, read the code
app.get("/", checkAuth, async (req, res) => {
    // change index.ejs based on the user's roles
    try {
        if (!req.cookies.role) {
            // set cookie if not exists
            // I am setting a cookie because it takes a while to wait for role data from API

            var oauthDataCookieSet = await Promise.resolve(
                getOauthData.getGuildMember(req.user.accessToken, teamServerID).then((data) => {
                    return findTopRole(data.roles);
                })
            );

            // btoa and atob bad idea
            // Buffer.from(str, 'base64') and buf.toString('base64') instead
            res.cookie("role", JSON.stringify(oauthDataCookieSet), {
                expire: 7200000 + Date.now(),
                sameSite: "Lax",
                secure: true,
                httpOnly: true,
            });
            if (oauthDataCookieSet[0][0] == "Pit Team" || oauthDataCookieSet[0][0] == "Drive Team") {
                res.render("../src/index.ejs", {
                    root: __dirname,
                    order1: "2",
                    order2: "0",
                    order3: "1",
                    order4: "3",
                    additionalURLs: "<span></span>",
                });
            } else if (oauthDataCookieSet[0][0] == "Lead Scout") {
                res.cookie("lead", leadToken, {
                    // 1 hour
                    expire: 3600000 + Date.now(),
                    sameSite: "Lax",
                    secure: true,
                    httpOnly: true,
                });
                res.render("../src/index.ejs", {
                    root: __dirname,
                    order1: "0",
                    order2: "3",
                    order3: "2",
                    order4: "1",
                    additionalURLs: `<a href="manage" class="gameflair1" style="order: 4; margin-bottom: 5%;">Manage Submissions<br></a>`,
                });
            } else {
                res.render("../src/index.ejs", {
                    root: __dirname,
                    order1: "0",
                    order2: "3",
                    order3: "2",
                    order4: "1",
                    additionalURLs: "<span></span>",
                });
            }
        } else {
            var oauthData = JSON.parse(req.cookies.role);
            if (oauthData[0][0] == "Pit Team" || oauthData[0][0] == "Drive Team") {
                res.render("../src/index.ejs", {
                    root: __dirname,
                    order1: "2",
                    order2: "0",
                    order3: "1",
                    order4: "3",
                    additionalURLs: "<span></span>",
                });
            } else if (oauthData[0][0] == "Lead Scout") {
                res.cookie("lead", leadToken, {
                    expire: 7200000 + Date.now(),
                    sameSite: "Lax",
                    secure: true,
                    httpOnly: true,
                });
                res.render("../src/index.ejs", {
                    root: __dirname,
                    order1: "0",
                    order2: "3",
                    order3: "2",
                    order4: "1",
                    additionalURLs: `<a href="manage" class="gameflair1" style="order: 4; margin-bottom: 5%;">Manage Submissions<br></a>`,
                });
            } else {
                res.render("../src/index.ejs", {
                    root: __dirname,
                    order1: "0",
                    order2: "3",
                    order3: "2",
                    order4: "1",
                    additionalURLs: "<span></span>",
                });
            }
        }
    } catch (err) {
        res.render("../src/index.ejs", {
            root: __dirname,
            order1: "0",
            order2: "3",
            order3: "2",
            order4: "1",
            additionalURLs: `<span></span>`,
        });
    }
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
    res.sendFile("./src/fonts/Raleway-300.ttf", { root: __dirname });
});

// font file
app.get("/fonts/Raleway-500.ttf", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/fonts/Raleway-500.ttf", { root: __dirname });
});

// JS for form (should be unused in favor of minified js)
app.get("/form.js", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/form.js", { root: __dirname });
});

// minified JS for form         
app.get("/form.min.js", (req, res) => {
    res.set("Cache-control", "public, max-age=7776000");
    res.sendFile("./src/form.min.js", { root: __dirname });
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
    try {
        res.sendFile("src/denied.html", { root: __dirname });
    } catch (error) {
        // you got denied so hard that you were denied being denied
        res.write("Access Denied!" + "\nCould not render 404 page!");
    }
});

// print out all info discord gives, for debugging
app.get("/info", checkAuth, (req, res) => {
    console.log(req.user.id);
    console.log(req.user.username);
    console.log(req.user.avatar);
    console.log(req.user.discriminator);
    console.log(inTeamServer(req.user.guilds));
    res.json(req.user);
});

// for debugging
app.get("/teamRoleInfo", checkAuth, (req, res) => {
    getOauthData.getGuildMember(req.user.accessToken, teamServerID).then((data) => {
        console.log(data.roles);
    }).catch((error) => {
        console.log(error);
    });
});

// tool to browse match scouting data
app.get("/detail", checkAuth, (req, res) => {
    if (req.query.team && req.query.event && req.query.page) {
        const stmt = `SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id DESC LIMIT 1 OFFSET ?`;
        const values = [req.query.team, req.query.event, season, req.query.page];
        db.get(stmt, values, (err, dbQueryResult) => {
            if (err || typeof dbQueryResult == "undefined") {
                res.render("../src/detail.ejs", {
                    root: __dirname,
                    errorDisplay: "block",
                    errorMessage: "Error: No results!",
                    displaySearch: "flex",
                    displayResults: "none",
                    resultsTeamNumber: 0,
                    resultsMatchNumber: 0,
                    resultsEventCode: 0,
                    resultsBody: 0,
                });
                return;
            } else {
                res.render("../src/detail.ejs", {
                    root: __dirname,
                    errorDisplay: "none",
                    errorMessage: null,
                    displaySearch: "none",
                    displayResults: "flex",
                    resultsTeamNumber: `${dbQueryResult.team}`,
                    resultsMatchNumber: `${dbQueryResult.match}`,
                    resultsEventCode: `${dbQueryResult.event}`,
                    resultsBody: seasonProcess.createHTMLExport(dbQueryResult),
                });
                return;
            }
        });
    } else if (req.query.id) {
        const stmt = `SELECT * FROM main WHERE id=? LIMIT 1`;
        const values = [req.query.id];
        db.get(stmt, values, (err, dbQueryResult) => {
            if (err || typeof dbQueryResult == "undefined") {
                res.render("../src/detail.ejs", {
                    root: __dirname,
                    errorDisplay: "block",
                    errorMessage: "Error: No results!",
                    displaySearch: "flex",
                    displayResults: "none",
                    resultsTeamNumber: 0,
                    resultsMatchNumber: 0,
                    resultsEventCode: 0,
                    resultsBody: 0,
                });
                return;
            } else {
                res.render("../src/detail.ejs", {
                    root: __dirname,
                    errorDisplay: "block",
                    errorMessage: "ID based query, buttons will not work!",
                    displaySearch: "none",
                    displayResults: "flex",
                    resultsTeamNumber: `${dbQueryResult.team}`,
                    resultsMatchNumber: `${dbQueryResult.match}`,
                    resultsEventCode: `${dbQueryResult.event}`,
                    resultsBody: seasonProcess.createHTMLExport(dbQueryResult),
                });
                return;
            }
        });
    } else {
        res.render("../src/detail.ejs", {
            root: __dirname,
            errorDisplay: "none",
            errorMessage: null,
            displaySearch: "flex",
            displayResults: "none",
            resultsTeamNumber: 0,
            resultsMatchNumber: 0,
            resultsEventCode: 0,
            resultsBody: 0,
        });
        return;
    }
});

app.get("/browse", checkAuth, (req, res) => {
    if (req.query.number && req.query.event) {
        if (req.query.number == "ALL" || req.query.number == "*" || req.query.number == "0000" || req.query.number == "0") {
            const stmt = `SELECT * FROM main WHERE event=? AND season=? ORDER BY team ASC`;
            const values = [req.query.event, season];
            db.all(stmt, values, (err, dbQueryResult) => {
                if (err) {
                    res.render("../src/browse.ejs", {
                        root: __dirname,
                        errorDisplay: "block",
                        errorMessage: "Error: No results!",
                        displaySearch: "flex",
                        displayResults: "none",
                        resultsTeamNumber: 0,
                        resultsEventCode: 0,
                        resultsBody: 0,
                        moredata: 0,
                    });
                    return;
                } else {
                    if (typeof dbQueryResult == "undefined") {
                        res.render("../src/browse.ejs", {
                            root: __dirname,
                            errorDisplay: "block",
                            errorMessage: "Error: No results!",
                            displaySearch: "flex",
                            displayResults: "none",
                            resultsTeamNumber: 0,
                            resultsEventCode: 0,
                            resultsBody: 0,
                            moredata: 0,
                        });
                        return;
                    } else {
                        res.render("../src/browse.ejs", {
                            root: __dirname,
                            errorDisplay: "none",
                            errorMessage: null,
                            displaySearch: "none",
                            displayResults: "flex",
                            resultsTeamNumber: `ALL`,
                            resultsEventCode: `${req.query.event}`,
                            resultsBody: seasonProcess.createHTMLTableWithTeamNum(dbQueryResult),
                        });
                        return;
                    }
                }
            });
        } else {
            if (req.query.type === "team") {
                const stmt = `SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id DESC`;
                const values = [req.query.number, req.query.event, season];
                db.all(stmt, values, (err, dbQueryResult) => {
                    if (err || typeof dbQueryResult == "undefined") {
                        res.render("../src/browse.ejs", {
                            root: __dirname,
                            errorDisplay: "block",
                            errorMessage: "Error: No results!",
                            displaySearch: "flex",
                            displayResults: "none",
                            resultsTeamNumber: 0,
                            resultsEventCode: 0,
                            resultsBody: 0,
                        });
                        return;
                    } else {
                        res.render("../src/browse.ejs", {
                            root: __dirname,
                            errorDisplay: "none",
                            errorMessage: null,
                            displaySearch: "none",
                            displayResults: "flex",
                            resultsTeamNumber: `Team ${req.query.number}`,
                            resultsEventCode: `${req.query.event}`,
                            resultsBody: seasonProcess.createHTMLTable(dbQueryResult),
                        });
                        return;
                    }
                });
            } else if (req.query.type === "match") {
                const stmt = `SELECT * FROM main WHERE match=? AND event=? AND season=? ORDER BY id DESC`;
                const values = [req.query.number, req.query.event, season];
                db.all(stmt, values, (err, dbQueryResult) => {
                    if (err || typeof dbQueryResult == "undefined") {
                        res.render("../src/browse.ejs", {
                            root: __dirname,
                            errorDisplay: "block",
                            errorMessage: "Error: No results!",
                            displaySearch: "flex",
                            displayResults: "none",
                            resultsTeamNumber: 0,
                            resultsEventCode: 0,
                            resultsBody: 0,
                        });
                        return;
                    } else {
                        res.render("../src/browse.ejs", {
                            root: __dirname,
                            errorDisplay: "none",
                            errorMessage: null,
                            displaySearch: "none",
                            displayResults: "flex",
                            resultsTeamNumber: `Match ${req.query.number}`,
                            resultsEventCode: `${req.query.event}`,
                            resultsBody: seasonProcess.createHTMLTableWithTeamNum(dbQueryResult),
                        });
                        return;
                    }
                });
            }
        }
    } else if (req.query.discordID) {
        const stmt = `SELECT * FROM main WHERE discordID=? AND season=? ORDER BY id DESC`;
        const values = [req.query.discordID, season];
        db.all(stmt, values, (err, dbQueryResult) => {
            if (err || typeof dbQueryResult == "undefined") {
                res.render("../src/browse.ejs", {
                    root: __dirname,
                    errorDisplay: "block",
                    errorMessage: "Error: No results!",
                    displaySearch: "flex",
                    displayResults: "none",
                    resultsTeamNumber: 0,
                    resultsEventCode: 0,
                    resultsBody: 0,
                });
                return;
            } else {
                res.render("../src/browse.ejs", {
                    root: __dirname,
                    errorDisplay: "none",
                    errorMessage: null,
                    displaySearch: "none",
                    displayResults: "flex",
                    resultsTeamNumber: `Scout ${req.query.discordID}`,
                    resultsEventCode: season,
                    resultsBody: seasonProcess.createHTMLTableWithTeamNum(dbQueryResult),
                });
                return;
            }
        });
    } else {
        res.render("../src/browse.ejs", {
            root: __dirname,
            errorDisplay: "none",
            errorMessage: null,
            displaySearch: "flex",
            displayResults: "none",
            resultsTeamNumber: 0,
            resultsEventCode: 0,
            resultsBody: 0,
        });
        return;
    }
});

app.get("/teams", checkAuth, (req, res) => {
    res.sendFile("src/teams.html", { root: __dirname });
});

app.get("/manage", checkAuth, async (req, res) => {
    async function checkIfLeadScout() {
        if (req.cookies.lead) {
            if (req.cookies.lead == leadToken) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    const isLeadScout = await checkIfLeadScout();

    if (isLeadScout) {
        if (req.query.dbase) {
            function sanitizeDBName() {
                if (req.query.dbase == "pit") {
                    return "pit";
                } else {
                    return "main";
                }
            }
            function mainOrPitLink(type) {
                if (type == "pit") {
                    return "pitimages";
                } else {
                    return "detail";
                }
            }
            const stmt = `SELECT id FROM ${sanitizeDBName()} ORDER BY id ASC`;
            db.all(stmt, (err, dbQueryResult) => {
                if (err) {
                    res.render("../src/manage.ejs", {
                        root: __dirname,
                        errorDisplay: "block",
                        errorMessage: "Error: Query Error!",
                        displaySearch: "flex",
                        displayResults: "none",
                        resultsBody: 0,
                    });
                    return;
                } else {
                    if (typeof dbQueryResult == "undefined") {
                        res.render("../src/manage.ejs", {
                            root: __dirname,
                            errorDisplay: "block",
                            errorMessage: "Error: Results Undefined!",
                            displaySearch: "flex",
                            displayResults: "none",
                            resultsBody: 0,
                        });
                        return;
                    } else {
                        var listHTML = "";
                        for (var i = dbQueryResult.length - 1; i >= 0; i--) {
                        listHTML =
                            listHTML +
                            `<fieldset style="background-color: "><span><span>ID:&emsp;${
                                dbQueryResult[i].id
                            }</span>&emsp;&emsp;<span><a href="/${mainOrPitLink(
                                req.query.dbase
                            )}?id=${
                                dbQueryResult[i].id
                            }" style="all: unset; color: #2997FF; text-decoration: none;">View</a>&emsp;<span onclick="deleteSubmission('${
                                req.query.dbase
                            }', ${dbQueryResult[i].id}, '${req.query.dbase}${
                                dbQueryResult[i].id
                            }')" style="color: red" id="${req.query.dbase}${
                                dbQueryResult[i].id
                            }">Delete</span></span></span></fieldset>`;
                        }
                        res.render("../src/manage.ejs", {
                            root: __dirname,
                            errorDisplay: "none",
                            errorMessage: null,
                            displaySearch: "none",
                            displayResults: "flex",
                            resultsBody: listHTML,
                        });
                        return;
                    }
                }
            });
        } else {
            res.render("../src/manage.ejs", {
                root: __dirname,
                errorDisplay: "none",
                errorMessage: null,
                displaySearch: "flex",
                displayResults: "none",
                resultsBody: 0,
            });
            return;
        }
    } else {
        res.status(401).send("Access Denied!");
    }
});

app.post("/deleteSubmission", checkAuth, async (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        function sanitizeDBName() {
            return ((reqData.db == "pit") ? "pit" : "main");
        }

        let reqData = qs.parse(body);

        async function checkIfLeadScout() {
            if (req.cookies.lead) {
                if (req.cookies.lead == leadToken) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        const isLeadScout = await checkIfLeadScout();

        if (isLeadScout) {
            if (reqData.submissionID && reqData.db) {
                const stmt = `SELECT discordID FROM ${sanitizeDBName()} WHERE id=?`;
                const values = [reqData.submissionID];
                db.get(stmt, values, (err, result) => {
                    const getUserIDstmt = `UPDATE scouts SET score = score - ${((reqData.db == "pit") ? 35 : 25)} WHERE discordID="${result.discordID}"`;
                    db.run(getUserIDstmt, (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
                });
                const deleteStmt = `DELETE FROM ${sanitizeDBName()} WHERE id=?`;
                const deleteValues = [reqData.submissionID];
                db.run(deleteStmt, deleteValues, (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
                res.status(200).send("done!");
            } else {
                res.status(400).send("Bad Request!");
            }
        } else {
            res.status(401).send("Access Denied!");
        }
    });
});

// api

app.get("/api/whoami", apiCheckAuth, (req, res) => {
    res.send(req.user.id);
});

app.get("/api/matches/:season/:event/:level/:all", apiCheckAuth, (req, res) => {
    var teamNumParam = "";
    if (req.params.all === "all") {
        teamNumParam = "&start=&end=";
    } else {
        teamNumParam = `&teamNumber=${myteam}`;
    }
    forwardFRCAPIdata(`/v3.0/${req.params.season}/schedule/${req.params.event}?tournamentLevel=${req.params.level}${teamNumParam}`, req, res)
});

app.get("/api/data/:season/:event/:team", apiCheckAuth, (req, res) => {
    const stmt = `SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id LIMIT 1`;
    const values = [req.params.team, req.params.event, req.params.season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
        } else {
            res.status(200).json(dbQueryResult[0]);
        }
    });
});

app.get("/api/pit/:season/:event/:team", apiCheckAuth, (req, res) => {
    const stmt = `SELECT * FROM pit WHERE team=? AND event=? AND season=? ORDER BY id LIMIT 1`;
    const values = [req.params.team, req.params.event, req.params.season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
        } else {
            res.status(200).json(dbQueryResult[0]);
        }
    });
});

app.get("/api/teams/:season/:event", apiCheckAuth, (req, res) => {
    if (req.params.event) {
        const stmt = `SELECT team, AVG(weight) FROM main WHERE event=? AND season=? GROUP BY team ORDER BY AVG(weight) DESC`;
        const requestedEvent = sanitize(req.params.event);
        const values = [requestedEvent, season];
        db.all(stmt, values, (err, dbQueryResult) => {
            if (err) {
                res.status(500).send("got an error from query");
                return;
            } else {
                if (typeof dbQueryResult == "undefined") {
                    res.status(204).send("no query results");
                } else {
                    var htmltable = ``;
                    for (var i = 0; i < dbQueryResult.length; i++) {
                        htmltable =
                        htmltable +
                        `<tr><td>${i + 1}</td><td><a href="/browse?number=${
                            dbQueryResult[i]["team"]
                        }&type=team&event=${requestedEvent}" style="all: unset; color: #2997FF; text-decoration: none;">${
                            dbQueryResult[i]["team"]
                        }</a></td><td>${Math.round(
                            dbQueryResult[i]["AVG(weight)"]
                        )}%</td><td><progress id="scoreWt" max="100" value="${
                            dbQueryResult[i]["AVG(weight)"]
                        }"></progress></td>`;
                    }
                    res.status(200).setHeader("Content-type", "text/plain").send(htmltable);
                }
            }
        });
    } else {
        res.status(400).send("parameters not provided, or invalid!");
    }
});

app.get("/api/scouts", apiCheckAuth, (req, res) => {
    const stmt = `SELECT * FROM scouts ORDER BY score DESC`;
    db.all(stmt, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(204).send("no query results");
            } else {
                var htmltable = ``;
                for (var i = 0; i < dbQueryResult.length; i++) {
                    htmltable =
                        htmltable +
                        `<tr><td><a href="/browse?discordID=${
                        dbQueryResult[i].discordID
                        }" style="all: unset; color: #2997FF; text-decoration: none;">${
                        dbQueryResult[i].username
                        }#${dbQueryResult[i].discriminator}</a></td><td>${Math.round(
                        dbQueryResult[i].score
                        )}</td></tr>`;
                }
                res.status(200).setHeader("Content-type", "text/plain").send(htmltable);
            }
        }
    });
});

app.get("/api/scouts/:scout/profile", apiCheckAuth, (req, res) => {
    function isMe() {
        if (req.params.scout == "me") {
            return req.user.id;
        } else {
            return req.params.scout;
        }
    }
    const stmt = `SELECT discordID, score, discordProfile, username, discriminator, addedAt, badges FROM scouts WHERE discordID=?`;
    const values = [isMe()];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(204).send("no query results");
            } else {
                res.status(200).json(dbQueryResult);
            }
        }
    });
});

app.get("/api/scoutByID/:discordID", apiCheckAuth, (req, res) => {
    const stmt = `SELECT * FROM scouts WHERE discordID=?`;
    const values = [req.params.discordID];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(204).send("no query results");
            } else {
                res.status(200).setHeader("Content-type", "text/plain").send(`<fieldset><p style="text-align: center;"><img src="https://cdn.discordapp.com/avatars/${dbQueryResult.discordID}/${dbQueryResult.discordProfile}.png?size=512" crossorigin="anonymous"x></p><br><br>Scout Name: ${dbQueryResult.username}#${dbQueryResult.discriminator}<br>Scout Discord: ${dbQueryResult.discordID}<br>Started Scouting: ${dbQueryResult.addedAt}<br>Score: ${dbQueryResult.score}</fieldset>`);
            }
        }
    });
});

// slots API
app.get("/api/casino/slots/slotSpin", apiCheckAuth, (req, res) => {
    const spin = [
        Math.floor(Math.random() * 7 + 1),
        Math.floor(Math.random() * 7 + 1),
        Math.floor(Math.random() * 7 + 1),
    ];
    if (spin[0] === spin[1] && spin[0] === spin[2]) {
        let pointStmt = `UPDATE scouts SET score = score + 766 WHERE discordID=?`;
        let pointValues = [req.user.id];
        db.run(pointStmt, pointValues, (err) => {
            if (err) {
                res.status(500).send("got an error from transaction");
                return;
            } else {
                res.status(200).json(`{"spin0": ${spin[0]}, "spin1": ${spin[1]}, "spin2": ${spin[2]}}`);
            }
        });
    } else {
        let pointStmt = `UPDATE scouts SET score = score - 10 WHERE discordID=?`;
        let pointValues = [req.user.id];
        db.run(pointStmt, pointValues, (err) => {
            if (err) {
                res.status(500).send("got an error from transaction");
                return;
            } else {
                res.status(200).json(`{"spin0": ${spin[0]}, "spin1": ${spin[1]}, "spin2": ${spin[2]}}`);
            }
        });
    }
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
// blackjack websocket
app.ws('/api/casino/blackjack/blackjackSocket', function(ws, req) {
    var cards = [];
    // 0x10 - send user id
    ws.send(0x10);
    ws.on("message", (message) => {
        if (Number(message.split("$")[0]) === 0x11) {
            // 0x12 - recd user id, checking gamble
            // for debug i guess
            ws.send(0x12);
            let okToGamble = db.get("SELECT score FROM scouts WHERE discordID=?", [message.toString()], (err, result) => {
                return result.score > -2000;
            });

            if (!okToGamble) {
                // 0xE1 - not allowed to gamble
                ws.send(0xE1);
                ws.close();
            }
            // 0x13 - user ok to gamble
            ws.send(0x13);
        } else if (message === 0x31) {
            // 0x31 - ready to play, send cards
            
            cards.push(possibleCards[Math.floor(Math.random() * 51)]);
            cards.push(possibleCards[Math.floor(Math.random() * 51)]);
            cards.push(possibleCards[Math.floor(Math.random() * 51)]);

            // 0x32 - sending cards
            ws.send(0x32 + "%%%" + `{"dealt": "card-${cards[0].suit}_${cards[0].value}.png","player0": "card-${cards[1].suit}_${cards[1].value}.png","player1": "card-${cards[2].suit}_${cards[2].value}.png"`);
        }
    });
});

app.get("/api/casino/blackjack/startingCards", apiCheckAuth, checkGamble, (req, res) => {
    const possibleCards = [
        { value: "A", suit: "h" }, { value: 2, suit: "h" },{ value: 3, suit: "h" },{ value: 4, suit: "h" },{ value: 5, suit: "h" },{ value: 6, suit: "h" },{ value: 7, suit: "h" },{ value: 8, suit: "h" },{ value: 9, suit: "h" },{ value: 10, suit: "h" },{ value: "J", suit: "h" },{ value: "Q", suit: "h" },{ value: "K", suit: "h" },
        { value: "A", suit: "d" }, { value: 2, suit: "d" },{ value: 3, suit: "d" },{ value: 4, suit: "d" },{ value: 5, suit: "d" },{ value: 6, suit: "d" },{ value: 7, suit: "d" },{ value: 8, suit: "d" },{ value: 9, suit: "d" },{ value: 10, suit: "d" },{ value: "J", suit: "d" },{ value: "Q", suit: "d" },{ value: "K", suit: "d" },
        { value: "A", suit: "s" }, { value: 2, suit: "s" },{ value: 3, suit: "s" },{ value: 4, suit: "s" },{ value: 5, suit: "s" },{ value: 6, suit: "s" },{ value: 7, suit: "s" },{ value: 8, suit: "s" },{ value: 9, suit: "s" },{ value: 10, suit: "s" },{ value: "J", suit: "s" },{ value: "Q", suit: "s" },{ value: "K", suit: "s" },
        { value: "A", suit: "c" }, { value: 2, suit: "c" },{ value: 3, suit: "c" },{ value: 4, suit: "c" },{ value: 5, suit: "c" },{ value: 6, suit: "c" },{ value: 7, suit: "c" },{ value: 8, suit: "c" },{ value: 9, suit: "c" },{ value: 10, suit: "c" },{ value: "J", suit: "c" },{ value: "Q", suit: "c" },{ value: "K", suit: "c" }
    ];
    var cards = [];
    var cardValues = 0;
    var numOfAces = 0;
    cards.push(possibleCards[Math.floor(Math.random() * 51)]);
    cards.push(possibleCards[Math.floor(Math.random() * 51)]);
    cards.push(possibleCards[Math.floor(Math.random() * 51)]);
    // prevent cards from being duplicated
    if (cards[0] == cards[1] || cards[1] == cards[2] || cards[0] == cards[2]) {
        while (cards[0] == cards[1] || cards[1] == cards[2] || cards[0] == cards[2]) {
            if (cards[0] == cards[1] || cards[1] == cards[2] || cards[0] == cards[2]) {
                cards = [];
                cards.push(possibleCards[Math.floor(Math.random() * 51)]);
                cards.push(possibleCards[Math.floor(Math.random() * 51)]);
                cards.push(possibleCards[Math.floor(Math.random() * 51)]);
            } else {
                break;
            }
        }
    }

    for (var i = 1; i < 3; i++) {
        if (typeof cards[i].value !== "number") {
            if (cards[i].value === "A") {
                numOfAces = numOfAces + 1;
            } else {
                cardValues = cardValues + 10;
            }
        } else {
            cardValues = cardValues + cards[i].value;
        }
    }

    function findDealerTotal() {
        if (typeof cards[0].value !== "number") {
            return 10;
        } else {
            return cards[0].value;
        }
    }

    let pointStmt = `UPDATE scouts SET score = score - 10 WHERE discordID=?`;
    let pointValues = [req.user.id];
    db.run(pointStmt, pointValues, (err) => {
        if (err) {
            res.status(500).send("got an error from transaction");
            return;
        }
    });
    let stmt = `SELECT score FROM scouts WHERE discordID=?`;
    let values = [req.user.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
            return;
        } else {
            res.status(200).json(
                `{"dealt": "card-${cards[0].suit}_${cards[0].value}.png","player0": "card-${cards[1].suit}_${cards[1].value}.png","player1": "card-${cards[2].suit}_${cards[2].value}.png","playerTotal": ${cardValues}, "dealerTotal": ${findDealerTotal()},"casinoToken": "${crypto.createHash('sha1').update(casinoToken + req.user.id + dbQueryResult.score).digest('hex')}","aces": ${numOfAces}}`
            );
        }
    });
});

app.get("/api/casino/blackjack/newCard", apiCheckAuth, (req, res) => {
    // no aces!!
    const possibleCards = [
        { value: 2, suit: "h" },{ value: 3, suit: "h" },{ value: 4, suit: "h" },{ value: 5, suit: "h" },{ value: 6, suit: "h" },{ value: 7, suit: "h" },{ value: 8, suit: "h" },{ value: 9, suit: "h" },{ value: 10, suit: "h" },{ value: "J", suit: "h" },{ value: "Q", suit: "h" },{ value: "K", suit: "h" },
        { value: 2, suit: "d" },{ value: 3, suit: "d" },{ value: 4, suit: "d" },{ value: 5, suit: "d" },{ value: 6, suit: "d" },{ value: 7, suit: "d" },{ value: 8, suit: "d" },{ value: 9, suit: "d" },{ value: 10, suit: "d" },{ value: "J", suit: "d" },{ value: "Q", suit: "d" },{ value: "K", suit: "d" },
        { value: 2, suit: "s" },{ value: 3, suit: "s" },{ value: 4, suit: "s" },{ value: 5, suit: "s" },{ value: 6, suit: "s" },{ value: 7, suit: "s" },{ value: 8, suit: "s" },{ value: 9, suit: "s" },{ value: 10, suit: "s" },{ value: "J", suit: "s" },{ value: "Q", suit: "s" },{ value: "K", suit: "s" },
        { value: 2, suit: "c" },{ value: 3, suit: "c" },{ value: 4, suit: "c" },{ value: 5, suit: "c" },{ value: 6, suit: "c" },{ value: 7, suit: "c" },{ value: 8, suit: "c" },{ value: 9, suit: "c" },{ value: 10, suit: "c" },{ value: "J", suit: "c" },{ value: "Q", suit: "c" },{ value: "K", suit: "c" }
    ];
    var cards = [];
    var cardValue = 0;
    cards.push(possibleCards[Math.floor(Math.random() * 47)]);
    if (typeof cards[0].value !== "number") {
        cardValue = 10;
    } else {
        cardValue = cards[0].value;
    }
    res.status(200).json(
        `{"card": "card-${cards[0].suit}_${cards[0].value}.png", "cardValue": ${cardValue}}`
    );
});

app.get("/api/casino/blackjack/stand/:casinoToken/:playerTotal/:dealerCard", apiCheckAuth, (req, res) => {
    let stmt = `SELECT score FROM scouts WHERE discordID=?`;
    let values = [req.user.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
            return;
        } else {
            if (crypto.createHash('sha1').update(casinoToken + req.user.id + dbQueryResult.score).digest('hex') == req.params.casinoToken) {
                const possibleCards = [
                    { value: "A", suit: "h" }, { value: 2, suit: "h" },{ value: 3, suit: "h" },{ value: 4, suit: "h" },{ value: 5, suit: "h" },{ value: 6, suit: "h" },{ value: 7, suit: "h" },{ value: 8, suit: "h" },{ value: 9, suit: "h" },{ value: 10, suit: "h" },{ value: "J", suit: "h" },{ value: "Q", suit: "h" },{ value: "K", suit: "h" },
                    { value: "A", suit: "d" }, { value: 2, suit: "d" },{ value: 3, suit: "d" },{ value: 4, suit: "d" },{ value: 5, suit: "d" },{ value: 6, suit: "d" },{ value: 7, suit: "d" },{ value: 8, suit: "d" },{ value: 9, suit: "d" },{ value: 10, suit: "d" },{ value: "J", suit: "d" },{ value: "Q", suit: "d" },{ value: "K", suit: "d" },
                    { value: "A", suit: "s" }, { value: 2, suit: "s" },{ value: 3, suit: "s" },{ value: 4, suit: "s" },{ value: 5, suit: "s" },{ value: 6, suit: "s" },{ value: 7, suit: "s" },{ value: 8, suit: "s" },{ value: 9, suit: "s" },{ value: 10, suit: "s" },{ value: "J", suit: "s" },{ value: "Q", suit: "s" },{ value: "K", suit: "s" },
                    { value: "A", suit: "c" }, { value: 2, suit: "c" },{ value: 3, suit: "c" },{ value: 4, suit: "c" },{ value: 5, suit: "c" },{ value: 6, suit: "c" },{ value: 7, suit: "c" },{ value: 8, suit: "c" },{ value: 9, suit: "c" },{ value: 10, suit: "c" },{ value: "J", suit: "c" },{ value: "Q", suit: "c" },{ value: "K", suit: "c" }
                ];
                if (possibleCards[Math.floor(Math.random() * 51)].value + Number(req.params.dealerCard) < Number(req.params.playerTotal)) {
                    if (req.params.playerTotal < 21) {
                        let pointStmt = `UPDATE scouts SET score = score + 20 WHERE discordID=?`;
                        let pointValues = [req.user.id];
                        db.run(pointStmt, pointValues, (err) => {
                            if (err) {
                                res.status(500).send("got an error from transaction");
                                return;
                            }
                        });
                        res.status(200).json(`{"result": "win"}`);
                    } else {
                        res.send("you pig");
                    }
                } else {
                    res.status(200).json(`{"result": "loss"}`);
                }
            } else {
                res.send("cheating");
            }
        }
    });
});

app.get("/api/casino/blackjack/:cval/:casinoToken/wonViaBlackjack", apiCheckAuth, (req, res) => {
    let stmt = `SELECT score FROM scouts WHERE discordID=?`;
    let values = [req.user.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
            return;
        } else {
            if (crypto.createHash('sha1').update(casinoToken + req.user.id + dbQueryResult.score).digest('hex') == req.params.casinoToken) {
                if (req.params.cval == 21) {
                    let pointStmt = `UPDATE scouts SET score = score + 20 WHERE discordID=?`;
                    let pointValues = [req.user.id];
                    db.run(pointStmt, pointValues, (err) => {
                        if (err) {
                            res.status(500).send("got an error from transaction");
                            return;
                        }
                    });
                    res.status(200).send("done");
                } else {
                    res.send("you pig");
                }
            } else {
                res.status(400).send("cheating")
            }
        }
    });
});
// end blackjack API

app.get("/api/casino/spinner/spinWheel", apiCheckAuth, checkGamble, (req, res) => {
    // 12 spins
    const spins = [10, 20, 50, -15, -25, -35, -100, -50, 100, 250, -1000, 1250];

    // weighting (you didnt think this was fair, did you??)
    var spin = Math.floor(Math.random() * 12);
    for (var i = 0; i < 2; i++) {
        if (spin >= 8) {
            spin = Math.floor(Math.random() * 12);
            if (spin >= 9) {
                spin = Math.floor(Math.random() * 12);
                if (spin >= 10) {
                    spin = Math.floor(Math.random() * 12);
                }
            }
        }
    }

    let pointStmt = `UPDATE scouts SET score = score + ? WHERE discordID=?`;
    let pointValues = [spins[spin], req.user.id];
    db.run(pointStmt, pointValues, (err) => {
        if (err) {
            res.status(500).send("got an error from transaction");
            return;
        }
    });

    res.status(200).json(`{"spin": ${spin}}`);
});

// plinko API
app.get("/api/casino/plinko/startGame", apiCheckAuth, (req, res) => {
    let pointStmt = `UPDATE scouts SET score = score - 15 WHERE discordID=?`;
    let pointValues = [req.user.id];
    db.run(pointStmt, pointValues, (err) => {
        if (err) {
            res.status(500).send("got an error from transaction");
            return;
        }
    });
    let stmt = `SELECT score FROM scouts WHERE discordID=?`;
    let values = [req.user.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
            return;
        } else {
            res.status(200).json(`{"token": "${crypto.createHash('sha1').update(casinoToken + req.user.id + dbQueryResult.score).digest('hex')}"}`);
        }
    });
});

app.get("/api/casino/plinko/endGame/:token/:pts", apiCheckAuth, (req, res) => {
    let stmt = `SELECT score FROM scouts WHERE discordID=?`;
    let values = [req.user.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
            return;
        } else {
            if (crypto.createHash('sha1').update(casinoToken + req.user.id + dbQueryResult.score).digest('hex') == req.params.token && req.params.pts <= 75) {
                let pointStmt = `UPDATE scouts SET score = score + ? WHERE discordID=?`;
                let pointValues = [req.params.pts, req.user.id];
                db.run(pointStmt, pointValues, (err) => {
                    if (err) {
                        res.status(500).send("got an error from transaction");
                        return;
                    }
                });
                res.status(200).send("done");
            } else {
                res.status(400).send("cheating")
            }
        }
    });
});
// end plinko

app.get("/api/events/:event/teams", apiCheckAuth, (req, res) => {
    var dbody = new EventEmitter();
    var options = {
        method: "GET",
        hostname: "frc-api.firstinspires.org",
        path: `/v3.0/${season}/teams?eventCode=${req.params.event}`,
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
            res.status(500).send("error! invalid data");
        } else {
            const parsedData = JSON.parse(body);
            var teams = [];
            for (var i = 0; i < parsedData.teams.length; i++) {
                teams.push(parsedData.teams[i].teamNumber);
            }
            res.status(200).setHeader("Content-type", "text/plain").send(teams.toString());
        }
    });
});

app.get("/api/events/:event/allTeamData", apiCheckAuth, (req, res) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?eventCode=${req.params.event}`, req, res);
});

app.get("/api/events/current/allData", apiCheckAuth, (req, res) => {
    forwardFRCAPIdata(`/v3.0/${season}/teams?eventCode=${currentComp}`, req, res);
});

app.get("/api/events/:event/pitscoutedteams", apiCheckAuth, (req, res) => {
    var teams = [];
    const stmt = `SELECT * FROM pit WHERE event=? AND season=?`;
    const values = [req.params.event, season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("error!");
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(500).send("fail");
                return;
            } else {
                for (var i = 0; i < dbQueryResult.length; i++) {
                    teams.push(dbQueryResult[i].team);
                }
                res.status(200).setHeader("Content-type", "text/plain").send(teams.toString());
            }
        }
    });
});

app.get("/api/notes/:event/:team/getNotes", apiCheckAuth, (req, res) => {
    const stmt = `SELECT * FROM notes WHERE event=? AND season=? AND team=?`;
    const values = [req.params.event, season, req.params.team];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(403).setHeader("Content-type", "text/plain").send("none");
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(403).setHeader("Content-type", "text/plain").send("none");
                return;
            } else {
                res.status(200).setHeader("Content-type", "text/plain").send(dbQueryResult.note);
            }
        }
    });
});

app.get("/api/notes/:event/:team/createNote", apiCheckAuth, (req, res) => {
    const stmt = "INSERT INTO notes (team, season, event, note) VALUES(?, ?, ?, 'no note yet')"
    const values = [req.params.team, season, req.params.event];
    db.run(stmt, values, (err) => {
        if (err) {
            res.status(500).send("500");
        } else {
            res.status(200).send("200");
        }
    });
});

app.post("/api/notes/:event/:team/updateNotes", apiCheckAuth, (req, res) => {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        let newNote = qs.parse(body);
        var teams = [];
        const stmt = `UPDATE notes SET note=? WHERE event=? AND season=? AND team=?`;
        const values = [newNote.save, req.params.event, season, req.params.team];
        db.run(stmt, values, (err) => {
            if (err) {
                res.status(500).send("error!");
                return;
            } else {
                res.status(200).send("200");
            }
        });
    });
});

app.get("/api/teams/teamdata/:team", apiCheckAuth, (req, res) => {
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
        logInfo(`HTTP server listening: http://localhost`)
    );
}

// server created and ready for a request
logInfo("Ready!");