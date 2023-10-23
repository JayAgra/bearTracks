function scoutTransactions(req, res, transactions) {
    const stmt = "SELECT type, amount FROM transactions WHERE userId = ?";
    transactions.all(stmt, [req.user.id], (err, result) => {
        if (err || typeof result == "undefined") {
            res.status(500).send("" + 0x1f41);
        } else {
            if (result.length === 0) {
                res.status(204).send("" + 0xcc1);
            } else {
                res.status(200).json(result);
            }
        }
    });
}

module.exports = { scoutTransactions };