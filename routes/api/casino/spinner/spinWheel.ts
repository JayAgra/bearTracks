import express from "express";
import * as sqlite3 from "sqlite3";

// 12 spins
const spins: Array<number> = [10, 20, 50, -15, -25, -35, -100, -50, 100, 250, -1000, 1250];

export async function spinWheel(req: express.Request, res: express.Response, authDb: sqlite3.Database, transactions: sqlite3.Database) {
    // weighting (you didnt think this was fair, did you??)
    var spin: number = Math.floor(Math.random() * 12);
    for (var i: number = 0; i < 2; i++) {
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

    let pointStmt: string = "UPDATE users SET score = score + ? WHERE id=?";
    let pointValues: Array<number> = [spins[spin], req.user.id];
    authDb.run(pointStmt, pointValues, (err: any) => {
        if (err) {
            return res.status(500).send("" + 0x1f42);
        } else {
            transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, 0x1500, spins[spin]], (err) => {
                if (err) {
                    return res.status(500).send("" + 0x1f42);
                }
            });
        }
    });

    return res.status(200).json(`{"spin": ${spin}}`);
}

module.exports = { spinWheel };