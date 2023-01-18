const http = require("http");
const fs = require("fs");
const request = require("request");

const { clientId, clientSec } = require("./config.json");

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const code = url.searchParams.get("code");
    if (code == undefined) {
        res.writeHead(302, {
            Location: `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=http%3A%2F%2Flocalhost%2F&response_type=code&scope=identify%20email%20guilds`
        });
        res.end();
    } else {
        exchangeCodeForToken(code)
            .then((access_token) => {
                validateAccessToken(access_token)
                    .then((user) => {
                        fs.readFile("main.html", (err, data) => {
                            if (err) {
                                res.writeHead(404);
                                res.end("404 Not Found");
                                return;
                            }
                            res.writeHead(200, { "Content-Type": "text/html" });
                            res.end(data);
                        });
                    })
                    .catch((err) => {
                        console.log("token bad:", err);
                        res.writeHead(401);
                        res.end("401 Unauthorized");
                    });
            })
            .catch((err) => {
                console.log("could not get token from code:", err);
                res.writeHead(401);
                res.end("401 Unauthorized");
            });
    }
});


server.listen(80, () => {
    console.log("server on port 80");
});

function validateAccessToken(access_token) {
    return new Promise((resolve, reject) => {
        request.get({
            url: "https://discord.com/api/users/@me",
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        }, (err, res, body) => {
            if (err) {
                reject(err);
            } else {
                if (res.statusCode === 200) {
                    const user = JSON.parse(body);
                    resolve(user);
                    return
                } else {
                    return false;
                }
            }
        });
    });
}

function exchangeCodeForToken(code) {
  return new Promise((resolve, reject) => {
    request.post({
      url: "https://discord.com/api/oauth2/token",
      form: {
        client_id: clientId,
        client_secret: clientSec,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost",
        scope: "identify%20email%20guilds"
      }
    }, (err, res, body) => {
      if (err) {
        reject(err);
      } else {
        const json = JSON.parse(body);
        if (json.access_token) {
          resolve(json.access_token);
        } else {
          reject(new Error("no code from token, big sad"));
        }
      }
    });
  });
}

