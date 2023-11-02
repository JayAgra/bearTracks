import express from "express";
import * as sqlite3 from "sqlite3";

export async function scoutTransactions(req: express.Request, res: express.Response, transactions: sqlite3.Database) {
    const stmt: string = "SELECT type, amount, time FROM transactions WHERE userId=? ORDER BY id DESC LIMIT 250";
    transactions.all(stmt, [req.user.id], (err: any, result: Array<Object> | undefined) => {
        if (err || typeof result == "undefined") {
            return res.status(500).json({ "status": 0x1f41 });
        } else {
            if (result.length === 0) {
                return res.status(204).json({ "status": 0xcc1 });
            } else {
                return res.status(200).json(result);
            }
        }
    });
}
