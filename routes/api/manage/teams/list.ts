import express from "express";
import * as sqlite3 from "sqlite3";

export async function listTeams(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.user.admin == "true") {
        authDb.all("SELECT * FROM accessKeys", (err: any, dbQueryResult: Array<Object> | undefined) => {
            if (err || typeof dbQueryResult == "undefined") {
                return res.status(500).send("" + 0x1f41);
            } else {
                return res.status(200).json(dbQueryResult);
            }
        });
    } else {
        return res.status(403).send("" + 0x1931);
    }
}
