#!/usr/bin/env bash

if ! [[ -f "$IPFS_PATH" ]]; then
    jsipfs init    
fi

jsipfs daemon & \
wait -n
