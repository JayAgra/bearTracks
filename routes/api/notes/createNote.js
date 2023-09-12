function createNote(req, res, db) {
    const stmt = "INSERT INTO notes (team, season, event, note) VALUES(?, ?, ?, 'no note yet')"
    const values = [req.params.team, season, req.params.event];
    db.run(stmt, values, (err) => {
        if (err) {
            res.status(500).send("500");
        } else {
            res.status(200).send("200");
        }
    });
}

module.exports = { createNote };