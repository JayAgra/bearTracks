# Setting up the server
This could take up to 30 minutes

## Getting the service
The example here will be DigitalOcean<br><br>
Create an account on <a href="https://m.do.co/c/547c9991719e">DigitalOcean</a> (referral link) and go to the Droplets tab.<br>
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-rpbc-2.png?raw=true">
Select Create Droplet.
    <details>
    <summary>A good *minimum* spec, $12 at time of writing.</summary>
    <img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-rqcj-2.png?raw=true">
    </details>
Now, go to the project listed in the top left. This was created when you created the droplet.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-rrdi-2.png?raw=true">
The droplet is currently accessable by typing the IP address into a browser, but we want to link a domain.<br>
Click the 3 dots and "Add a domain"
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-ruqt-2.png?raw=true">
Now, enter the details of the domain you own. If you do not own the domain, this will not work! Now, press Add Domain.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-ruxn.png?raw=true">
DigitalOcean will give you a few DNS records to add to your domain. This can be done through the company you registered the domain with. See the company's information on how to do this.<br>
For step 2 shown in the picture before, add a subdomain if you would like, or use "@" to go without one.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-rvig.png?raw=true">

## Accessing the service<img width="682" alt="image" src="https://user-images.githubusercontent.com/69493224/223328610-dd552e26-6b72-4f91-a412-f946ce83b243.png">

Now, open Terminal or your OS equivalent. This will not work on Windows.
Start an SSH session. The command is `ssh root@DRO.PL.ET.IP`, where DRO.PL.ET.IP is the IP address of the droplet
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-rwyf-2.png?raw=true">
*If you selected SSH key, I assume you selected it because you know how to use it. If not, reset it or look at DigitalOcean's docs.*<br>
Now, type the password you selected and press enter. Note that in command line interfaces, no character count will be shown.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-rxwx-2.png?raw=true">
You are in!
<br><br>
Now, clone the scouting app with the command `git clone https: //github.com/JayAgra/scouting-app.git`. Keep in mind the latest commit may be unstable.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-rynd-2.png?raw=true">
Once the clone finishes, cd to the app `cd scouting-app`
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-rznt-2.png?raw=true">
Now, work on the config file. Rename it, and use nano or another editor to open it. `mv config.example.json config.json` `nano config.json`
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-sclv-2.png?raw=true">
FIll out the config file. If you need tokens, see tokens.md in the docs folder.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-scwl-2.png?raw=true">
<br><br>
After the config is done, it is time to install an SSL. Before we do this, confirm on DigitalOcean that the domain is configured.<br>
Still in the `scouting-app` directory, run the command `./scouting.sh ssl <DOMAIN>`. You will likely get this error.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-secd-2.png?raw=true">
Install Certbot to fix this. `sudo apt install certbot`.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-sexf-2.png?raw=true">
Try running SSL command now.
<img src="https://github.com/JayAgra/scouting-app/blob/main/docs/images/websetup/SCR-20230306-sffc-2.png?raw=true">
If this completes, and you finished config.json, you are ready to start the app!<br>
To add the app to pm2, a node process manager that is **highly** encouraged to use, run `./scouting.sh setup-pm2`. Now, run `pm2 start` and the app should run, with an SSL!
    <details>
    <summary>Renew SSL</summary>
    `./scouting.sh renewssl`
    </details>
