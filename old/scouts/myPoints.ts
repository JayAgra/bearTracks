import express from "express";
import * as sqlite3 from "sqlite3";

export async function myPoints(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const stmt: string = `SELECT score FROM users WHERE id=?`;
    authDb.get(stmt, [req.user.id], (err: any, dbQueryResult: Array<Object> | undefined) => {
        if (err) {
            return res.status(500).json({ "status": 0x1f41 });
        } else {
            return res.status(200).json(dbQueryResult);
        }
    });
}
