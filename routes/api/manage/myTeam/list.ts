import express from "express";
import * as sqlite3 from "sqlite3";

export async function teamScouts(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.user.teamAdmin === 0) return res.status(403).json({ "status": 0x1931 });
    const stmt: string = `SELECT id, username, score, accessOk FROM users WHERE team=? ORDER BY score DESC`;
    authDb.all(stmt, [req.user.teamAdmin], (err: any, dbQueryResult: Array<Object> | undefined) => {
        if (err) {
            return res.status(500).json({ "status": 0x1f41 });
        } else {
            return res.status(200).json(dbQueryResult);
        }
    });
}
