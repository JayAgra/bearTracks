import express from "express";
import * as sqlite3 from "sqlite3";

export async function getNotes(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    const stmt: string = "SELECT note FROM notes WHERE event=? AND season=? AND team=?";
    const values: Array<any> = [req.params.event, season, req.params.team];
    db.get(stmt, values, (err: any, dbQueryResult: { "note": string } | undefined) => {
        if (err) {
            return res.status(500).send("" + 0x1f41);
        } else {
            if (typeof dbQueryResult == "undefined") {
                return res.status(204).send("" + 0xcc2);
            } else {
                return res.status(200).setHeader("Content-type", "text/plain").send(dbQueryResult.note);
            }
        }
    });
}
