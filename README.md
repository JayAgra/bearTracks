# bearTracks
a webapp for frc scouting<br><br>
![GitHub](https://img.shields.io/github/license/JayAgra/bearTracks) ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/jayagra/bearTracks) ![GitHub last commit](https://img.shields.io/github/last-commit/jayagra/bearTracks)

## setup
### environment variables
```
FRC_API_KEY
MY_TEAM
HOSTNAME
PASSKEY_RP_ID
TEAMS
EVENTS
SEASONS
APN_KEY_ID
APN_TEAM_ID
```
+ **FRC_API_KEY** FRC API credentials, in base64. standard encoding (`username:token`), and omit the "Basic " occasionally prepended to the string. obtain a key: https://frc-events.firstinspires.org/services/API. (default: `NONE`)<br>
+ **MY_TEAM** your team number (default: `766`)<br>
+ **HOSTNAME** your public IP (default: `localhost`)<br>
+ **PASSKEY_RP_ID** the domain for the passkeys (default: `localhost`)<br>
+ **TEAMS** is a comma separated list of all teams registered to use this instance of the app<br>
+ **EVENTS** is a comma separated list of all events the app should use<br>
+ **SEASONS** is a comma separated list of all seasons this app has been used
+ **APN_KEY_ID** the ID of the APN key in the ssl folder (filename APN.p8)
+ **APN_TEAM_ID** the team ID of the APN key
### ssl
use cloudflare ssl in full strict mode. place certificate and key in `ssl/cert.pem` and `ssl/key.pem`.
### running server
To start the server from a ssh session, run the following command from the ~/bearTracks directory.
```sh
nohup ./bear_tracks &
```
you may now exit the ssh session.
To stop bearTracks, run
```sh
./service.sh stop
```


## iOS & macOS apps

The clients are broken into 3 apps- Data, Scout, and Manage. Manage is intended for the server admins, and can only be installed by compiling it yourself. Scout and Data are available on the App Store. Data uses Mac Catalyst to provide an optimized macOS experience, while Scout runs the iPad version. Accounts may be created in-app or on [beartracks.io/create](https://beartracks.io/create).

|             | Scout | Data | Manage |
|-------------|------|-------|--------|
| iOS 17, 18  | ✅    | ✅     | ✅      |
| iOS 16, 15  | ✅    | ✅     | ❌      |
| macOS 14, 15| ✅    | ✅     | ✅      |
| macOS 13, 12| ✅    | ✅     | ❌      |
| watchOS 9-11| ❌    | ✅     | ❌      |
| visionOS 2  | ❌    | ✅     | ❌      |
| App Store   | ✅    | ✅     | ❌      |
| Web (PWA)   | ✅    | ✅     | ❌      |

<small>android users may use web.<br>web data access is not as complete as iOS access.</small>

[Data iOS](https://apps.apple.com/app/beartracks-data/id6475752596)<br>
[Data macOS](https://apps.apple.com/app/beartracks-data/id6475752596)<br>
[Scout iOS](https://apps.apple.com/app/beartracks-scout/id6476092907)<br>
[Manage Xcode](https://github.com/JayAgra/bearTracks/tree/main/ios/beartracks-manage)