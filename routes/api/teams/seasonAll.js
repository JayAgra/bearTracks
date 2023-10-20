async function teamsBySeasonAll(req, res, db, season) {
    const stmt = `SELECT * FROM main WHERE team=? AND season=?`;
    const values = [req.params.team, season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
        } else {
            res.status(200).json(dbQueryResult);
        }
    });
}

module.exports = { teamsBySeasonAll };
