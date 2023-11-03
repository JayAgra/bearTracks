import exp from "constants";
import express from "express";
import * as sqlite3 from "sqlite3";

export type UserModel = {
    id: string;
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

export type Authenticator = {
    id?: number;
    userId: number;
    credentialID: Uint8Array;
    credentialPublicKey: Uint8Array;
    counter: number;
    credentialDeviceType: string;
    credentialBackedUp: boolean;
    transports?: AuthenticatorTransport[];
};

const { baseURLNoPcl } = require("../../../../config.json");
export const rpName = "bearTracks";
export const rpID = baseURLNoPcl;
export const origin = `https://${rpID}`;

export async function getUser(req: express.Request, authDb: sqlite3.Database): Promise<any> {
    authDb.get("SELECT * FROM users WHERE id=?", [req.user.id], (err: any, result: any) => {
        return result;
    });
    return;
}

export async function getUserAuthenticators(req: express.Request, authDb: sqlite3.Database): Promise<Authenticator[]> {
    authDb.all("SELECT * FROM passkeys WHERE userId=?", [req.user.id], (err: any, result: any) => {
        return result as unknown[] as Authenticator[];
    });
    return [];
}

export async function setCurrentChallenge(req: express.Request, authDb: sqlite3.Database, challenge: string): Promise<void> {
    authDb.run("UPDATE users SET currentChallenge=? WHERE id=?", [challenge, req.user.id]);
}

export async function getUserCurrentChallenge(req: express.Request, authDb: sqlite3.Database): Promise<string> {
    authDb.get("SELECT currentChallenge FROM users WHERE id=?", [req.user.id], (err: any, result: any) => {
        return result.currentChallenge;
    });
    return "";
}

export async function writePasskey(req: express.Request, authDb: sqlite3.Database, authenticator: Authenticator): Promise<void> {
    authDb.run(
        "INSERT INTO passkeys (userId, credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp) VALUES (?, ?, ?, ?, ?, ?)",
        [req.user.id, authenticator.credentialID, authenticator.credentialPublicKey, authenticator.counter, authenticator.credentialDeviceType, authenticator.credentialBackedUp]
    );
}

export async function getUserAuthenticator(req: express.Request, authDb: sqlite3.Database, id: Uint8Array): Promise<Authenticator | void> {
    authDb.get("SELECT * FROM passkeys WHERE credentialId=?", [id], (err, res) => {
        return res;
    });
}

export async function updateAuthenticatorCounter(authDb: sqlite3.Database, id: Uint8Array, newCounter: number): Promise<void> {
    authDb.run("UPDATE passkeys SET counter=? WHERE credentialID=?", [newCounter, id]);
}