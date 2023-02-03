# Scouting App
## Setup
### config.json
```
{
	"clientId": "",
	"token": "",
	"frcapi": "",
	"scoutteama": "",
	"scoutteamb": "",
	"leadscout": "",
	"drive": "",
	"pit": "",
	"myteam": "766",
	"repoUrl": "https://github.com/JayAgra/scouting-app.git",
	"botOwnerUserID": "",
	"season": 2023,
	"currentComp": "NONE",
	"clientSec": "",
	"redirectURI": "http://scout.example.com",
	"teamServerID": ""
}
```
**clientId** is your Discord bot's application ID<br><br>
**token** is your Discord bot's token<br><br>
**frcapi** is your FRC API credentials, in base64. Encode like username:token, and do not include anything before the base64 or after the equal sign. To obtain a key: https://frc-events.firstinspires.org/services/API<br><br>
**mainhostname** is the web address of the server where the scout app files are. ALL of the code assumes that it is in a folder `scout` in the root (would look like `example.com/scout`). The value here should NOT have a protocall or any filepath (proper form: `example.com` or `subdomain.example.com`).<br><br>
**scoutteama** is the role ID from Discord of a role named "Scout A" that has no permissions. It is a role for the bot to assign to scouts.<br><br>
**scoutteamb** is the second role for scouts. Use role name "Scout B".<br><br>
**leadscout** is a role for ONLY the lead scout(s) to have. Nobody else will be able to use lead scout commands, even with admin access.<br><br>
**drive** is the role id for the drive team<br><br>
**pit** is the role id for the pit crew<br><br>
**myteam** is team number.<br><br>
**repoUrl** is the URL for the git repo containing these files. keep `https://github.com/Team766/scouting-app.git` in most cases, unless you are modifying the code<br><br>
**botOwnerUserID** is the user ID of the bot owner or hoster who can use the /update command<br><br>
**season** is the current season<br><br>
**currentComp** 4-letter code for the team's current competition. Use "NONE" if no competition.<br><br>
**clientSec** Discord oauth secret<br><br>
**redirectURI** Where to redirect user after oauth. Must be added to discord, or the oauth will *not* work<br><br>
**teamServerID** Server ID of team discord. Used to check user's permissions.
