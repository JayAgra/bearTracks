import express from "express";
import * as sqlite3 from "sqlite3";

export async function pit(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    const stmt: string = `SELECT * FROM pit WHERE team=? AND event=? AND season=? ORDER BY id LIMIT 1`;
    const values: Array<any> = [req.params.team, req.params.event, season];
    db.all(stmt, values, (err: any, dbQueryResult: Array<Object> | undefined) => {
        if (err || typeof dbQueryResult == "undefined") {
            return res.status(500).send("" + 0x1f41);
        } else {
            if (dbQueryResult.length === 0) {
                return res.status(204).send("" + 0xcc0);
            } else {
                return res.status(200).json(dbQueryResult[0]);
            }
        }
    });
}
