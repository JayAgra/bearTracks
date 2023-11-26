# dev
setting up development environment
## macOS
`xcode-select --install`<br><br>
`curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sudo sh`<br><br>
`sudo rustup component add rust-src`<br><br>
to run the code, use `sudo cargo run`. sudo is needed because macos doesn't like processes taking port 80 and 443

<small>this branch was made *without* inhumane "production testing"</small>