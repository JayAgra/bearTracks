function isMe(req) {
    if (req.params.scout === "me") {
        return req.user.id;
    } else {
        return req.params.scout;
    }
}

async function profile(req, res, authDb) {
    const stmt = `SELECT id, score, nickName, fullName, lastLogin, admin, accessOk FROM users WHERE id=?`;
    const values = [isMe(req)];
    authDb.get(stmt, values, (err, dbQueryResult) => {
        if (err) {
            res.status(500).send("" + 0x1f41);
            return;
        } else {
            if (typeof dbQueryResult == "undefined") {
                res.status(204).send("" + 0xcc1);
            } else {
                res.status(200).json(dbQueryResult);
            }
        }
    });
}

module.exports = { profile };
