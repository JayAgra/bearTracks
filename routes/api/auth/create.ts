import express from "express";
import * as sqlite3 from "sqlite3";
import { parse } from "qs";
import { randomBytes } from "crypto";
import * as Bun from "bun";

function escapeHTML(htmlStr: string): string {
    return String(htmlStr)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

type createAccountForm = {
    "access": string,
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
                if (accountData.password.length >= 8) {
                    var targetTeam: number = 0;
                    authDb.get("SELECT team FROM accessKeys WHERE key=?", (err: any, result: {"team": number} | undefined) => {
                        if (err || !result) return res.redirect("/create?err=3");
                        targetTeam = result.team;
                    });
                    if (targetTeam !== 0) {
                        const salt = randomBytes(32).toString("hex");
                        const stmt = "INSERT INTO users (email, fullName, nickName, team, passHash, salt, admin, teamAdmin, accessOk, recentAttempts, lastLogin, score) VALUES (?, ?, ?, ?, ?, ?, 'false', 0, 'false', 0, ?, 0)";
                        const values = [
                            escapeHTML(accountData.email),
                            escapeHTML(accountData.fullName),
                            escapeHTML(accountData.nickName),
                            targetTeam,
                            Bun.password.hash(accountData.password + salt),
                            salt,
                            String(Date.now()),
                        ];
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
                        return res.redirect("/create?err=3");
                    }
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
