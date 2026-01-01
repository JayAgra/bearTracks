# bearTracks
An app for frc scouting.<br><br>

## Setup
### Settings Contained in .env
+ **FRC_API_KEY** FRC API credentials, in base64. (default: `NONE`)<br>
+ **MY_TEAM** Your team number (default: `1`)<br>
+ **HOSTNAME** Your public IP (default: `localhost`)<br>
+ **PASSKEY_RP_ID** Domain for the passkeys. If this does not match the domain the user navigates to, passkeys will not work. (default: `localhost`)<br>
+ **TEAMS** Comma separated list of all teams registered to use the app<br>
+ **EVENTS** Comma separated list of all events the app should support.<br>
+ **SEASONS** Comma separated list of all seasons this app has been used<br>
+ **APN_KEY_ID** ID of the APN key in the SSL folder (filename APN.p8)<br>
+ **APN_TEAM_ID** Team ID of the APN key
### SSL
Use cloudflare ssl in full strict mode. Place the certificate and key in `ssl/cert.pem` and `ssl/key.pem`. Place your APN.p8 file in the folder for push notification support.
### Running Server
To start the server from a ssh session, run the following command from the ~/bearTracks directory.
```sh
nohup ./bear_tracks &
```
You may now exit the ssh session.
To stop bearTracks, run
```sh
./service.sh stop
```
Preferably, create a system service to do this automatically on boot.

### License
Copyright © 2022-2026 Jayen Agrawal. All rights reserved. Email jay@jayagra.com for inquiries. By the GitHub TOS, you are permitted to view and fork the code. Everything beyond that, including but not limited to modification (public or private, even in your fork), distribution, and use in any form is prohibited without written permission.

## iOS & macOS apps
The clients are broken into 3 apps- Data, Scout, and Manage. Manage is intended for the server admins, and can only be installed by compiling it yourself. Scout and Data are available on the App Store. Data uses Mac Catalyst to provide an optimized macOS experience, while Scout runs the iPad version. Accounts may be created in-app or on [beartracks.io/create](https://beartracks.io/create).

|             | Scout | Data | Manage |
|-------------|------|-------|--------|
| iOS 17+     | ✅    | ✅     | ✅      |
| iOS 15+     | ✅    | ✅     | ❌      |
| macOS 14+   | ✅    | ✅     | ✅      |
| macOS 12+   | ✅    | ✅     | ❌      |
| watchOS 9+  | ❌    | ✅     | ❌      |
| visionOS 2+ | ❌    | ✅     | ❌      |
| App Store   | ✅    | ✅     | ❌      |
| Web (PWA)   | ✅    | ✅     | ❌      |

<small>Android users may use web 💀.<br>Web data access is not yet as complete as iOS access.</small>

[Data iOS](https://apps.apple.com/app/beartracks-data/id6475752596)<br>
[Data macOS](https://apps.apple.com/app/beartracks-data/id6475752596)<br>
[Scout iOS](https://apps.apple.com/app/beartracks-scout/id6476092907)<br>
[Manage Xcode](https://github.com/JayAgra/bearTracks/tree/main/ios/beartracks-manage)