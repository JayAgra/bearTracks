# bearTracks
a webapp for frc scouting<br><br>
![GitHub](https://img.shields.io/github/license/JayAgra/bearTracks) ![GitHub commit activity](https://img.shields.io/github/commit-activity/y/jayagra/bearTracks) ![GitHub last commit](https://img.shields.io/github/last-commit/jayagra/bearTracks) [![Maintainability](https://api.codeclimate.com/v1/badges/f9b5e7ac1b0ab70425e5/maintainability)](https://codeclimate.com/github/JayAgra/bearTracks/maintainability)<br>

## setup
### script
set up bearTracks using the simple shell script.
```sh
curl -fSsl "https://raw.githubusercontent.com/JayAgra/bearTracks/setup.sh" | sudo sh
```
### environment variables
```
FRC_API_KEY
MY_TEAM
HOSTNAME
```
+ **FRC_API_KEY** FRC API credentials, in base64. standard encoding (`username:token`), and omit the "Basic " occasionally prepended to the string. obtain a key: https://frc-events.firstinspires.org/services/API. (default: `NONE`)<br>
+ **MY_TEAM** your team number (default: `766`)<br>
+ **HOSTNAME** your hostname (default: `localhost`)
### ssl
an ssl certificate is *required*, and must be placed in the ssl directory, with filenames `key.pem` and `cert.pem`. for local testing, one can be self-signed using the following command (run from the bearTracks directory created by setup.sh)
```sh
openssl req -x509 -newkey rsa:4096 -nodes -keyout ./ssl/key.pem -out ./ssl/cert.pem -days 365 -subj '/CN=localhost'
```
