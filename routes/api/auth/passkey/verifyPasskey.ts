import express from "express";
import * as sqlite3 from "sqlite3";
import * as SimpleWebAuthnServer from "@simplewebauthn/server";
import { Authenticator, getUserCurrentChallenge, origin, rpID, writePasskey } from "./_shared";

export async function verifyPasskey(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const expectedChallenge: string = getUserCurrentChallenge(req, authDb);
    let verification;

    try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: req.body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID
        });
    } catch (error: any) {
        console.error(error);
        return res.status(400).send({ error: error.message });
    }

    const { verified } = verification;
    const { registrationInfo } = verification;
    const newAuthenticator: Authenticator = {
        id: 0,
        userId: req.user.id,
        credentialID: registrationInfo?.credentialID as Uint8Array,
        credentialPublicKey: registrationInfo?.credentialPublicKey as Uint8Array,
        counter: registrationInfo?.counter as number,
        credentialDeviceType: registrationInfo?.credentialDeviceType as string,
        credentialBackedUp: registrationInfo?.credentialBackedUp as boolean,
    }
    await writePasskey(req, authDb, newAuthenticator);
    return res.status(200).json({ "verified": verified });
}