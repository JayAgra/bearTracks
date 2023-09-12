function pit(req, res, db) {
    const stmt = `SELECT * FROM pit WHERE team=? AND event=? AND season=? ORDER BY id LIMIT 1`;
    const values = [req.params.team, req.params.event, req.params.season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("got an error from query");
        } else {
            res.status(200).json(dbQueryResult[0]);
        }
    });
}

module.exports = { pit };