import express from "express";
import * as sqlite3 from "sqlite3";
import { parse } from "qs";
import { randomBytes } from "crypto";
import * as Bun from "bun";
import { escapeHTML } from "../../../src/escape";

type createAccountForm = {
    "access": string,
    "fullName": string,
    "username": string,
    "password": string
}

export async function createAccount(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    let body: string = "";

    req.on("data", (chunk: any) => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        let accountData: createAccountForm = parse(body) as unknown as createAccountForm;
        authDb.all("SELECT id FROM users WHERE username=?", [accountData.username], (err: any, result: Array<Object>) => {
            if (err) {
                // res.status(500).send("" + 0x1f42 + " internal server error (500)");
                return res.redirect("/create?err=0");
            }
            if (result.length === 0) {
                if (accountData.password.length >= 8) {
                    var targetTeam: number = 0;
                    authDb.get("SELECT team FROM accessKeys WHERE key=?", [Number(accountData.access)], async (err: any, result: {"team": number} | undefined) => {
                        if (err || !result) {
                            return res.redirect("/create?err=3");
                        } else {
                            targetTeam = result.team;
                            if (targetTeam !== 0) {
                                const salt = randomBytes(32).toString("hex");
                                const stmt = "INSERT INTO users (fullName, username, team, method, passHash, salt, admin, teamAdmin, accessOk, score) VALUES (?, ?, ?, ?, ?, ?, 'false', 0, 'false', 0)";
                                const values = [
                                    escapeHTML(accountData.fullName),
                                    escapeHTML(accountData.username),
                                    targetTeam,
                                    "pw",
                                    await Bun.password.hash(accountData.password + salt),
                                    salt,
                                ];
                                authDb.run(stmt, values, (err: any) => {
                                    if (err) {
                                        // res.status(500).json({ "status": 0x1f42 });
                                        return res.redirect("/create?err=0");
                                    } else {
                                        // res.status(200).send("" + 0xc85);
                                        return res.redirect("/login");
                                    }
                                });
                            } else {
                                return res.redirect("/create?err=3");
                            }
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
