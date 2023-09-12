const sanitize = require("sanitize-filename");

function teams(req, res, db, season) {
    if (req.params.event) {
        const stmt = `SELECT team, AVG(weight) FROM main WHERE event=? AND season=? GROUP BY team ORDER BY AVG(weight) DESC`;
        const requestedEvent = sanitize(req.params.event);
        const values = [requestedEvent, season];
        db.all(stmt, values, (err, dbQueryResult) => {
            if (err) {
                res.status(500).send("got an error from query");
                return;
            } else {
                if (typeof dbQueryResult == "undefined") {
                    res.status(204).send("no query results");
                } else {
                    var htmltable = ``;
                    for (var i = 0; i < dbQueryResult.length; i++) {
                        htmltable =
                            htmltable +
                            `<tr><td>${i + 1}</td><td><a href="/browse?number=${
                                dbQueryResult[i]["team"]
                            }&type=team&event=${requestedEvent}" style="all: unset; color: #2997FF; text-decoration: none;">${
                                dbQueryResult[i]["team"]
                            }</a></td><td>${Math.round(
                                dbQueryResult[i]["AVG(weight)"]
                            )}%</td><td><progress id="scoreWt" max="100" value="${
                                dbQueryResult[i]["AVG(weight)"]
                            }"></progress></td>`;
                    }
                    res.status(200)
                        .setHeader("Content-type", "text/plain")
                        .send(htmltable);
                }
            }
        });
    } else {
        res.status(400).send("parameters not provided, or invalid!");
    }
}

module.exports = { teams };
