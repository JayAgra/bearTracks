import express from "express";
import * as sqlite3 from "sqlite3";
import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL, isoUint8Array } from "@simplewebauthn/server/helpers";
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
    RegistrationResponseJSON,
} from "@simplewebauthn/typescript-types";
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

function getUserAuthenticators(req: express.Request, authDb: sqlite3.Database): any {
    return new Promise((resolve, reject) => {
        authDb.all("SELECT * FROM passkeys WHERE userId=?", [req.user.id], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result as unknown[] as Authenticator[]);
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
        excludeCredentials: userAuthenticators.map((device: any) => ({
            id: device.credentialID,
            type: "public-key",
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

function getUserCurrentChallenge(req: express.Request, authDb: sqlite3.Database): any {
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
        [req.user.id, authenticator.credentialID, authenticator.credentialPublicKey, authenticator.counter, authenticator.transports]
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
        const existingDevice = _userAuthenticators.find((device: any) => isoUint8Array.areEqual(device.credentialID, credentialID));

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

function getAnyUserAuthenticators(req: express.Request, authDb: sqlite3.Database, username: string): any {
    return new Promise((resolve, reject) => {
        authDb.all("SELECT * FROM passkeys WHERE username=?", [username], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result as unknown[] as Authenticator[]);
            }
        });
    });
}

export async function _generateAuthenticationOptions(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const opts: GenerateAuthenticationOptionsOpts = {
        timeout: 60000,
        allowCredentials: await getAnyUserAuthenticators(req, authDb, req.params.username).devices.map((device: any) => ({
            id: device.credentialID,
            type: "public-key",
        })),
        userVerification: "required",
        rpID: baseURLNoPcl,
    };

    const options = await generateAuthenticationOptions(opts);

    setCurrentChallenge(req, authDb, options.challenge);
    res.send(options);
}

function getUserAuthenticator(req: express.Request, authDb: sqlite3.Database, id: Uint8Array): any {
    return new Promise((resolve, reject) => {
        authDb.all("SELECT * FROM passkeys WHERE credentialId=?", [id], (err: any, result: any) => {
            if (err) {
                return reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

function updateAuthenticatorCounter(authDb: sqlite3.Database, id: Uint8Array, newCounter: number): void {
    authDb.run("UPDATE passkeys SET counter=? WHERE credentialID=?", [newCounter, id]);
}

export async function _verifyAuthenticationResponse(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const body: AuthenticationResponseJSON = req.body;
    const expectedChallenge = await getUserCurrentChallenge(req, authDb);
    const authenticator = await getUserAuthenticator(req, authDb, isoBase64URL.toBuffer(body.rawId)).catch((err: any) => {
        return res.status(400).send({ error: "invalid authenticator" })
    });

    let verification: VerifiedAuthenticationResponse;
    try {
        const opts: VerifyAuthenticationResponseOpts = {
            response: body,
            expectedChallenge: `${expectedChallenge}`,
            expectedOrigin: `https://${baseURLNoPcl}`,
            expectedRPID: baseURLNoPcl,
            authenticator: authenticator,
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
        updateAuthenticatorCounter(authDb, isoBase64URL.toBuffer(body.rawId), authenticationInfo.newCounter);
    }

    res.send({ verified });
}