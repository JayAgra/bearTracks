async function updateAccess(req, res, authDb) {
    if (req.user.admin == "true") {
        const setUserScoreStmt = `UPDATE users SET accessOk=? WHERE id=?`;
        const setUserScoreVals = [req.params.accessOk, req.params.id];
        authDb.run(setUserScoreStmt, setUserScoreVals, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
        res.status(200).send("" + 0xc86);
    } else {
        res.status(403).send("" + 0x1931);
    }
}

module.exports = { updateAccess };