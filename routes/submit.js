const qs = require("querystring");

function escapeHTML(htmlStr) {
    return String(htmlStr)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function submitForm(req, res, db, dirname, season) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        // server has all data!
        // parse form
        let formData = qs.parse(body);
        // well, this should never happen but if a pit form is sent to the main form, stop
        if (formData.formType === "pit") {
            res.status(400).send("" + 0x1903);
        } else if (formData.formType === "main") {
            // change score based on response length
            var formscoresdj = 0;
            if (formData.overall.length >= 70) {
                // logarithmic points
                formscoresdj = Math.ceil(20 + 5 * (Math.log(formData.overall.length - 65) / Math.log(6)));
            } else {
                formscoresdj = 20;
            }
            // db statement
            let stmt = `INSERT INTO main (event, season, name, team, match, level, game1, game2, game3, game4, game5, game6, game7, game8, game9, game10, game11, game12, game13, game14, game15, game16, game17, game18, game19, game20, game21, game22, game23, game24, game25, teleop, defend, driving, overall, discordID, discordName, discordTag, discordAvatarId, weight, analysis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            // values (escaped!) from POST data
            let values = [
                escapeHTML(formData.event),
                season,
                escapeHTML(req.user.username),
                escapeHTML(formData.team),
                escapeHTML(formData.match),
                escapeHTML(formData.level),
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
                escapeHTML(formData.game21),
                escapeHTML(formData.game22),
                escapeHTML(formData.game23),
                escapeHTML(formData.game24),
                escapeHTML(formData.game25),
                "dropped",
                escapeHTML(formData.defend),
                escapeHTML(formData.driving),
                escapeHTML(formData.overall),
                escapeHTML(req.user.id),
                escapeHTML(req.user.username),
                escapeHTML(req.user.discriminator),
                escapeHTML(req.user.avatar),
                0,
                "0",
            ];
            // run the statement, add to the database
            db.run(stmt, values, function(err) {
                if (err) {
                    console.error(err);
                    res.status(500).send("" + 0x1f42);
                }
                require(`./${season}.js`).weightScores(this.lastID, db);
            });
            // statement to credit points
            let pointStmt = `UPDATE scouts SET score = score + ? WHERE discordID=?`;
            let pointValues = [formscoresdj, req.user.id];
            db.run(pointStmt, pointValues, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send("" + 0x1f42);
                }
            });
            // respond to the user with success page
            res.sendFile("src/submitted.html", {
                root: dirname,
            });
        } else {
            // unknown form type
            res.status(400).send("" + 0x1902);
        }
    });
}

module.exports = { submitForm };
