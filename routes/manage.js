function sanitizeDBName() {
    if (req.query.dbase == "pit") {
        return "pit";
    } else {
        return "main";
    }
}

function mainOrPitLink(type) {
    if (type == "pit") {
        return "pitimages";
    } else {
        return "detail";
    }
}

async function checkIfLeadScout(leadToken) {
    if (req.cookies.lead) {
        if (req.cookies.lead == leadToken) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function manage(req, res, db, dirname, leadToken) {
    const isLeadScout = await checkIfLeadScout(leadToken);
    if (isLeadScout) {
        if (req.query.dbase) {
            const stmt = `SELECT id FROM ${sanitizeDBName()} ORDER BY id ASC`;
            db.all(stmt, (err, dbQueryResult) => {
                if (err) {
                    res.render("../src/manage.ejs", {
                        root: dirname,
                        errorDisplay: "block",
                        errorMessage: "Error: Query Error!",
                        displaySearch: "flex",
                        displayResults: "none",
                        resultsBody: 0,
                    });
                    return;
                } else {
                    if (typeof dbQueryResult == "undefined") {
                        res.render("../src/manage.ejs", {
                            root: dirname,
                            errorDisplay: "block",
                            errorMessage: "Error: Results Undefined!",
                            displaySearch: "flex",
                            displayResults: "none",
                            resultsBody: 0,
                        });
                        return;
                    } else {
                        var listHTML = "";
                        for (var i = dbQueryResult.length - 1; i >= 0; i--) {
                            listHTML =
                                listHTML +
                                `<fieldset style="background-color: "><span><span>ID:&emsp;${
                                    dbQueryResult[i].id
                                }</span>&emsp;&emsp;<span><a href="/${mainOrPitLink(
                                    req.query.dbase
                                )}?id=${
                                    dbQueryResult[i].id
                                }" style="all: unset; color: #2997FF; text-decoration: none;">View</a>&emsp;<span onclick="deleteSubmission('${
                                    req.query.dbase
                                }', ${dbQueryResult[i].id}, '${
                                    req.query.dbase
                                }${
                                    dbQueryResult[i].id
                                }')" style="color: red" id="${req.query.dbase}${
                                    dbQueryResult[i].id
                                }">Delete</span></span></span></fieldset>`;
                        }
                        res.render("../src/manage.ejs", {
                            root: dirname,
                            errorDisplay: "none",
                            errorMessage: null,
                            displaySearch: "none",
                            displayResults: "flex",
                            resultsBody: listHTML,
                        });
                        return;
                    }
                }
            });
        } else {
            res.render("../src/manage.ejs", {
                root: dirname,
                errorDisplay: "none",
                errorMessage: null,
                displaySearch: "flex",
                displayResults: "none",
                resultsBody: 0,
            });
            return;
        }
    } else {
        res.status(401).send("Access Denied!");
    }
}

module.exports = { manage };
