import express from "express";
import * as sqlite3 from "sqlite3";

export async function deleteUser(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.user.admin == "true") {
        const deleteUserStmt: string = `DELETE FROM users WHERE id=?`;
        const deleteUserValues: Array<any> = [req.params.id];
        authDb.run(deleteUserStmt, deleteUserValues, (err: any) => {
            if (err) {
                return res.status(500).send("" + 0x1f42);
            }
        });
        return res.status(200).send("" + 0xc86);
    } else {
        return res.status(403).send("" + 0x1931);
    }
}
