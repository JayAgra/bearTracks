import express from "express";
import * as sqlite3 from "sqlite3";

export async function teamsByEvent(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    const stmt: string = `SELECT match, game5, game10, game11, game13, game14, game15, game16, game17, game18, game19, game20, game21, game23, game24, game25, weight FROM main WHERE team=? AND event=? AND season=?`;
    const values: Array<any> = [req.params.team, req.params.event, season];
    db.all(stmt, values, (err: any, dbQueryResult: Array<Object> | undefined) => {
        if (err) {
            return res.status(500).json({ "status": 0x1f41 });
        } else {
            return res.status(200).json(dbQueryResult);
        }
    });
}
