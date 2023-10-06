const crypto = require("crypto");

async function startGame(req, res, db, casinoToken) {
    let pointStmt = `UPDATE scouts SET score = score - 15 WHERE discordID=?`;
    let pointValues = [req.user.id];
    db.run(pointStmt, pointValues, (err) => {
        if (err) {
            res.status(500).send("" + 0x1f42);
            return;
        }
    });
    let stmt = `SELECT score FROM scouts WHERE discordID=?`;
    let values = [req.user.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
            return;
        } else {
            res.status(200).json(
                `{"token": "${crypto
                    .createHash("sha1")
                    .update(casinoToken + req.user.id + dbQueryResult.score)
                    .digest("hex")}"}`
            );
        }
    });
}

module.exports = { startGame };