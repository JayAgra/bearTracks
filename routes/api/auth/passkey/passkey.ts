import express from "express";
import * as sqlite3 from "sqlite3";
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { cose, isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
import type {
    GenerateAuthenticationOptionsOpts,
    GenerateRegistrationOptionsOpts,
    VerifiedAuthenticationResponse,
    VerifiedRegistrationResponse,
    VerifyAuthenticationResponseOpts,
    VerifyRegistrationResponseOpts,
} from "@simplewebauthn/server";
import type {
    AuthenticationResponseJSON,
    AuthenticatorDevice,
    AuthenticatorTransportFuture,
    RegistrationResponseJSON,
} from "@simplewebauthn/typescript-types";
import { randomBytes } from "crypto";
const { baseURLNoPcl } = require("../../../../config.json");

type UserModel = {
    id: number;
    username: string;
    currentChallenge?: string;
    fullName: string;
    team: number;
    method: string;
    passHash?: string;
    salt?: string;
    admin: string;
    teamAdmin: number;
    accessOk: string;
    score: number;
};

type Authenticator = {
    id?: number;
    userId: number;
    credentialID: Uint8Array;
    credentialPublicKey: Uint8Array;
    counter: number;
    credentialDeviceType: string;
    credentialBackedUp: boolean;
    transports?: AuthenticatorTransport[];
};

type dbAuthenticator = {
    id: number;
    userId: number;
    credentialID: string;
    credentialPublicKey: string;
    counter: number;
    transports: string;
}

function getUserAuthenticators(req: express.Request, authDb: sqlite3.Database): Promise<dbAuthenticator[]> {
    return new Promise((resolve, reject) => {
        authDb.all("SELECT * FROM passkeys WHERE userId=?", [req.user.id], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result as unknown[] as dbAuthenticator[]);
            }
        });
    });
}

function setCurrentChallenge(req: express.Request, authDb: sqlite3.Database, challenge: string): void {
    authDb.run("UPDATE users SET currentChallenge=? WHERE id=?", [challenge, req.user.id]);
}

export async function _generateRegistrationOptions(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const userAuthenticators = await getUserAuthenticators(req, authDb);
    const opts: GenerateRegistrationOptionsOpts = {
        rpName: "bearTracks",
        rpID: baseURLNoPcl,
        userID: String(req.user.id),
        userName: req.user.username,
        timeout: 60000,
        attestationType: "none",
        excludeCredentials: userAuthenticators.map((device: dbAuthenticator) => ({
            id: isoBase64URL.toBuffer(device.credentialID),
            type: "public-key",
            transports: device.transports.split(",") as unknown[] as AuthenticatorTransportFuture[],
        })),
        authenticatorSelection: {
            residentKey: "discouraged",
            userVerification: "preferred",
            authenticatorAttachment: "platform",
        },
        supportedAlgorithmIDs: [-7, -257],
    };
    const options = await generateRegistrationOptions(opts);
    setCurrentChallenge(req, authDb, options.challenge);
    res.send(options);
}

function getUserCurrentChallenge(req: express.Request, authDb: sqlite3.Database): Promise<string> {
    return new Promise((resolve, reject) => {
        authDb.get("SELECT currentChallenge FROM users WHERE id=?", [req.user.id], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result.currentChallenge);
            }
        });
    });
}

function writePasskey(req: express.Request, authDb: sqlite3.Database, authenticator: AuthenticatorDevice): void {
    authDb.run(
        "INSERT INTO passkeys (userId, credentialID, credentialPublicKey, counter, transports) VALUES (?, ?, ?, ?, ?)",
        [req.user.id, isoBase64URL.fromBuffer(authenticator.credentialID), isoBase64URL.fromBuffer(authenticator.credentialPublicKey), authenticator.counter, authenticator.transports?.join(",")]
    );
}

export async function _verifyRegistration(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const body: RegistrationResponseJSON = req.body;
    const expectedChallenge = await getUserCurrentChallenge(req, authDb);
    let verification: VerifiedRegistrationResponse;
    try {
        const opts: VerifyRegistrationResponseOpts = {
            response: body,
            expectedChallenge: expectedChallenge,
            expectedOrigin: `https://${baseURLNoPcl}`,
            expectedRPID: baseURLNoPcl,
            requireUserVerification: true,
        };
        verification = await verifyRegistrationResponse(opts);
    } catch (error) {
        const _error = error as Error;
        console.error(_error);
        return res.status(400).send({ error: _error.message });
    }

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
        const { credentialPublicKey, credentialID, counter } = registrationInfo;
        const _userAuthenticators = await getUserAuthenticators(req, authDb);
        const existingDevice = _userAuthenticators.find((device: any) => isoUint8Array.areEqual(isoBase64URL.toBuffer(device.credentialID), credentialID));

        if (!existingDevice) {
            const newDevice: AuthenticatorDevice = {
                credentialPublicKey,
                credentialID,
                counter,
                transports: body.response.transports,
            };
            writePasskey(req, authDb, newDevice);
        }
    }

    res.send({ verified });
}

