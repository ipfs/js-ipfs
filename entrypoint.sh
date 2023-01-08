#!/usr/bin/env bash

# Proxy signals
_term() { 
  echo "Caught SIGTERM signal!"
  pkill -TERM jsipfs
  pkill -TERM -P1
  exit 0
}

trap _term SIGTERM

export IPFS_PATH=$IPFS_PATH

if ! [[ -f "$IPFS_PATH" ]]; then
    jsipfs init    
fi

jsipfs daemon & \
wait -n
