async function slotSpin(req, res, db, transactions) {
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
                res.status(500).send("" + 0x1f42);
                return;
            } else {
                res.status(200).json(
                    `{"spin0": ${spin[0]}, "spin1": ${spin[1]}, "spin2": ${spin[2]}}`
                );
            }
        });
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, "GAMBLE", 766], (err) => {
            if (err) {
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
    } else {
        let pointStmt = `UPDATE scouts SET score = score - 10 WHERE discordID=?`;
        let pointValues = [req.user.id];
        db.run(pointStmt, pointValues, (err) => {
            if (err) {
                res.status(500).send("" + 0x1f42);
                return;
            } else {
                res.status(200).json(
                    `{"spin0": ${spin[0]}, "spin1": ${spin[1]}, "spin2": ${spin[2]}}`
                );
            }
        });
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, "GAMBLE", -10], (err) => {
            if (err) {
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
    }
}

module.exports = { slotSpin };