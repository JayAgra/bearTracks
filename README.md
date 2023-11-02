# bearTracks
a webapp for frc scouting<br><br>
![GitHub](https://img.shields.io/github/license/JayAgra/bearTracks) ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/jayagra/bearTracks) ![GitHub last commit](https://img.shields.io/github/last-commit/jayagra/bearTracks) [![Maintainability](https://api.codeclimate.com/v1/badges/f9b5e7ac1b0ab70425e5/maintainability)](https://codeclimate.com/github/JayAgra/bearTracks/maintainability)<br>

## Setup
### config.json
```
{
    "frcapi": "",
    "myteam": "766",
    "currentComp": "NONE",
    "baseURLNoPcl": "localhost"
}
```
+ **frcapi** FRC API credentials, in base64. Encode like username:token, and do not include anything before the base64 string. Obtain a key: https://frc-events.firstinspires.org/services/API<br>
+ **myteam** Team number<br>
+ **baseURLNoPcl** Is the server's base URL, without the protocol