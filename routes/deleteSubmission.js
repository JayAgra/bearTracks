async function checkIfLeadScout() {
    if (req.cookies.lead) {
        if (req.cookies.lead == leadToken) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

function sanitizeDBName() {
    return reqData.db == "pit" ? "pit" : "main";
}

function deleteSubmission(req, res, db) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {

        let reqData = qs.parse(body);

        const isLeadScout = await checkIfLeadScout();

        if (isLeadScout) {
            if (reqData.submissionID && reqData.db) {
                const stmt = `SELECT discordID FROM ${sanitizeDBName()} WHERE id=?`;
                const values = [reqData.submissionID];
                db.get(stmt, values, (err, result) => {
                    const getUserIDstmt = `UPDATE scouts SET score = score - ${
                        reqData.db == "pit" ? 35 : 25
                    } WHERE discordID="${result.discordID}"`;
                    db.run(getUserIDstmt, (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
                });
                const deleteStmt = `DELETE FROM ${sanitizeDBName()} WHERE id=?`;
                const deleteValues = [reqData.submissionID];
                db.run(deleteStmt, deleteValues, (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });
                res.status(200).send("done!");
            } else {
                res.status(400).send("Bad Request!");
            }
        } else {
            res.status(401).send("Access Denied!");
        }
    });
}

module.exports = { deleteSubmission };
