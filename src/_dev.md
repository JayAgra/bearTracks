# dev
setting up development environment
## macOS
`xcode-select --install`<br><br>
`curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sudo sh`<br><br>
`sudo rustup component add rust-src`<br><br>
*clone the repo*<br><br>
`cd bearTracks`<br><br>
`openssl req -x509 -newkey rsa:4096 -nodes -keyout ./ssl/key.pem -out ./ssl/cert.pem -days 365 -subj '/CN=localhost'`<br><br>
to run the code, use `sudo cargo run`. sudo is needed because macos doesn't like processes taking port 80 and 443
## linux
pretty much the same as macos
## windows
[idk figure it out](http://apple.com/macbook-air/)

<small>this branch was made *without* inhumane "production testing"</small>
