import express from "express";
import * as sqlite3 from "sqlite3";

export async function listSubmissions(req: express.Request, res: express.Response, db: sqlite3.Database) {
    if (req.user.admin == "true") {
        const stmt: string = `SELECT id FROM main ORDER BY id ASC`;
        db.all(stmt, (err: any, result: Array<Object> | undefined) => {
            if (err) {
                return res.status(500).json({ "status": 0x1f41 });
            } else {
                return res.status(200).json(result);
            }
        });
    } else {
        return res.status(403).json({ "status": 0x1931 });
    }
}
