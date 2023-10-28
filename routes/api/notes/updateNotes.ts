import express from "express";
import * as sqlite3 from "sqlite3";
import { parse } from "qs";

export async function updateNotes(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    let body = "";

    req.on("data", (chunk: any) => {
        body += chunk.toString();
    });

    req.on("end", () => {
        let newNote = parse(body);
        const stmt = `UPDATE notes SET note=? WHERE event=? AND season=? AND team=?`;
        const values: Array<any> = [newNote.save, req.params.event, season, req.params.team];
        db.run(stmt, values, (err) => {
            if (err) {
                return res.status(500).send("" + 0x1f41);
            } else {
                return res.status(200).send("" + 0xc82);
            }
        });
    });
}
