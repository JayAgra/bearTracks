const { baseURL } = require('./config.json');
const { exec } = require('child_process');
const commandExists = require('command-exists')
commandExists('ls', function(err, commandExists) {
    if(commandExists) {
        exec(`certbot certonly --standalone --keep-until-expiring --agree-tos -d ${baseURL} && npm startOnly`)
    } else {
        console.log("Please install certbot to start app! Try running (sudo) apt install certbot.")
    }
});