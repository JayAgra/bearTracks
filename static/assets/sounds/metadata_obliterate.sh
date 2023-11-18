#! /bin/bash
ffmpeg -i "$1" -map_metadata -1 -c:v copy -c:a copy "$1".mp3
