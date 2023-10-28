import express from "express";
import * as sqlite3 from "sqlite3";

function isMe(req: express.Request): any {
    if (req.params.scout === "me") {
        return req.user.id;
    } else {
        return req.params.scout;
    }
}

export async function profile(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const stmt: string = `SELECT id, score, nickName, fullName, lastLogin, admin, accessOk FROM users WHERE id=?`;
    const values: Array<any> = [isMe(req)];
    authDb.get(stmt, values, (err: any, dbQueryResult: Object | undefined) => {
        if (err) {
            return res.status(500).send("" + 0x1f41);
        } else {
            if (typeof dbQueryResult == "undefined") {
                return res.status(204).send("" + 0xcc1);
            } else {
                return res.status(200).json(dbQueryResult);
            }
        }
    });
}
