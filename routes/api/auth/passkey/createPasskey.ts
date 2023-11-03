import express from "express";
import * as sqlite3 from "sqlite3";
import * as SimpleWebAuthnServer from "@simplewebauthn/server";
import { UserModel, Authenticator, getUser, getUserAuthenticators, setCurrentChallenge, rpName, rpID } from "./_shared";

export async function createPasskey(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const user: UserModel = getUser(req, authDb) as UserModel;
    const userAuthenticators: Authenticator[] = await getUserAuthenticators(req, authDb);

    const options = await SimpleWebAuthnServer.generateRegistrationOptions({
        rpName,
        rpID,
        userID: user.id as unknown as string,
        userName: user.username,
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