cd bearTracks                                                           # ~/bearTracks/bearTracks (assume start in ~/bearTracks)
git pull                                                                # pull from origin
git fetch --tags                                                        # get tags
latestTag=$(git describe --tags `git rev-list --tags --max-count=1`)    # set latest tag to variable latestTag
git checkout $latestTag                                                 # checkout latest tag
cargo build -r                                                          # build release (assume rust is already installed)
rm ../bear_tracks                                                       # delete old binary
cp target/release/bear_tracks ../bear_tracks                            # copy built object from target to bearTracks
echo "###"                                                              #
echo "bearTracks is now updated to version $latestTag"                  # bearTracks is now updated
echo "###"                                                              #