import express from "express";
import { EventEmitter } from "events";
import * as https from "https";

function invalidJSON(str: string): boolean {
    try {
        JSON.parse(str);
        return false;
    } catch (error) {
        return true;
    }
}


export async function teamsFrcApi(req: express.Request, res: express.Response, frcapi: string, season: number) {
    var dbody = new EventEmitter();
    var options = {
        method: "GET",
        hostname: "frc-api.firstinspires.org",
        path: `/v3.0/${season}/teams?eventCode=${req.params.event}`,
        headers: {
            Authorization: "Basic " + frcapi,
        },
        maxRedirects: 20,
    };

    var request = https.request(options, (response) => {
        var chunks: any[] = [];

        response.on("data", (chunk: any) => {
            chunks.push(chunk);
        });
        response.on("end", (chunk: any) => {
            var body = Buffer.concat(chunks);
            dbody.emit("update", body);
        });

        response.on("error", (error: any) => {
            console.error(error);
        });
    });

    request.end();

    dbody.on("update", (body) => {
        if (invalidJSON(body)) {
            return res.status(502).send("" + 0x1f61);
        } else {
            const parsedData = JSON.parse(body);
            var teams: Array<number> = [];
            for (var i = 0; i < parsedData.teams.length; i++) {
                teams.push(parsedData.teams[i].teamNumber);
            }
            res.set("Cache-control", "public, max-age=23328000");
            return res.status(200).setHeader("Content-type", "text/plain").send(teams.toString());
        }
    });
}
