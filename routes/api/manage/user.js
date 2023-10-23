async function updateScout(req, res, db, transactions, leadToken) {
    if (req.cookies.lead === leadToken) {
        const setUserScoreStmt = `UPDATE scouts SET score = score + ? WHERE discordID=?`;
        const setUserScoreVals = [Number(req.params.modify), req.params.discordID];
        db.run(setUserScoreStmt, setUserScoreVals, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.params.discordID, "MANUALUPDATE", Number(req.params.modify)], (err) => {
            if (err) {
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
        res.status(200).send("" + 0xc84);
    } else {
        res.status(403).send("" + 0x1931);
    }
}

module.exports = { updateScout };