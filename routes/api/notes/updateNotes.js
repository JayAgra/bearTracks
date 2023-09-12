function updateNotes(req, res, db) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        let newNote = qs.parse(body);
        var teams = [];
        const stmt = `UPDATE notes SET note=? WHERE event=? AND season=? AND team=?`;
        const values = [newNote.save, req.params.event, season, req.params.team];
        db.run(stmt, values, (err) => {
            if (err) {
                res.status(500).send("error!");
                return;
            } else {
                res.status(200).send("200");
            }
        });
    });
}

module.exports = { updateNotes };