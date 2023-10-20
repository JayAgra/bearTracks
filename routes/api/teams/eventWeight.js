async function teamsByEvent(req, res, db, season) {
    const stmt = `SELECT weight FROM main WHERE team=? AND event=? AND season=?`;
    const values = [req.params.team, req.params.event, season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
        } else {
            res.status(200).json(dbQueryResult);
        }
    });
}

module.exports = { teamsByEvent };