import express from "express";
import * as sqlite3 from "sqlite3";
import { parse } from "qs";
import { createHash } from "crypto";

type createAccountForm = {
    "email": string,
    "fullName": string,
    "nickName": string,
    "password": string
}

export async function createAccount(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    let body: string = "";

    req.on("data", (chunk: any) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        let accountData: createAccountForm = parse(body) as unknown as createAccountForm;
        authDb.all("SELECT id FROM users WHERE email=?", [accountData.email], (err: any, result: Array<Object>) => {
            if (err) {
                // res.status(500).send("" + 0x1f42 + " internal server error (500)");
                return res.redirect("/create?err=0");
            }
            if (result.length === 0) {
                if (accountData.password.length >= 12) {
                    const stmt = "INSERT INTO users (email, fullName, nickName, passHash, admin, accessOk, recentAttempts, lastLogin, score) VALUES (?, ?, ?, ?, 'false', 'false', 0, ?, 0)";
                    const values = [accountData.email, accountData.fullName, accountData.nickName, createHash('sha256').update(accountData.password).digest('hex'), String(Date.now())];
                    authDb.run(stmt, values, (err: any) => {
                        if (err) {
                            // res.status(500).send("" + 0x1f42);
                            return res.redirect("/create?err=0");
                        } else {
                            // res.status(200).send("" + 0xc85);
                            return res.redirect("/login");
                        }
                    });
                } else {
                    return res.redirect("/create?err=2");
                }
            } else {
                // res.status(409).send("" + 0x1991 + " email already in use");
                return res.redirect("/create?err=1");
            }
        });
    });
}
