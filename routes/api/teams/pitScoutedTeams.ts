import express from "express";
import * as sqlite3 from "sqlite3";

type teamOnlyPitDb = {
    "team": number
}

export async function pitScoutedTeams(req: express.Request, res: express.Response, db: sqlite3.Database, season: number) {
    var teams: Array<number> = [];
    const stmt: string = `SELECT team FROM pit WHERE event=? AND season=?`;
    const values: Array<any> = [req.params.event, season];
    db.all(stmt, values, (err: any, dbQueryResult: Array<teamOnlyPitDb> | undefined) => {
        if (err) {
            return res.status(500).json({ "status": 0x1f41 });
        } else {
            if (typeof dbQueryResult == "undefined") {
                return res.status(200).setHeader("Content-type", "text/plain").send("");
            } else {
                for (var i = 0; i < dbQueryResult.length; i++) {
                    teams.push(dbQueryResult[i].team);
                }
                return res.status(200).setHeader("Content-type", "text/plain").send(teams.toString());
            }
        }
    });
}
