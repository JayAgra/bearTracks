import express from "express";
import * as sqlite3 from "sqlite3";
import { randomBytes } from "crypto";
import * as Bun from "bun";

type loginDataForm = {
    "username": string,
    "password": string
}

type authData = {
    "id": number,
    "username": string,
    "fullName": string,
    "team": number,
    "passHash": string,
    "salt": string,
    "accessOk": string,
    "admin": string,
    "teamAdmin": number
}

export async function checkLogIn(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    let loginData: loginDataForm = req.body as unknown as loginDataForm;
    console.log(req.body);
    authDb.get("SELECT id, username, fullName, team, passHash, salt, accessOk, admin, teamAdmin FROM users WHERE username=?", [loginData.username], async (err: any, result: authData | undefined) => {
        if (err) {
            // res.status(500).json({ "status": 0x1f42 });
            return res.redirect("/login?err=0");
        } else {
            if (typeof result !== "undefined") {
                if (result.accessOk === "false") {
                    // res.status(403).send("" + 0x1932 + " account not yet approved for access by an admin.");
                    return res.redirect("/login?err=2");
                } else {
                    if (Bun.password.verifySync(loginData.password + result.salt, result.passHash)) {
                        const key = randomBytes(96).toString("hex");
                        const keyStmt: string = "INSERT INTO keys (key, userId, username, name, team, created, expires, admin, teamAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                        const keyValues: Array<any> = [
                            key,
                            result.id,
                            result.username,
                            result.fullName,
                            result.team,
                            String(Date.now()),
                            String(Date.now() + 24 * 60 * 60 * 1000),
                            result.admin,
                            result.teamAdmin
                        ];
                        authDb.run(keyStmt, keyValues, (err) => {
                            if (err || !result) {
                                // res.status(500).send("" + 0x1f42 + " internal server error (500)");
                                return res.redirect("/login?err=0");
                            } else {
                                res.cookie("key", key, {
                                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                                    sameSite: "lax",
                                    secure: true,
                                    httpOnly: true,
                                });
                                if (result.admin == "true") {
                                    res.cookie("lead", "true", {
                                        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                                        sameSite: "lax",
                                        secure: true,
                                        httpOnly: false,
                                    });
                                }
                                if (result.teamAdmin !== 0) {
                                    res.cookie("childTeamLead", "true", {
                                        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                                        sameSite: "lax",
                                        secure: true,
                                        httpOnly: false,
                                    });
                                }
                                return res.redirect("/");
                            }
                        });
                    } else {
                        // res.status(409).send("" + 0x1992 + " bad username/password");
                        return res.redirect("/login?err=1");
                    }
                }
            } else {
                // res.status(409).send("" + 0x1992 + " bad username/password");
                return res.redirect("/login?err=1");
            }
        }
    });
}