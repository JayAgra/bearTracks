#! /bin/bash
ffmpeg -i "$1" -codec:a libmp3lame -b:a 10k -ac 1 -ar 8000 "$2"
