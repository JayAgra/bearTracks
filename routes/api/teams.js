function addProperty(object, property, amount) {
    if (object[property] !== undefined) {
        object[property] += amount;
    } else {
        object[property] = 0;
        addProperty(object, property, amount);
    }
}

function teams(req, res, db, season) {
    if (req.params.event && req.params.type) {
        const stmt = `SELECT team, weight FROM main WHERE event=? AND season=? GROUP BY team`;
        const values = [req.params.event, season];
        db.all(stmt, values, (err, dbQueryResult) => {
            if (err) {
                res.status(500).send("" + 0x1f41);
                return;
            } else {
                if (typeof dbQueryResult == "undefined") {
                    res.status(204).send("" + 0xcc1);
                } else {
                    var teams = {};
                    var teamsCount = {};
                    dbQueryResult.forEach((e) => {
                        addProperty(teams, e.team, Number(e.weight.split(",")[Number(req.params.type)]));
                        addProperty(teamsCount, e.team, 1);
                    });
                    res.status(200).json(dbQueryResult);
                }
            }
        });
    } else {
        res.status(400).send("" + 0x1900);
    }
}

module.exports = { teams };
