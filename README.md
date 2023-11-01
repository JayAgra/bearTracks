# Scouting App
![GitHub](https://img.shields.io/github/license/JayAgra/scouting-app) ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/jayagra/scouting-app) ![GitHub last commit](https://img.shields.io/github/last-commit/jayagra/scouting-app) [![Maintainability](https://api.codeclimate.com/v1/badges/4acfda318fd3f3eb7fc9/maintainability)](https://codeclimate.com/github/JayAgra/scouting-app/maintainability)<br>

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