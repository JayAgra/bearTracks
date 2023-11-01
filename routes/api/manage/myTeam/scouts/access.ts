import express from "express";
import * as sqlite3 from "sqlite3";

export async function manageTeamUser(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.user.teamAdmin !== 0 || req.user.admin === "true") {
        const team = req.user.teamAdmin === 0 ? "*" : req.user.teamAdmin;
        authDb.run("UPDATE users SET accessOk=? WHERE id=? AND team=?", [req.params.accessOk, req.params.id, team], (err: any,) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            } else {
                res.status(200).send("" + 0xc86);
            }
        });
    } else {
        return res.status(403).send("" + 0x1931);
    }
}