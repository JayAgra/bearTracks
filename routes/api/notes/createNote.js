async function createNote(req, res, db, season) {
    const stmt =
        "INSERT INTO notes (team, season, event, note) VALUES(?, ?, ?, 'no note yet')";
    const values = [req.params.team, season, req.params.event];
    db.run(stmt, values, (err) => {
        if (err) {
            res.status(500).send(0x1f41);
        } else {
            res.status(200).send(0xc81);
        }
    });
}

module.exports = { createNote };