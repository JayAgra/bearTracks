async function pitscoutedteams(req, res, db, season) {
    var teams = [];
    const stmt = `SELECT * FROM pit WHERE event=? AND season=?`;
    const values = [req.params.event, season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send(0x1f41);
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(200).setHeader("Content-type", "text/plain").send("");
            } else {
                for (var i = 0; i < dbQueryResult.length; i++) {
                    teams.push(dbQueryResult[i].team);
                }
                res.status(200)
                    .setHeader("Content-type", "text/plain")
                    .send(teams.toString());
            }
        }
    });
}

module.exports = { pitscoutedteams };