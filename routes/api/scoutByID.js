function scoutByID(req, res, db) {
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
                res.status(200)
                    .setHeader("Content-type", "text/plain")
                    .send(
                        `<fieldset><p style="text-align: center;"><img src="https://cdn.discordapp.com/avatars/${dbQueryResult.discordID}/${dbQueryResult.discordProfile}.png?size=512" crossorigin="anonymous"x></p><br><br>Scout Name: ${dbQueryResult.username}#${dbQueryResult.discriminator}<br>Scout Discord: ${dbQueryResult.discordID}<br>Started Scouting: ${dbQueryResult.addedAt}<br>Score: ${dbQueryResult.score}</fieldset>`
                    );
            }
        }
    });
}

module.exports = { scoutByID };