function getNotes(req, res, db, season) {
    const stmt = `SELECT * FROM notes WHERE event=? AND season=? AND team=?`;
    const values = [req.params.event, season, req.params.team];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(403)
                .setHeader("Content-type", "text/plain")
                .send("none");
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(403)
                    .setHeader("Content-type", "text/plain")
                    .send("none");
                return;
            } else {
                res.status(200)
                    .setHeader("Content-type", "text/plain")
                    .send(dbQueryResult.note);
            }
        }
    });
}

module.exports = { getNotes };