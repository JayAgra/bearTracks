const DiscordOauth2 = require("discord-oauth2");
const getOauthData = new DiscordOauth2();

const {
    scoutteama,
    scoutteamb,
    leadscout,
    drive,
    pit,
    teamServerID
} = require("../config.json");

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
            "rgba(230, 126, 34, 0.1)",
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

async function index(req, res, db, dirname, leadToken) {
    // change index.ejs based on the user's roles
    try {
        if (!req.cookies.role) {
            // set cookie if not exists
            // I am setting a cookie because it takes a while to wait for role data from API

            if (oauthDataCookieSet[0][0] === "Lead Scout") {
                res.cookie("lead", leadToken, {
                    expire: 7200000 + Date.now(),
                    sameSite: "Lax",
                    secure: true,
                    httpOnly: true,
                });
            }

            var oauthDataCookieSet = await Promise.resolve(
                getOauthData
                    .getGuildMember(req.user.accessToken, teamServerID)
                    .then((data) => {
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
            if (
                oauthDataCookieSet[0][0] == "Pit Team" ||
                oauthDataCookieSet[0][0] == "Drive Team"
            ) {
                res.render("../src/index.ejs", {
                    root: dirname,
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
                    root: dirname,
                    order1: "0",
                    order2: "3",
                    order3: "2",
                    order4: "1",
                    additionalURLs: `<a href="manage" class="gameflair1" style="order: 4; margin-bottom: 5%;">Manage Submissions<br></a>`,
                });
            } else {
                res.render("../src/index.ejs", {
                    root: dirname,
                    order1: "0",
                    order2: "3",
                    order3: "2",
                    order4: "1",
                    additionalURLs: "<span></span>",
                });
            }
        } else {
            var oauthData = JSON.parse(req.cookies.role);

            if (oauthData[0][0] === "Lead Scout") {
                res.cookie("lead", leadToken, {
                    expire: 7200000 + Date.now(),
                    sameSite: "Lax",
                    secure: true,
                    httpOnly: true,
                });
            }

            if (
                oauthData[0][0] == "Pit Team" ||
                oauthData[0][0] == "Drive Team"
            ) {
                res.render("../src/index.ejs", {
                    root: dirname,
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
                    root: dirname,
                    order1: "0",
                    order2: "3",
                    order3: "2",
                    order4: "1",
                    additionalURLs: `<a href="manage" class="gameflair1" style="order: 4; margin-bottom: 5%;">Manage Submissions<br></a>`,
                });
            } else {
                res.render("../src/index.ejs", {
                    root: dirname,
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
            root: dirname,
            order1: "0",
            order2: "3",
            order3: "2",
            order4: "1",
            additionalURLs: `<span></span>`,
        });
    }
}

module.exports = { index };
