#!/bin/bash
if [ "$1" ]; then
    if [ "$1" = "update" ]; then
        read -p "The latest commit may be unstable. Continue? (Y/y) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]
        then
            git pull
            npm install
        fi
    elif [ "$1" = "start" ]; then
        npm start
    elif [ "$1" = "setup-pm2" ]; then
        sudo npm install pm2 -g
        pm2 start serve.js
        pm2 save
        pm2 startup
    elif [ "$1" = "install" ]; then
        npm install
    elif [ "$1" = "ssl" ]; then
        if [ "$2" ]; then
            certbot certonly --standalone --keep-until-expiring --agree-tos -d "$2"
        else
            echo "Please add domain (w/o protocol)"
        fi
    elif [ "$1" = "renewssl" ]; then 
        ## assumes pm2
        certbot renew --deploy-hook='pm2 restart all'
    elif [ "$1" = "savedb" ]; then
        # save database file to the /images directory for backups
        rm data.zip
        zip data.zip data.db data.db-shm data.db-wal data_transact.db data_transact.db-shm data_transact.db-wal
        rm images/data.zip
        mv data.zip images/data.zip
    elif [ "$1" = "clearbackup" ]; then
        rm images/data.zip
        rm data.zip
    else
        echo "invalad parameter"
    fi
else
    echo "no parameter"
fi