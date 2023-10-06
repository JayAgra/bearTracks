const crypto = require("crypto");

async function stand(req, res, db, possibleCards, casinoToken) {
    let stmt = `SELECT score FROM scouts WHERE discordID=?`;
    let values = [req.user.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
            return;
        } else {
            if (crypto.createHash("sha1").update(casinoToken + req.user.id + dbQueryResult.score).digest("hex") == req.params.casinoToken) {
                if (possibleCards[Math.floor(Math.random() * 51)].value + Number(req.params.dealerCard) < Number(req.params.playerTotal)) {
                    if (req.params.playerTotal < 21) {
                        let pointStmt = `UPDATE scouts SET score = score + 20 WHERE discordID=?`;
                        let pointValues = [req.user.id];
                        db.run(pointStmt, pointValues, (err) => {
                            if (err) {
                                res.status(500).send("" + 0x1f42);
                                return;
                            }
                        });
                        res.status(200).json(`{"result": "win"}`);
                    } else {
                        res.status(400).send("" + 0x1901);
                    }
                } else {
                    res.status(200).json(`{"result": "loss"}`);
                }
            } else {
                res.status(400).send("" + 0x1901);
            }
        }
    });
}

module.exports = { stand };
