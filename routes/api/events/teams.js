const EventEmitter = require("events").EventEmitter;
const https = require("https");

function invalidJSON(str) {
    try {
        JSON.parse(str);
        return false;
    } catch (error) {
        return true;
    }
}


async function teams(req, res, frcapi, season) {
    if (req.params.event !== "CCCC") {
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
            var chunks = [];

            response.on("data", (chunk) => {
                chunks.push(chunk);
            });
            response.on("end", (chunk) => {

                var body = Buffer.concat(chunks);
                dbody.emit("update", body);
            });

            response.on("error", (error) => {
                console.error(error);
            });
        });

        request.end();

        dbody.on("update", (body) => {
            if (invalidJSON(body)) {
                res.status(502).send("" + 0x1f61);
            } else {
                const parsedData = JSON.parse(body);
                var teams = [];
                for (var i = 0; i < parsedData.teams.length; i++) {
                    teams.push(parsedData.teams[i].teamNumber);
                }
                res.set("Cache-control", "public, max-age=23328000");
                res.status(200).setHeader("Content-type", "text/plain").send(teams.toString());
            }
        });
    } else {
        res.set("Cache-control", "public, max-age=23328000");
        res.status(200).send("8,253,649,701,766,841,846,852,1072,1425,1458,1671,1678,1967,2073,2135,2288,2551,2643,3189,3257,3482,3598,3859,4135,4159,4255,4643,4698,5027,5274,5458,5817,5924,59240,5940,59400,6059,6918,7137,7419,74190,7528,8016,80160,8768,9400,9634");
    }
}

module.exports = { teams };
