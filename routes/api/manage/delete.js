function getSafeDbName(input) {
    return input === "pit" ? "pit" : "main";
}

async function deleteSubmission(req, res, db, transactions, authDb) {
    if (req.user.admin == "true") {
        const stmt = `SELECT discordID FROM ${getSafeDbName(req.params.database)} WHERE id=?`;
        const values = [req.params.submissionId];
        await db.get(stmt, values, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send("" + 0x1f41);
                return;
            }
            const updateUserStmt = `UPDATE users SET score = score - ? WHERE id=?`;
            const updateUserValues = [(req.params.database == "pit" ? 35 : 25), result.discordID];
            authDb.run(updateUserStmt, updateUserValues, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send("" + 0x1f42);
                    return;
                }
            });
            transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [result.discordID, (req.params.database == "pit" ? 0x2001 : 0x2000), (req.params.database == "pit" ? -35 : -25)], (err) => {
                if (err) {
                    res.status(500).send("" + 0x1f42);
                    return;
                }
            });
        });
        const deleteStmt = `DELETE FROM ${getSafeDbName(req.params.database)} WHERE id=?`;
        db.run(deleteStmt, values, (err) => {
            if (err) {
                console.log(err);
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
        res.status(200).send("" + 0xc83);
    } else {
        res.status(403).send("" + 0x1931);
    }
}

module.exports = { deleteSubmission };