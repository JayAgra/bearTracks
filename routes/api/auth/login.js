var crypto = require("crypto");

function checkLogIn(req, res, authDb) {
    let loginData = req.body;
    authDb.get("SELECT id, fullName, passHash, accessOk, admin FROM users WHERE email=?", [loginData.email], (err, result) => {
        if (err) {
            res.status(500).send("" + 0x1f42);
        } else {
            if (result.accessOK == "true") {
                if (!result) {
                    res.status(409).send("" + 0x1992);
                } else {
                    if (result.passHash === crypto.createHash('sha256').update(loginData.password).digest('hex')) {
                        const key = crypto.randomBytes(96).toString("hex");
                        const keyStmt = "INSERT INTO keys (key, userId, name, created, expires, admin) VALUES (?, ?, ?, ?, ?, ?)";
                        const keyValues = [
                            key,
                            result.id,
                            result.fullName,
                            String(Date.now()),
                            String(Date.now() + 24 * 60 * 60 * 1000),
                            result.admin,
                        ];
                        authDb.run(keyStmt, keyValues, (err) => {
                            if (err) {
                                res.status(500).send("" + 0x1f42);
                            } else {
                                res.cookie("key", key, {
                                    expire: Date.now() + 24 * 60 * 60 * 1000,
                                    sameSite: "Lax",
                                    secure: true,
                                    httpOnly: true,
                                });
                                if (result.admin == "true") {
                                    res.cookie("lead", "true", {
                                        expire: Date.now() + 24 * 60 * 60 * 1000,
                                        sameSite: "Lax",
                                        secure: true,
                                        httpOnly: false,
                                    });
                                }
                                res.redirect("/");
                            }
                        });
                    } else {
                        res.status(409).send("" + 0x1992);
                    }
                }
            } else {
                res.status(403).send("" + 0x1932);
            }
        }
    })
}

module.exports = { checkLogIn };