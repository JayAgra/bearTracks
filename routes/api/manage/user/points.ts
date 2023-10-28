import express from "express";
import * as sqlite3 from "sqlite3";

export async function updateScout(req: express.Request, res: express.Response, transactions: sqlite3.Database, authDb: sqlite3.Database) {
    if (req.user.admin == "true") {
        const setUserScoreStmt: string = `UPDATE users SET score = score + ? WHERE id=?`;
        const setUserScoreVals: Array<any> = [Number(req.params.modify), req.params.userId];
        authDb.run(setUserScoreStmt, setUserScoreVals, (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [req.params.userId, Number(req.params.reason), Number(req.params.modify)], (err) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        return res.status(200).send("" + 0xc84);
    } else {
        return res.status(403).send("" + 0x1931);
    }
}
