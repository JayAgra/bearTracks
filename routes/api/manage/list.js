function getSafeDbName(input) {
    return input === "pit" ? "pit" : "main";
}

async function listSubmissions(req, res, db, leadToken) {
    if (req.cookies.lead === leadToken) {
        const stmt = `SELECT id FROM ${getSafeDbName(req.params.database)} ORDER BY id ASC`;
        db.all(stmt, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("" + 0x1f41);
                return;
            } else {
                res.json(result);
            }
        });
    } else {
        res.status(403).send("" + 0x1931);
    }
}

module.exports = { listSubmissions };