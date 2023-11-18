import express from "express";
import * as sqlite3 from "sqlite3";

export async function manageTeamUser(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.user.teamAdmin !== 0 || req.user.admin === "true") {
        const team = req.user.teamAdmin === 0 ? "*" : req.user.teamAdmin;
        if (req.params.accessOk === "false") {
            authDb.run("UPDATE users SET teamAdmin=NULL WHERE id=? AND team=?", [req.params.id, team]);
            authDb.run("DELETE FROM keys WHERE userId=? AND team=?", [req.params.id, team]);
        }
        authDb.run("UPDATE users SET accessOk=? WHERE id=? AND team=?", [req.params.accessOk, req.params.id, team], (err: any,) => {
            if (err) {
                return res.status(500).json({ "status": 0x1f42 });
            } else {
                return res.status(200).json({ "status": 0xc86 });
            }
        });
    } else {
        return res.status(403).json({ "status": 0x1931 });
    }
}