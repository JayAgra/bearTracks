# Scouting App
![GitHub](https://img.shields.io/github/license/JayAgra/scouting-app) ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/jayagra/scouting-app) ![GitHub last commit](https://img.shields.io/github/last-commit/jayagra/scouting-app)<br>

## Setup
### Hosting
You will need a VPS to run this, I would suggest using DigitalOcean Droplets. Mine is configured using Ubuntu 20.10, and the app is designed to work with it. Hosting the app on a windows machine will cause many issues. A standard SSD is just fine, and and I would suggest a minimum of the 2GB RAM/1 CPU/50GB Disk/2TB Transfer plan.
### config.json
```
{
	"frcapi": "",
	"myteam": "766",
	"repoUrl": "https://github.com/JayAgra/scouting-app.git",
	"season": 2023,
	"currentComp": "NONE",
	"baseURL": "http://localhost/"
}
```
+ **frcapi** FRC API credentials, in base64. Encode like username:token, and do not include anything before the base64 string. Obtain a key: https://frc-events.firstinspires.org/services/API<br>
+ **myteam** Team number<br>
+ **repoUrl** is the URL for the git repo to update from. Keep `https://github.com/JayAgra/scouting-app.git` in most cases, unless you are modifying the code, as it will make updates for future seasons easier<br>
+ **season** Current season<br>
+ **currentComp** 4-letter code for the team's current competition. Use "NONE" if no competition.<br>
+ **baseURL** Is the server's base URL
## Web Server
1. Set up DNS. This is done by creating an `A` record pointing to the IP address of the host (DigitalOcean can do this for you!) <br>
2. Using HTTPS is a very good idea. Set up a free certificate by running the ./scouting.sh script with the option ssl, and add the domain. The command should look like this: `./scouting.sh ssl scout.example.com`. The app should find the SSL automatically. To renew the SSL, run `./scouting.sh renewssl` (command works best when you use PM2).  <br>
 <br>Note about using the web server: The scouting app was designed to work perfectly using Ubuntu 20, it will work on other platforms but may require modifications.
