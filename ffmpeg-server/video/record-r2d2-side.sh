#!/bin/bash

while true; do
  sleep 1
  filename=r2d2-side_$(date -u +"%Y-%m-%dT%H:%M:%SZ" | tr : -).mpg
  echo $filename
  curl -H "Content-Type: application/json" -d '{"camera":"r2d2-side", "file":"'"$filename"'", "width": 640, "height": 480}' http://w00tcamp-es.local:9200/seeingspace/video
  ffmpeg -f avfoundation -i "Logitech Camera" -f mpeg1video -s 640x480 -b:v 800k -r 30 http://127.0.0.1:8001/mrvulcan/640/480 $filename 
done
