import express from "express";
import * as sqlite3 from "sqlite3";
import * as SimpleWebAuthnServer from "@simplewebauthn/server";
import { Authenticator, UserModel, getUser, getUserAuthenticators, setCurrentChallenge, rpID } from "./_shared";

export async function authPasskey(req: express.Request, res: express.Response, authDb: sqlite3.Database) {
    const user: UserModel = (await getUser(req, authDb)) as UserModel;
    const userAuthenticators: Authenticator[] = await getUserAuthenticators(req, authDb);

    const options = await SimpleWebAuthnServer.generateAuthenticationOptions({
        rpID,
        allowCredentials: userAuthenticators.map((authenticator) => ({
            id: authenticator.credentialID,
            type: "public-key",
            transports: authenticator.transports,
        })),
        userVerification: "preferred",
    });

    setCurrentChallenge(req, authDb, options.challenge);

    return res.status(200).json(options);
}