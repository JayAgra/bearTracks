import express from "express";
import * as sqlite3 from "sqlite3";

export async function scouts(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const stmt: string = `SELECT id, nickName, score, accessOk FROM users ORDER BY score DESC`;
    authDb.all(stmt, (err: any, dbQueryResult: Array<Object> | undefined) => {
        if (err) {
            return res.status(500).send("" + 0x1f41);
        } else {
            return res.status(200).json(dbQueryResult);
        }
    });
}
