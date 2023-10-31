import express from "express";
import * as sqlite3 from "sqlite3";

export async function createTeamKey(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.user.admin == "true") {
        const createKeyStmt: string = "INSERT INTO accessKeys (key, team) VALUES(?, ?)";
        const createKeyValues: Array<any> = [Number(req.params.key), Number(req.params.team)];
        authDb.run(createKeyStmt, createKeyValues, (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        return res.status(200).send("" + 0xc87);
    } else {
        return res.status(403).send("" + 0x1931);
    }
}
