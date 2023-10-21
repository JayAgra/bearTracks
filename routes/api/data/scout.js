function getScoutResponses(req, res, db, season) {
    const stmt = "SELECT * FROM main WHERE season=? AND discordID=? ORDER BY id DESC";
    const values = [season, req.params.discordID];
    db.all(stmt, values, (error, result) => {
        if (error || typeof result == "undefined") {
            res.status(500).send("" + 0x1f41);
        } else {
            if (result.length === 0) {
                res.status(204).send("" + 0xcc1);
            } else {
                res.status(200).json(result);
            }
        }
    });
}

module.exports = { getScoutResponses };
