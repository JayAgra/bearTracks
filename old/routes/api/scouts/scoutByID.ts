import express from "express";
import * as sqlite3 from "sqlite3";

export async function scoutByID(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const stmt: string = `SELECT id, fullName, username, admin, accessOk, recentAttempts, lastLogin, score FROM users WHERE username=?`;
    const values: Array<any> = [req.params.username];
    authDb.get(stmt, values, (err: any, dbQueryResult: Object | undefined) => {
        if (err) {
            return res.status(500).json({ "status": 0x1f41 });
        } else {
            if (typeof dbQueryResult == "undefined") {
                return res.status(204).json({ "status": 0xcc1 });
            } else {
                return res.status(200).json(dbQueryResult);
            }
        }
    });
}
