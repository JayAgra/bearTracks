import express from "express";
import * as sqlite3 from "sqlite3";

export async function detailBySpecs(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    const stmt: string = "SELECT * FROM main WHERE team=? AND event=? AND season=? ORDER BY id DESC LIMIT 1 OFFSET ?";
    const values: Array<any> = [req.params.team, req.params.event, season, req.params.page];
    db.get(stmt, values, (err: any, dbQueryResult: Object | undefined) => {
        if (err || typeof dbQueryResult == "undefined") {
            return res.status(500).send("" + 0x1f41);
        } else {
            return res.status(200).json(dbQueryResult);
        }
    });
}