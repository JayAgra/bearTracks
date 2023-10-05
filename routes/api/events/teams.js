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


function teams(req, res, frcapi, season) {
    if (req.params.event !== "WOOD") {
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
                res.status(500).send("error! invalid data");
            } else {
                const parsedData = JSON.parse(body);
                var teams = [];
                for (var i = 0; i < parsedData.teams.length; i++) {
                    teams.push(parsedData.teams[i].teamNumber);
                }
                res.status(200)
                    .setHeader("Content-type", "text/plain")
                    .send(teams.toString());
            }
        });
    } else {
        res.status(200).send("8,100,115,199,253,581,670,766,840,841,846,852,1072,1700,1868,2473,2489,2643,2813,3045,3256,4186,4765,4904,4990,5026,5027,5419,5430,6036,6059,6418,6962,7245,7777,8033,8048,8404,9114,9143,9400");
    }
}

module.exports = { teams };
