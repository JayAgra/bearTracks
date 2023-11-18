import express from "express";
import * as sqlite3 from "sqlite3";

export async function submissionExists(req: express.Request, res: express.Response, db: sqlite3.Database) {
    const stmt: string = "SELECT team, match FROM main WHERE id=?";
    const values: Array<any> = [req.params.id];
    db.get(stmt, values, (err: any, dbQueryResult: Object | undefined) => {
        if (err || typeof dbQueryResult == "undefined") {
            return res.status(500).json({ "status": 0x1f41 });
        } else {
            return res.status(200).json(dbQueryResult);
        }
    });
}