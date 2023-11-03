import express from "express";
import * as sqlite3 from "sqlite3";
import SimpleWebAuthnServer from "@simplewebauthn/server";
import { randomBytes } from "crypto";
import { Authenticator, UserModel, getUser, getUserAuthenticator, updateAuthenticatorCounter, origin, rpID } from "./_shared";

export async function verifyAuthPasskey(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const user: UserModel = await getUser(req, authDb) as UserModel;
    const expectedChallenge: string = user.currentChallenge as string;
    const authenticator = await getUserAuthenticator(req, authDb, JSON.parse(req.body).id);

    if (!authenticator) {
        return res.status(400).end();
    }

    let verification;
    try {
        verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            response: req.body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: (authenticator as unknown as Authenticator),
        })
    } catch (error: any) {
        console.error(error);
        return res.status(400).send({ error: error.message });
    }

    const { verified } = verification;

    if (verified) {
        const { authenticationInfo } = verification;
        const { newCounter } = authenticationInfo;
        updateAuthenticatorCounter(authDb, authenticator.credentialID, newCounter);
        var result: any;
        authDb.get("SELECT id, fullName, team, passHash, salt, accessOk, admin, teamAdmin FROM users WHERE id=?", [authenticator.userId], async (err: any, dbResult: any) => {
            result = dbResult;
        });
        const key = randomBytes(96).toString("hex");
        const keyStmt: string = "INSERT INTO keys (key, userId, name, team, created, expires, admin, teamAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const keyValues: Array<any> = [
            key,
            result.id,
            result.fullName,
            result.team,
            String(Date.now()),
            String(Date.now() + 24 * 60 * 60 * 1000),
            result.admin,
            result.teamAdmin
        ];
        authDb.run(keyStmt, keyValues, (err) => {
            if (err) {
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
    }
}