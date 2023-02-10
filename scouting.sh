#!/bin/bash
if [ $1 ]; then
    if [ $1 = "update" ]; then
        git pull
        npm install
    elif [ $1 = "start" ]; then
        npm start
    elif [ $1 = "setup-pm2" ]; then
        sudo npm install pm2 -g
        pm2 start serve.js
        pm2 start discord.js
        pm2 save
        pm2 startup
    elif [ $1 = "install" ]; then
        npm install
    elif [ $1 = "ssl" ]; then
        openssl x509 -enddate -noout -in ./ssl/certificate.crt
    else
        echo "invalad parameter"
    fi
else
    echo "no parameter"
fi