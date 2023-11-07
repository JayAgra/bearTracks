import express from "express";
import * as sqlite3 from "sqlite3";
import * as Bun from "bun";

type passHashRes = {
    "passHash": string;
}

export async function changePassword(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    if (req.params.new === "delete") {
        authDb.run("UPDATE users SET passHash=? WHERE id=?", [
            /* placing "noPassword" here makes password authentication impossible
               the hashes are created by appending the salt to the submitted password,
               and the salt will NEVER equal "noPassword" */
            await Bun.password.hash("noPassword"),
            req.user.id
        ], (err: any) => {
            if (err) {
                res.status(500).json({ status: "errored" });
            } else {
                res.status(200).json({ status: "done" });
            }
        });
    } else {
        authDb.get("SELECT salt FROM users WHERE id=?", [req.user.id], async (err, result: passHashRes | undefined) => {
            if (err) {
                res.status(500).json({ status: "errored" });
            } else {
                if (typeof result === "undefined") {
                    // can send different status here
                    res.status(500).json({ status: "errored" });
                } else {
                    authDb.run("UPDATE users SET passHash=? WHERE id=?", [
                        await Bun.password.hash(req.params.new + result.passHash),
                        req.user.id
                    ], (err: any) => {
                        if (err) {
                            res.status(500).json({ status: "errored" });
                        } else {
                            res.status(200).json({ status: "done" });
                        }
                    });
                }
            }
        });
    }
}