import express from "express";
import * as sqlite3 from "sqlite3";

export async function slotSpin(req: express.Request, res: express.Response, authDb: sqlite3.Database, transactions: sqlite3.Database) {
    const spin: Array<number> = [
        Math.floor(Math.random() * 7 + 1),
        Math.floor(Math.random() * 7 + 1),
        Math.floor(Math.random() * 7 + 1),
    ];
    if (spin[0] === spin[1] && spin[0] === spin[2]) {
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, 0x1501, 766], (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        authDb.run("UPDATE users SET score = score + 766 WHERE id=?", [req.user.id], (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            } else {
                return res.status(200).json(`{"spin0": ${spin[0]}, "spin1": ${spin[1]}, "spin2": ${spin[2]}}`);
            }
        });
    } else {
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.user.id, 0x1501, -10], (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        authDb.run("UPDATE users SET score = score - 10 WHERE id=?", [req.user.id], (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            } else {
                return res.status(200).json(`{"spin0": ${spin[0]}, "spin1": ${spin[1]}, "spin2": ${spin[2]}}`);
            }
        });
    }
}
