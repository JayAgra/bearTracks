function detailBySpecs(req, res, db, season) {
    const stmt = "SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id DESC LIMIT 1 OFFSET ?";
    const values = [req.params.team, req.params.event, season, req.params.page];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err || typeof dbQueryResult == "undefined") {
            res.status(500).send("" + 0x1f41);
        } else {
            res.status(200).json(dbQueryResult);
        }
    });
}

module.exports = { detailBySpecs };