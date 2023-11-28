[[ $EUID != 0 ]] && echo "\\033[1;31mplease run this as root\\033[0m" && exit 1                                 # ensure run by root

if [ "$1" ]                                                                                                     # ensure parameter provided
then
    if [ "$1" = "start" ]
        then
            echo "\\033[1;32mstarting...\\033[0m"                                                               #
            echo "type \"exit\" after the process starts"                                                       #
            echo "check nohup.out for logs"                                                                     #
            sudo nohup ./bear_tracks &                                                                          # start bear_tracks
        elif [ "$1" = "stop" ]
        then
            echo "\\033[1;31mstopping...\\033[0m"
            bear_tracks_pid=$(pidof bear_tracks)                                                                # get pid of bear_tracks
            if [ "$bear_tracks_pid" ]
                then
                    sudo kill $bear_tracks_pid                                                                  # kill if exists
                    echo "\\033[1;32mkilled bearTracks\\033[0m \\033[32m(bear_tracks $bear_tracks_pid)\\033[0m" # success message
                else
                    echo "\\033[31mbeartracks process not found\\033[0m"                                        # process not found
            fi
        else
            echo "please provide a parameter, \\033[1;32mstart\\033[0m or \\033[1;31mstop\\033[21m"             # invalid parameter
    fi
else
    echo "please provide a parameter, \\033[1;32mstart\\033[0m or \\033[1;31mstop\\033[21m"                     # no parameter
fi