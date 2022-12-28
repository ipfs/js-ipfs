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
    echo "Initializinga new IPFS directory."
    jsipfs init    
fi

sed "s/127.0.0.1/0.0.0.0/g" $IPFS_PATH/config

jsipfs daemon &
wait -n ${!}