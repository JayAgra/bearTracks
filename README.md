# bearTracks
a webapp for frc scouting<br><br>
![GitHub](https://img.shields.io/github/license/JayAgra/bearTracks) ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/jayagra/bearTracks) ![GitHub last commit](https://img.shields.io/github/last-commit/jayagra/bearTracks)

## setup
### script
set up bearTracks using the simple shell script.
```sh
curl -fSsl "https://raw.githubusercontent.com/JayAgra/bearTracks/main/setup.sh" | sudo sh
```
### environment variables
```
FRC_API_KEY
MY_TEAM
HOSTNAME
TEAMS
EVENTS
SEASONS
```
+ **FRC_API_KEY** FRC API credentials, in base64. standard encoding (`username:token`), and omit the "Basic " occasionally prepended to the string. obtain a key: https://frc-events.firstinspires.org/services/API. (default: `NONE`)<br>
+ **MY_TEAM** your team number (default: `766`)<br>
+ **HOSTNAME** your hostname (default: `localhost`)<br>
+ **TEAMS** is a comma separated list of all teams registered to use this instance of the app<br>
+ **EVENTS** is a comma separated list of all events the app should use<br>
+ **SEASONS** is a comma separated list of all seasons this app has been used
### ssl
Encryption is done through cloudflare. Use Full (Strict) mode and place your certificate and key in `ssl/cert.pem` and `ssl/key.pem`.
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
| iOS 17      | ✅    | ✅     | ✅      |
| iOS 16, 15  | ✅    | ✅     | ❌      |
| macOS 14    | ✅    | ✅     | ✅      |
| macOS 13, 12| ✅    | ✅     | ❌      |
| App Store   | ✅    | ✅     | ❌      |
| Web (PWA)   | ✅    | ❌     | ❌      |

<small>android users may use web</small>

[Data iOS](https://apps.apple.com/app/beartracks-data/id6475752596)<br>
[Data macOS](https://apps.apple.com/app/beartracks-data/id6475752596)<br>
[Scout iOS](https://apps.apple.com/app/beartracks-scout/id6476092907)<br>
[Manage Xcode](https://github.com/JayAgra/bearTracks/tree/main/ios/beartracks-manage)