async function slotSpin(req, res, db) {
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
                res.status(200).json(
                    `{"spin0": ${spin[0]}, "spin1": ${spin[1]}, "spin2": ${spin[2]}}`
                );
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
                res.status(200).json(
                    `{"spin0": ${spin[0]}, "spin1": ${spin[1]}, "spin2": ${spin[2]}}`
                );
            }
        });
    }
}

module.exports = { slotSpin };