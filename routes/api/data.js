function data(req, res, db) {
    const stmt = `SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id LIMIT 1`;
    const values = [req.params.team, req.params.event, req.params.season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
        } else {
            res.status(200).json(dbQueryResult[0]);
        }
    });
}

module.exports = { data };