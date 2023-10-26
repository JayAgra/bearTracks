async function revokeKey(req, res, authDb) {
    if (req.user.admin == "true") {
        const revokeKeyStmt = "DELETE FROM keys WHERE userId=?";
        const revokeKeyVals = [req.params.id];
        authDb.run(revokeKeyStmt, revokeKeyVals, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send("" + 0x1f42);
                return;
            }
        });
        res.status(200).send("" + 0xc87);
    } else {
        res.status(403).send("" + 0x1931);
    }
}

module.exports = { revokeKey };