if [ "$1" ]
then
    if [ "$1" = "start" ]
    then
        echo "\\033[1;32mstarting...\\033[0m"
        echo "type \"exit\" after the process starts"
        nohup ./bear_tracks &
    elif [ "$1" = "stop" ]
    then
        echo "\\033[1;31mstopping...\\033[21m"
        $bear_tracks_pid=pidof bear_tracks
        sudo kill $bear_tracks_pid
        echo "killed bearTracks (bear_tracks $bear_tracks_pid)"
    else
        echo "please provide a parameter, \\033[1;32mstart\\033[0m or \\033[1;31mstop\\033[21m"
    fi
else
    echo "please provide a parameter, \\033[1;32mstart\\033[0m or \\033[1;31mstop\\033[21m"
fi