function getUserIdByName(username: string, authDb: sqlite3.Database) {
    return new Promise((resolve, reject) => {
        authDb.get("SELECT id FROM users WHERE username=?", [username], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result.id);
            }
        })
    })
}

function getAnyUserAuthenticators(req: express.Request, authDb: sqlite3.Database, username: string): Promise<dbAuthenticator[]> {
    return new Promise(async (resolve, reject) => {
        const userId = await getUserIdByName(username, authDb);
        authDb.all("SELECT * FROM passkeys WHERE userId=?", [userId], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result as unknown[] as dbAuthenticator[]);
            }
        });
    });
}

function getAnyUserChallenge(req: express.Request, authDb: sqlite3.Database, username: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        const userId = await getUserIdByName(username, authDb);
        authDb.get("SELECT currentChallenge FROM users WHERE id=?", [userId], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result.currentChallenge);
            }
        });
    });
}

export async function _generateAuthenticationOptions(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const userDevices = await getAnyUserAuthenticators(req, authDb, req.params.username);
    const opts: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        allowCredentials: userDevices.map((device: dbAuthenticator) => ({
            id: isoBase64URL.toBuffer(device.credentialID),
            type: "public-key",
        })),
        userVerification: "required",
        rpID: baseURLNoPcl,
    };

    const options = await generateAuthenticationOptions(opts);

    setCurrentChallenge(req, authDb, options.challenge);
    res.send(options);
}

function getUserAuthenticator(authDb: sqlite3.Database, id: string): Promise<dbAuthenticator> {
    return new Promise((resolve, reject) => {
        authDb.get("SELECT * FROM passkeys WHERE credentialID=?", [id], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result as unknown as dbAuthenticator);
            }
        });
    });
}

function updateAuthenticatorCounter(authDb: sqlite3.Database, id: string, newCounter: number): void {
    authDb.run("UPDATE passkeys SET counter=? WHERE credentialID=?", [newCounter, id]);
}

export async function _verifyAuthenticationResponse(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const body: AuthenticationResponseJSON = req.body;
    const expectedChallenge = await getAnyUserChallenge(req, authDb, req.params.username);
    const authenticator: dbAuthenticator = await getUserAuthenticator(authDb, body.id).catch((err: any) => {
        if (err) {
            console.error(err);
            return res.status(400).send({ error: "invalid authenticator" })
        }
    }) as unknown as dbAuthenticator;
    if (!Object.hasOwn(authenticator, "counter") && typeof authenticator.counter === "undefined") {
        console.log(authenticator);
        return res.status(400).send({ error: "invalid authenticator" });
    }
    let verification: VerifiedAuthenticationResponse;
    try {
        const opts: VerifyAuthenticationResponseOpts = {
            response: body,
            expectedChallenge: `${expectedChallenge}`,
            expectedOrigin: `https://${baseURLNoPcl}`,
            expectedRPID: baseURLNoPcl,
            authenticator: {
                credentialID: isoBase64URL.toBuffer(authenticator.credentialID),
                credentialPublicKey: isoBase64URL.toBuffer(authenticator.credentialPublicKey),
                counter: authenticator.counter
            },
            requireUserVerification: true,
        };
        verification = await verifyAuthenticationResponse(opts);
    } catch (error) {
        const _error = error as Error;
        console.error(_error);
        return res.status(400).send({ error: _error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        updateAuthenticatorCounter(authDb, body.id, authenticationInfo.newCounter);
        const authenticatedUserId = authenticator.userId;
        authDb.get("SELECT id, username, fullName, team, accessOk, admin, teamAdmin FROM users WHERE id=?", [authenticatedUserId], async (err: any, result: any) => {
            if (err) {
                res.status(500).json({ error: "internal server error (session key)" });
            } else {
                if (typeof result !== "undefined") {
                    if (result.accessOk === "false") {
                        res.status(500).json({ error: "account awaiting access approval" });
                    } else {
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
                            if (err) {
                                res.status(500).json({ error: "session key creation error" });
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
                                res.status(200).json({ verified });
                            }
                        });
                    }
                } else {
                    res.status(500).json({ error: "user account does not exist" });
                }
            }
        });
    }
}