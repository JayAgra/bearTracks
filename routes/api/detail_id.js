async function formDetailId(req, res, db) {
    const stmt = `SELECT * FROM main WHERE id=? LIMIT 1`;
    const values = [req.params.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
            return;
        } else if (typeof dbQueryResult == "undefined") {
            res.status(204).send("" + 0xcc1);
            return;
        } else {
            res.json(dbQueryResult);
            return;
        }
    });
}

module.exports = { formDetailId };