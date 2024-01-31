sudo apt-get update                                                     #
sudo apt-get install libssl-dev                                         # linux build requirements
sudo apt-get install pkg-config                                         #
mkdir bearTracks && cd bearTracks                                       # ~/bearTracks
git clone "https://github.com/JayAgra/bearTracks.git"                   # clone git repo
cd bearTracks                                                           # ~/bearTracks/bearTracks (git repo)
git fetch --tags                                                        # get tags from remote
latestTag=$(git describe --tags `git rev-list --tags --max-count=1`)    # get latest tag and set to variable latestTag
git checkout $latestTag                                                 # checkout latest tag (makes sure we have stable)
cd ../                                                                  # ~/bearTracks
cp bearTracks/data.db data.db                                           # # #
cp bearTracks/data_auth.db data_auth.db                                 # copy necessary files from git repo
cp bearTracks/data_transact.db data_transact.db                         # to this root folder
cp bearTracks/.example.env .env                                         # # #
cp bearTracks/update.sh update.sh                                       # copy update script
chmod +x update.sh                                                      # make it executatble
cp bearTracks/service.sh service.sh                                     # copy service management script
chmod +x service.sh                                                     # make it executatble
mkdir ssl                                                               # create ssl directory for certificates
mkdir cache                                                             # create directory for server cache
cd bearTracks                                                           # ~/bearTracks/bearTracks (git repo)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh          # install rust
source "$HOME/.cargo/env"                                               # source (needed if rust is newly installed)
cargo build -r                                                          # build release
cp target/release/bear_tracks ../bear_tracks                            # copy built object from target to bearTracks
echo "###"                                                              #
echo "bearTracks $latestTag is now installed"                           # print version number
echo "please edit the .env file in the new bearTracks directory"        # edit the env file for program to run correctly
echo "cd bearTracks && nano .env"                                       # guide user to editing .env
echo "###"                                                              #