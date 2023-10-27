#!/bin/bash

if [ "$1" ]; then
    if [ "$1" = "update" ]; then
        read -p "The latest commit may be unstable. Continue? (Y/y) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]
        then
            git pull
            npm install
            pm2 restart all
        fi
    elif [ "$1" = "start" ]; then
        npm start
    elif [ "$1" = "setup-pm2" ]; then
        curl -fsSL https://bun.sh/install | bash
        sudo npm install pm2 -g
        pm2 start pm2.config.js
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
    elif [ "$1" = "backup" ]; then
        rm data.zip
        zip data.zip data.db data.db-shm data.db-wal data_transact.db data_transact.db-shm data_transact.db-wal data_auth.db data_auth.db-shm data_auth.db-wal
        rm backups/data.zip
        mv data.zip backups/data_$(date +%s).zip
    elif [ "$1" = "savedb" ]; then
        # save database file to the /images directory for backups
        if [ "$2" = "auth"]; then
            rm data.zip
            zip data.zip data.db data.db-shm data.db-wal data_transact.db data_transact.db-shm data_transact.db-wal data_auth.db data_auth.db-shm data_auth.db-wal
            rm images/data.zip
            mv data.zip images/data.zip
        else
            rm data.zip
            zip data.zip data.db data.db-shm data.db-wal data_transact.db data_transact.db-shm data_transact.db-wal
            rm images/data.zip
            mv data.zip images/data.zip
        fi
    elif [ "$1" = "clearbackup" ]; then
        rm images/data.zip
        rm data.zip
    elif [ "$1" = "hardresetpoints" ]; then
        sqlite3 data_transact.db "DELETE FROM transactions;"
        sqlite3 data_auth.db "UPDATE users SET score = 0;"
    elif [ "$1" = "deltransactions" ]; then
        sqlite3 data_transact.db "DELETE FROM transactions;"
    elif [ "$1" = "grantadmin" ]; then
        if [ "$2" ]; then
            sqlite3 data_auth.db "UPDATE users SET admin='true', accessOk='true' WHERE email = $2;"
            echo "if a user with email $2 exists, they now have admin access"
        else
            echo "no email provided (provide email of user to grant admin access to)"
        fi
    elif [ "$1" = "removeadmin" ]; then
        if [ "$2" ]; then
            sqlite3 data_auth.db "UPDATE users SET admin='false' WHERE email = $2;"
            echo "if a user with email $2 exists, they no longer have admin access"
        else
            echo "no email provided (provide email of user to remove admin access from)"
        fi
    else
        echo "invalid parameter provided."
        echo "valid parameters:"
        echo ""
        printf "update\t\t\tupdates app\n"
        printf "start\t\t\tstarts app (useless)\n"
        printf "setup-pm2\t\tsets up app and server to work with pm2\n"
        printf "install\t\t\tinstalls deps\n"
        printf "ssl\t\t\tgets a new ssl certificate\n"
        printf "renewssl\t\trenews an existing ssl certificate\n"
        printf "backup\t\t\tbacks up entire database to backups dir\n"
        printf "savedb\t\t\tzips db and makes it available in the images directory\n"
        printf "clearbackup\t\tdeletes db backup from images directory\n"
        printf "hardresetpoints\t\thard reset all scout points. no records remain.\n"
        printf "deltransactions\t\tpurges the transactions database\n"
        printf "grantadmin\t\tgrant admin access to specified email address\n"
        printf "removeadmin\t\tremove admin access from specified email address\n"
    fi
else
    echo "no parameter provided."
    echo "valid parameters:"
    echo ""
    printf "update\t\t\tupdates app\n"
    printf "start\t\t\tstarts app (useless)\n"
    printf "setup-pm2\t\tsets up app and server to work with pm2\n"
    printf "install\t\t\tinstalls deps\n"
    printf "ssl\t\t\tgets a new ssl certificate\n"
    printf "renewssl\t\trenews an existing ssl certificate\n"
    printf "backup\t\t\tbacks up entire database to backups dir\n"
    printf "savedb\t\t\tzips db and makes it available in the images directory\n"
    printf "clearbackup\t\tdeletes db backup from images directory\n"
    printf "hardresetpoints\t\thard reset all scout points. no records remain.\n"
    printf "deltransactions\t\tpurges the transactions database\n"
    printf "grantadmin\t\tgrant admin access to specified email address\n"
    printf "removeadmin\t\tremove admin access from specified email address\n"
fi