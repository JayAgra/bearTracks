function getSafeDbName(input) {
    return input === "pit" ? "pit" : "main";
}

async function listSubmissions(req, res, db, leadToken) {
    if (req.cookies.lead === leadToken) {
        const stmt = `SELECT id FROM ${getSafeDbName(req.params.database)} ORDER BY id ASC`;
        db.all(stmt, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("query error");
                return;
            } else {
                res.json(result);
            }
        });
    } else {
        res.status(403).send("403 forbidden");
    }
}

module.exports = { listSubmissions };