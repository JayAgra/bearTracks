function scouts(req, res, db) {
    const stmt = `SELECT * FROM scouts ORDER BY score DESC`;
    db.all(stmt, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send(0x1f41);
            return;
        } else {
            var htmltable = ``;
            for (var i = 0; i < dbQueryResult.length; i++) {
                htmltable =
                    htmltable +
                    `<tr><td><a href="/browse?discordID=${
                        dbQueryResult[i].discordID
                    }" style="all: unset; color: #2997FF; text-decoration: none;">${
                        dbQueryResult[i].username
                    }#${
                        dbQueryResult[i].discriminator
                    }</a></td><td>${Math.round(
                        dbQueryResult[i].score
                    )}</td></tr>`;
            }
            res.status(200)
                .setHeader("Content-type", "text/plain")
                .send(htmltable);
        }
    });
}

module.exports = { scouts };