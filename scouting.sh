#!/bin/bash
if [ $1 ]; then
    if [ $1 = "update" ]; then
        read -p "The latest commit may be unstable. Continue? (Y/y) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]
        then
            git pull
            npm install
        fi
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
    elif [ $1 = "renewssl"]; then
        certbot renew --deploy-hook='npm start'
    else
        echo "invalad parameter"
    fi
else
    echo "no parameter"
fi