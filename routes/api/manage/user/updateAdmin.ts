import express from "express";
import * as sqlite3 from "sqlite3";

export async function updateAdmin(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.user.admin == "true") {
        const setUserAdminStmt: string = `UPDATE users SET admin=? WHERE id=?`;
        const setUserAdminValues: Array<any> = [req.params.admin, req.params.id];
        authDb.run(setUserAdminStmt, setUserAdminValues, (err: any) => {
            if (err) {
                return res.status(500).json({ "status": 0x1f42 });
            }
        });
        return res.status(200).json({ "status": 0xc86 });
    } else {
        return res.status(403).json({ "status": 0x1931 });
    }
}
