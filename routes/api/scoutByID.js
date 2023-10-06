function scoutByID(req, res, db) {
    const stmt = `SELECT * FROM scouts WHERE discordID=?`;
    const values = [req.params.discordID];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send(0x1f41);
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(204).send(0xcc1);
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