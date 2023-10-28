import express from "express";
import * as sqlite3 from "sqlite3";

export async function teamsBySeason(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    const stmt: string = `SELECT weight FROM main WHERE team=? AND season=?`;
    const values: Array<any> = [req.params.team, season];
    db.all(stmt, values, (err: any, dbQueryResult: Array<Object> | undefined) => {
        if (err) {
            return res.status(500).send("" + 0x1f41);
        } else {
            return res.status(200).json(dbQueryResult);
        }
    });
}
