const { baseURLNoPcl } = require('./config.json');
const { spawn } = require('child_process');
const commandExists = require('command-exists')
commandExists('certbot', function(err, commandExists) {
    if(commandExists) {
        const spawnProcess = spawn(`certbot`, [ 'certonly','--standalone', '--keep-until-expiring', '--agree-tos', `-d ${baseURLNoPcl}` ]);
        spawnProcess.stdout.on('data', data => {
            console.log(`${data}`);
        })
        spawnProcess.stderr.on("data", (data) => {
            console.log(`${data}`);
        });
        spawnProcess.on('exit', code => {
            console.log(`Process ended with ${code}`);
        })
    } else {
        console.log("Please install certbot to start app! Try running (sudo) apt install certbot.")
    }
});