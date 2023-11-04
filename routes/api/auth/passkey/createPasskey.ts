import express from "express";
import * as sqlite3 from "sqlite3";
import * as SimpleWebAuthnServer from "@simplewebauthn/server";
import { Authenticator, getUserAuthenticators, setCurrentChallenge, rpName, rpID } from "./_shared";

export async function createPasskey(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const userAuthenticators: Authenticator[] = getUserAuthenticators(req, authDb);

    const options = await SimpleWebAuthnServer.generateRegistrationOptions({
        rpName,
        rpID,
        userID: String(req.user.id),
        userName: req.user.username,
        attestationType: "none",
        excludeCredentials: userAuthenticators.map((authenticator) => ({
            id: authenticator.credentialID,
            type: "public-key",
            transports: authenticator.transports,
        })),
        authenticatorSelection: {
            residentKey: "preferred",
            userVerification: "preferred",
            authenticatorAttachment: "platform",
        },
    });

    setCurrentChallenge(req, authDb, options.challenge);

    res.status(200).json(options);
}