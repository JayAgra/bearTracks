function browse(req, res, db, dirname, season) {
    if (req.query.number && req.query.event) {
        if (req.query.number == "ALL" || req.query.number == "*" || req.query.number == "0000" || req.query.number == "0") {
            const stmt = `SELECT * FROM main WHERE event=? AND season=? ORDER BY team ASC`;
            const values = [req.query.event, season];
            db.all(stmt, values, (err, dbQueryResult) => {
                if (err) {
                    res.render("../src/browse.ejs", {
                        root: dirname,
                        errorDisplay: "block",
                        errorMessage: "Error: No results!",
                        displaySearch: "flex",
                        displayResults: "none",
                        resultsTeamNumber: 0,
                        resultsEventCode: 0,
                        resultsBody: 0,
                        moredata: 0,
                    });
                    return;
                } else {
                    if (typeof dbQueryResult == "undefined") {
                        res.render("../src/browse.ejs", {
                            root: dirname,
                            errorDisplay: "block",
                            errorMessage: "Error: No results!",
                            displaySearch: "flex",
                            displayResults: "none",
                            resultsTeamNumber: 0,
                            resultsEventCode: 0,
                            resultsBody: 0,
                            moredata: 0,
                        });
                        return;
                    } else {
                        res.render("../src/browse.ejs", {
                            root: dirname,
                            errorDisplay: "none",
                            errorMessage: null,
                            displaySearch: "none",
                            displayResults: "flex",
                            resultsTeamNumber: `ALL`,
                            resultsEventCode: `${req.query.event}`,
                            resultsBody: seasonProcess.createHTMLTableWithTeamNum(dbQueryResult),
                        });
                        return;
                    }
                }
            });
        } else {
            if (req.query.type === "team") {
                const stmt = `SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id DESC`;
                const values = [req.query.number, req.query.event, season];
                db.all(stmt, values, (err, dbQueryResult) => {
                    if (err || typeof dbQueryResult == "undefined") {
                        res.render("../src/browse.ejs", {
                            root: dirname,
                            errorDisplay: "block",
                            errorMessage: "Error: No results!",
                            displaySearch: "flex",
                            displayResults: "none",
                            resultsTeamNumber: 0,
                            resultsEventCode: 0,
                            resultsBody: 0,
                        });
                        return;
                    } else {
                        res.render("../src/browse.ejs", {
                            root: dirname,
                            errorDisplay: "none",
                            errorMessage: null,
                            displaySearch: "none",
                            displayResults: "flex",
                            resultsTeamNumber: `Team ${req.query.number}`,
                            resultsEventCode: `${req.query.event}`,
                            resultsBody: require(`../${season}.js`).createHTMLTable(dbQueryResult),
                        });
                        return;
                    }
                });
            } else if (req.query.type === "match") {
                const stmt = `SELECT * FROM main WHERE match=? AND event=? AND season=? ORDER BY id DESC`;
                const values = [req.query.number, req.query.event, season];
                db.all(stmt, values, (err, dbQueryResult) => {
                    if (err || typeof dbQueryResult == "undefined") {
                        res.render("../src/browse.ejs", {
                            root: dirname,
                            errorDisplay: "block",
                            errorMessage: "Error: No results!",
                            displaySearch: "flex",
                            displayResults: "none",
                            resultsTeamNumber: 0,
                            resultsEventCode: 0,
                            resultsBody: 0,
                        });
                        return;
                    } else {
                        res.render("../src/browse.ejs", {
                            root: dirname,
                            errorDisplay: "none",
                            errorMessage: null,
                            displaySearch: "none",
                            displayResults: "flex",
                            resultsTeamNumber: `Match ${req.query.number}`,
                            resultsEventCode: `${req.query.event}`,
                            resultsBody: require(`../${season}.js`).createHTMLTableWithTeamNum(dbQueryResult),
                        });
                        return;
                    }
                });
            }
        }
    } else if (req.query.discordID) {
        const stmt = `SELECT * FROM main WHERE discordID=? AND season=? ORDER BY id DESC`;
        const values = [req.query.discordID, season];
        db.all(stmt, values, (err, dbQueryResult) => {
            if (err || typeof dbQueryResult == "undefined") {
                res.render("../src/browse.ejs", {
                    root: dirname,
                    errorDisplay: "block",
                    errorMessage: "Error: No results!",
                    displaySearch: "flex",
                    displayResults: "none",
                    resultsTeamNumber: 0,
                    resultsEventCode: 0,
                    resultsBody: 0,
                });
                return;
            } else {
                res.render("../src/browse.ejs", {
                    root: dirname,
                    errorDisplay: "none",
                    errorMessage: null,
                    displaySearch: "none",
                    displayResults: "flex",
                    resultsTeamNumber: `Scout ${req.query.discordID}`,
                    resultsEventCode: season,
                    resultsBody: require(`../${season}.js`).createHTMLTableWithTeamNum(dbQueryResult),
                });
                return;
            }
        });
    } else {
        res.render("../src/browse.ejs", {
            root: dirname,
            errorDisplay: "none",
            errorMessage: null,
            displaySearch: "flex",
            displayResults: "none",
            resultsTeamNumber: 0,
            resultsEventCode: 0,
            resultsBody: 0,
        });
        return;
    }
}

module.exports = { browse };