// 12 spins
const spins = [10, 20, 50, -15, -25, -35, -100, -50, 100, 250, -1000, 1250];

async function spinWheel(req, res, authDb, transactions) {
    // weighting (you didnt think this was fair, did you??)
    var spin = Math.floor(Math.random() * 12);
    for (var i = 0; i < 2; i++) {
        if (spin >= 8) {
            spin = Math.floor(Math.random() * 12);
            if (spin >= 9) {
                spin = Math.floor(Math.random() * 12);
                if (spin >= 10) {
                    spin = Math.floor(Math.random() * 12);
                }
            }
        }
    }

    let pointStmt = `UPDATE users SET score = score + ? WHERE id=?`;
    let pointValues = [spins[spin], req.user.id];
    authDb.run(pointStmt, pointValues, (err) => {
        if (err) {
            res.status(500).send("" + 0x1f42);
            return;
        } else {
            transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, 0x1500, spins[spin]], (err) => {
                if (err) {
                    res.status(500).send("" + 0x1f42);
                    return;
                }
            });
        }
    });

    res.status(200).json(`{"spin": ${spin}}`);
}

module.exports = { spinWheel };