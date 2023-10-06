async function listSubmissions(req, res, db, leadToken) {
    if (req.cookies.lead === leadToken) {
        const stmt = "SELECT id FROM ? ORDER BY id ASC";
        const values = [req.params.database];
        db.all(stmt, values, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("query error");
                return;
            } else {
                res.json(JSON.stringify(result));
            }
        });
    } else {
        res.status(403).send("403 forbidden");
    }
}

module.exports = { listSubmissions };