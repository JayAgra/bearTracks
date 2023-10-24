function scouts(req, res, authDb) {
    const stmt = `SELECT id, nickName, score, accessOk FROM users ORDER BY score DESC`;
    authDb.all(stmt, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
            return;
        } else {
            res.status(200).json(dbQueryResult);
        }
    });
}

module.exports = { scouts };