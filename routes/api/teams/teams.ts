import express from "express";
import * as sqlite3 from "sqlite3";

export function teams(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    if (req.params.event) {
        const stmt: string = `SELECT team, weight FROM main WHERE event=? AND season=?`;
        const values: Array<any> = [req.params.event, season];
        db.all(stmt, values, (err: any, dbQueryResult: Array<Object> | undefined) => {
            if (err) {
                return res.status(500).send("" + 0x1f41);
            } else {
                if (typeof dbQueryResult == "undefined") {
                    return res.status(204).send("" + 0xcc1);
                } else {
                    return res.status(200).json(dbQueryResult);
                }
            }
        });
    } else {
        return res.status(400).send("" + 0x1900);
    }
}
