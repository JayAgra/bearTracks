function scoutByID(req, res, authDb) {
    const stmt = `SELECT id, fullName, nickName, admin, accessOk, recentAttempts, lastLogin, score FROM users WHERE id=?`;
    const values = [req.params.userId];
    authDb.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(204).send("" + 0xcc1);
            } else {
                res.status(200).json(dbQueryResult);
            }
        }
    });
}

module.exports = { scoutByID };