import express from "express";
import * as sqlite3 from "sqlite3";

export async function deleteSubmission(req: express.Request, res: express.Response, db: sqlite3.Database, transactions: sqlite3.Database, authDb: sqlite3.Database) {
    if (req.user.admin == "true") {
        const stmt: string = `SELECT userId FROM main WHERE id=?`;
        const values: Array<any> = [req.params.submissionId];
        db.get(stmt, values, (err: any, result: {"userId": string} | undefined) => {
            if (err || !result) {
                return res.status(500).send("" + 0x1f41);
            }
            const updateUserStmt: string = `UPDATE users SET score = score - ? WHERE id=?`;
            const updateUserValues: Array<any> = [(req.params.database == "pit" ? 35 : 25), result.userId];
            authDb.run(updateUserStmt, updateUserValues, (err: any) => {
                if (err) {
                    return res.status(500).send("" + 0x1f42);
                }
            });
            transactions.run("INSERT INTO transactions (userId, type, amount) VALUES (?, ?, ?)", [result.userId, (req.params.database == "pit" ? 0x2001 : 0x2000), (req.params.database == "pit" ? -35 : -25)], (err) => {
                if (err) {
                    return res.status(500).send("" + 0x1f42);
                }
            });
        });
        const deleteStmt: string = `DELETE FROM main WHERE id=?`;
        db.run(deleteStmt, values, (err) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        return res.status(200).send("" + 0xc83);
    } else {
        return res.status(403).send("" + 0x1931);
    }
}
