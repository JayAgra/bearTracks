const qs = require("querystring");
const crypto = require('crypto');

function createAccount(req, res, authDb) {
    let body = "";

    req.on("data", (chunk) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        let accountData = qs.parse(body);
        authDb.all("SELECT id FROM users WHERE email=?", [accountData.email], (err, result) => {
            if (err) {
                res.status(500).send("" + 0x1f42);
            }
            if (result.length === 0) {
                const stmt = "INSERT INTO users (email, fullName, nickName, passHash, admin, accessOk, recentAttempts, lastLogin, score) VALUES (?, ?, ?, ?, 'false', 'false', 0, ?, 0)";
                const values = [accountData.email, accountData.fullName, accountData.nickName, crypto.createHash('sha256').update(accountData.password).digest('hex'), String(Date.now())];
                authDb.run(stmt, values, (err) => {
                    if (err) {
                        res.status(500).send("" + 0x1f42);
                    } else {
                        // res.status(200).send("" + 0xc85);
                        res.redirect("/login");
                    }
                })
            } else {
                res.status(409).send("" + 0x1991);
            }
        });
    });
}

module.exports = { createAccount };