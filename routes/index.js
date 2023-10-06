const DiscordOauth2 = require("discord-oauth2");
const getOauthData = new DiscordOauth2();

const {
    leadscout,
    teamServerID
} = require("../config.json");

function isLeadScout(roles) {
    return (roles.indexOf(leadscout) >= 0);
}

async function index(req, res, dirname, leadToken) {
    // change index.ejs based on the user's roles
    try {
        if (!req.cookies.lead) {
            // client does not have lead cookie
            // is client a lead scout?
            if (await Promise.resolve(getOauthData.getGuildMember(req.user.accessToken, teamServerID).then((data) => {return isLeadScout(data.roles);}))) {
                // if yes, send the cookie and load page as lead scout
                res.cookie("lead", leadToken, {
                    expire: 1800000 + Date.now(),
                    sameSite: "Lax",
                    secure: true,
                    httpOnly: true,
                });
                // send this one too, visible to client js
                res.cookie("isLead", "true", {
                    expire: 72000000 + Date.now(),
                    sameSite: "Lax",
                    secure: true,
                    httpOnly: false,
                });
            } else {
                res.cookie("isLead", "false", {
                    expire: 72000000 + Date.now(),
                    sameSite: "Lax",
                    secure: true,
                    httpOnly: false,
                });
            }
            res.sendFile("src/index.html", {
                root: dirname,
            });
        } else {
            if (req.cookies.lead !== leadToken) {
                if (await Promise.resolve(getOauthData.getGuildMember(req.user.accessToken, teamServerID).then((data) => {return isLeadScout(data.roles);}))) {
                    // if yes, send the cookie and load page as lead scout
                    res.cookie("lead", leadToken, {
                        expire: 1800000 + Date.now(),
                        sameSite: "Lax",
                        secure: true,
                        httpOnly: true,
                    });
                    // send this one too, visible to client js
                    res.cookie("isLead", "true", {
                        expire: 72000000 + Date.now(),
                        sameSite: "Lax",
                        secure: true,
                        httpOnly: false,
                    });
                } else {
                    res.cookie("isLead", "false", {
                        expire: 72000000 + Date.now(),
                        sameSite: "Lax",
                        secure: true,
                        httpOnly: false,
                    });
                    res.clearCookie("lead");
                }
            }
            // send index.html
            res.sendFile("src/index.html", {
                root: dirname,
            })
        }
    } catch (err) {
        res.sendFile("src/index.html", {
            root: dirname,
        })
    }
}

module.exports = { index };
