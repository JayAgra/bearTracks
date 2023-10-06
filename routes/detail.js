async function detail(req, res, db, dirname, season) {
    if (req.query.team && req.query.event && req.query.page) {
        const stmt = `SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id DESC LIMIT 1 OFFSET ?`;
        const values = [
            req.query.team,
            req.query.event,
            season,
            req.query.page,
        ];
        db.get(stmt, values, (err, dbQueryResult) => {
            if (err || typeof dbQueryResult == "undefined") {
                res.render("../src/detail.ejs", {
                    root: dirname,
                    errorDisplay: "block",
                    errorMessage: "Error: No results!",
                    displaySearch: "flex",
                    displayResults: "none",
                    resultsTeamNumber: 0,
                    resultsMatchNumber: 0,
                    resultsEventCode: 0,
                    resultsBody: 0,
                });
                return;
            } else {
                res.render("../src/detail.ejs", {
                    root: dirname,
                    errorDisplay: "none",
                    errorMessage: null,
                    displaySearch: "none",
                    displayResults: "flex",
                    resultsTeamNumber: `${dbQueryResult.team}`,
                    resultsMatchNumber: `${dbQueryResult.match}`,
                    resultsEventCode: `${dbQueryResult.event}`,
                    resultsBody: require(`./${season}.js`).createHTMLExport(dbQueryResult),
                });
                return;
            }
        });
    } else if (req.query.id) {
        const stmt = `SELECT * FROM main WHERE id=? LIMIT 1`;
        const values = [req.query.id];
        db.get(stmt, values, (err, dbQueryResult) => {
            if (err || typeof dbQueryResult == "undefined") {
                res.render("../src/detail.ejs", {
                    root: dirname,
                    errorDisplay: "block",
                    errorMessage: "Error: No results!",
                    displaySearch: "flex",
                    displayResults: "none",
                    resultsTeamNumber: 0,
                    resultsMatchNumber: 0,
                    resultsEventCode: 0,
                    resultsBody: 0,
                });
                return;
            } else {
                res.render("../src/detail.ejs", {
                    root: dirname,
                    errorDisplay: "block",
                    errorMessage: "ID based query, buttons will not work!",
                    displaySearch: "none",
                    displayResults: "flex",
                    resultsTeamNumber: `${dbQueryResult.team}`,
                    resultsMatchNumber: `${dbQueryResult.match}`,
                    resultsEventCode: `${dbQueryResult.event}`,
                    resultsBody: require(`./${season}.js`).createHTMLExport(dbQueryResult),
                });
                return;
            }
        });
    } else {
        res.render("../src/detail.ejs", {
            root: dirname,
            errorDisplay: "none",
            errorMessage: null,
            displaySearch: "flex",
            displayResults: "none",
            resultsTeamNumber: 0,
            resultsMatchNumber: 0,
            resultsEventCode: 0,
            resultsBody: 0,
        });
        return;
    }
}

module.exports = { detail };