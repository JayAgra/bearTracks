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
    elif [ $1 = "ssl" ]; then
        if [ $2 ]; then
            certbot certonly --standalone --keep-until-expiring --agree-tos -d $2
        else
            echo "Please add domain (w/o protocol)"
        fi
    elif [ $1 = "renewssl" ];then 
        ## assumes pm2
        certbot renew --deploy-hook='pm2 restart all'
    else
        echo "invalad parameter"
    fi
else
    echo "no parameter"
fi