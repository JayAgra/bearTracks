async function spinWheel(req, res, db) {
    // 12 spins
    const spins = [10, 20, 50, -15, -25, -35, -100, -50, 100, 250, -1000, 1250];

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

    let pointStmt = `UPDATE scouts SET score = score + ? WHERE discordID=?`;
    let pointValues = [spins[spin], req.user.id];
    db.run(pointStmt, pointValues, (err) => {
        if (err) {
            res.status(500).send("" + 0x1f42);
            return;
        }
    });

    res.status(200).json(`{"spin": ${spin}}`);
}

module.exports = { spinWheel };