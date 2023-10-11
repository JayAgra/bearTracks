const DiscordOauth2 = require("discord-oauth2");
const getOauthData = new DiscordOauth2();

const { leadscout, teamServerID } = require("../../../config.json");
const isLeadScout = (roles) => {return roles.indexOf(leadscout) >= 0};

function getSafeDbName(input) {
    return input === "pit" ? "pit" : "main";
}

async function deleteSubmission(req, res, db, leadToken) {
    if (req.cookies.lead === leadToken) {
        const stmt = `SELECT discordID FROM ${getSafeDbName(req.params.database)} WHERE id=?`;
        const values = [req.params.submissionId];
        await db.get(stmt, values, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("" + 0x1f41);
                return;
            }
            const getUserIDstmt = `UPDATE scouts SET score = score - ? WHERE discordID=?`;
            const getUserIdValues = [(req.params.database == "pit" ? 35 : 25), result.discordID];
            db.run(getUserIDstmt, getUserIdValues, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send("" + 0x1f42);
                    return;
                }
            });
        });
        const deleteStmt = `DELETE FROM ${getSafeDbName(req.params.database)} WHERE id=?`;
        db.run(deleteStmt, values, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
        res.status(200).send("" + 0xc83);
    } else {
        res.status(403).send("" + 0x1931);
    }
}

module.exports = { deleteSubmission };