function teams(req, res, db, season) {
    if (req.params.event) {
        const stmt = `SELECT team, weight FROM main WHERE event=? AND season=?`;
        const values = [req.params.event, season];
        db.all(stmt, values, (err, dbQueryResult) => {
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
    } else {
        res.status(400).send("" + 0x1900);
    }
}

module.exports = { teams };
