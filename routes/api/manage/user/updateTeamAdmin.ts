import express from "express";
import * as sqlite3 from "sqlite3";

export async function updateTeamAdmin(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.user.admin == "true") {
        const setUserAdminStmt: string = `UPDATE users SET teamAdmin=? WHERE id=?`;
        const setUserAdminValues: Array<any> = [req.params.admin, req.params.id];
        authDb.run(setUserAdminStmt, setUserAdminValues, (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        return res.status(200).send("" + 0xc86);
    } else {
        return res.status(403).send("" + 0x1931);
    }
}
