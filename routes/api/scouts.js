function scouts(req, res, db) {
    const stmt = `SELECT discordID, username, score FROM scouts ORDER BY score DESC`;
    db.all(stmt, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
            return;
        } else {
            res.status(200).json(dbQueryResult);
        }
    });
}

module.exports = { scouts };