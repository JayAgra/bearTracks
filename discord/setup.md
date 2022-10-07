# Discord Bot Component

## config.json
```
{
	"clientId": "",
	"token": "",
	"frcapi": "",
	"mainhostname": "",
	"scoutteama": "",
	"scoutteamb": "",
	"leadscout": ""
}
```
**clientId** is your Discord bot's application ID<br><br>
**token** is your Discord bot's token<br><br>
**frcapi** is your FRC API credentials, in base64. Encode like username:token, and do not include anything before the base64 or after the equal sign. To obtain a key: https://frc-events.firstinspires.org/services/API<br><br>
**mainhostname** is the web address of the server where the scout app files are. ALL of the code assumes that it is in a folder `scout` in the root (would look like `example.com/scout`). The value here should NOT have a protocall or any filepath (proper form: `example.com` or `subdomain.example.com`).<br><br>
**scoutteama** is the role ID from Discord of a role named "Scout A" that has no permissions. It is a role for the bot to assign to scouts.<br><br>
**scoutteamb** is the second role for scouts. Use role name "Scout B".<br><br>
**leadscout** is a role for ONLY the lead scout(s) to have. Nobody else will be able to use lead scout commands, even with admin access.
