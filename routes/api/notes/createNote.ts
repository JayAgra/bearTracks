import express from "express";
import * as sqlite3 from "sqlite3";

export async function createNote(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    const stmt: string = "INSERT INTO notes (team, season, event, note) VALUES(?, ?, ?, 'no note yet')";
    const values: Array<any> = [req.params.team, season, req.params.event];
    db.run(stmt, values, (err: any) => {
        if (err) {
            return res.status(500).send("" + 0x1f41);
        } else {
            return res.status(200).send("" + 0xc81);
        }
    });
}
