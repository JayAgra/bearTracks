function escapeHTML(htmlStr) {
    return String(htmlStr)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function submitPit(req, res, db, transactions, authDb, dirname, season) {
    // get body of POST data
    let formData = req.body;
    // db statement
    let stmt = `INSERT INTO pit (event, season, name, team, drivetype, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, driveTeam, attended, confidence, bqual, overall, discordID, discordName, discordTag, discordAvatarId, image1, image2, image3, image4, image5) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    // escaped data from user added as values
    let values = [
        escapeHTML(formData.event),
        season,
        escapeHTML(req.user.name),
        escapeHTML(formData.team),
        escapeHTML(formData.drivetype),
        escapeHTML(formData.game1),
        escapeHTML(formData.game2),
        escapeHTML(formData.game3),
        escapeHTML(formData.game4),
        escapeHTML(formData.game5),
        escapeHTML(formData.game6),
        escapeHTML(formData.game7),
        escapeHTML(formData.game8),
        escapeHTML(formData.game9),
        escapeHTML(formData.game10),
        escapeHTML(formData.game11),
        escapeHTML(formData.game12),
        escapeHTML(formData.game13),
        escapeHTML(formData.game14),
        escapeHTML(formData.game15),
        escapeHTML(formData.game16),
        escapeHTML(formData.game17),
        escapeHTML(formData.game18),
        escapeHTML(formData.game19),
        escapeHTML(formData.game20),
        escapeHTML(formData.driveTeam),
        escapeHTML(formData.attended),
        escapeHTML(formData.confidence),
        escapeHTML(formData.bqual),
        escapeHTML(formData.overall),
        escapeHTML(req.user.id),
        escapeHTML(req.user.name),
        escapeHTML(0),
        escapeHTML("0"),
        req.files.image1[0].filename,
        req.files.image2[0].filename,
        req.files.image3[0].filename,
        req.files.image4[0].filename,
        req.files.image5[0].filename,
    ];
    // run db statement
    db.run(stmt, values, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send("" + 0x1f42);
        }
    });
    // credit points to scout
    // TODO: variable points on pit form
    let pointStmt = `UPDATE users SET score = score + 35 WHERE id=?`;
    let pointValues = [req.user.id];
    authDb.run(pointStmt, pointValues, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send("" + 0x1f42);
        }
    });
    transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, 0x1001, 35], (err) => {
        if (err) {
            res.status(500).send("" + 0x1f42);
            return;
        }
    });
    // send success message to user
    res.sendFile("src/submitted.html", {
        root: dirname,
    });
}

module.exports = { submitPit };
