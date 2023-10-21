function detailByID(req, res, db, season) {
    const stmt = "SELECT * FROM main WHERE id=?";
    const values = [req.params.id];
    db.get(stmt, values, (err, dbQueryResult) => {
        if (err || typeof dbQueryResult == "undefined") {
            res.status(500).send("" + 0x1f41);
        } else {
            res.status(200).json(dbQueryResult);
        }
    });
}

module.exports = { detailByID };