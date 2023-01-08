#!/usr/bin/env bash
if [[ -d "$IPFS_PATH/repo.lock" ]]; then
    echo "Automatically removing a stale repo lock."
    rm -rf $IPFS_PATH/repo.lock    
fi

if ! [[ -f "$IPFS_PATH" ]]; then
    jsipfs init    
fi

jsipfs daemon & \
wait -n
