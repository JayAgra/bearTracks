const EventEmitter = require("events").EventEmitter;

function teams(req, res, frcapi) {
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
}

module.exports = { teams };
