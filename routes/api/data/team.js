function getTeamEventData(req, res, db, season) {
    const stmt = "SELECT id, team, match, level, game2, game3, game4, game5, game6, game7, game8, game10, game25, game11, game13, game14, game15, game16, game17, game18, game19, game20, game21, game23, game24, game25, weight FROM main WHERE season=? AND event=? AND team=? ORDER BY id DESC";
    const values = [season, req.params.event, req.params.team];
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

module.exports = { getTeamEventData };