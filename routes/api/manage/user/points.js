async function updateScout(req, res, transactions, authDb) {
    if (req.user.admin == "true") {
        const setUserScoreStmt = `UPDATE users SET score = score + ? WHERE id=?`;
        const setUserScoreVals = [Number(req.params.modify), req.params.userId];
        authDb.run(setUserScoreStmt, setUserScoreVals, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.params.userId, Number(req.params.reason), Number(req.params.modify)], (err) => {
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