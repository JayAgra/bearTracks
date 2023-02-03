# Scouting App
## Setup
### Discord App
1. **Create app** Visit http://discord.com/developers/applications to create an app. Name it whatever you would like, and keep the token, client secret, and app ID for use in the config file.<br>
2. **Add Oauth2 redirect URI** Add the redirect URI you would like to use to Discord, if this step is skipped oauth will NOT work!<br>
3. **Add Discord bot to server** Use the URL `https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID&permissions=526469360720&scope=bot%20applications.commands`, and replace `CLIENT_ID` with your application ID
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
**clientId** Discord application ID<br>
**token** Discord bot token<br>
**frcapi** FRC API credentials, in base64. Encode like username:token, and do not include anything before the base64 string. Obtain a key: https://frc-events.firstinspires.org/services/API<br>
**scoutteama** Role ID from Discord of a role named "Scout A" that has no permissions.<br>
**scoutteamb** ID of second role for scouts. Use role name "Scout B".<br>
**leadscout** Role ID for lead scouts.<br>
**drive** Role ID for drive team<br>
**pit** Role ID of pit<br>
**myteam** Team number<br>
**repoUrl** is the URL for the git repo to update from. Keep `https://github.com/JayAgra/scouting-app.git` in most cases, unless you are modifying the code, as it will make updates for future seasons easier<br>
**botOwnerUserID** User ID of the bot owner or hoster who can use the /update command<br>
**season** Current season<br>
**currentComp** 4-letter code for the team's current competition. Use "NONE" if no competition.<br>
**clientSec** Discord oauth secret<br>
**redirectURI** Where to redirect user after oauth. Must be added to discord, or the oauth will *not* work<br>
**teamServerID** Server ID of team discord. Used to check user's permissions.
