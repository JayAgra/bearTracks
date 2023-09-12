function pitscoutedteams(req, res, db) {
    var teams = [];
    const stmt = `SELECT * FROM pit WHERE event=? AND season=?`;
    const values = [req.params.event, season];
    db.all(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("error!");
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(500).send("fail");
                return;
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