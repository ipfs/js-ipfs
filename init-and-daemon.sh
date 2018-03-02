#! /usr/bin/env bash

set -e

if [ -n $IPFS_PATH ]; then
  echo "Using $IPFS_PATH as IPFS repository"
else
  echo "You need to set IPFS_PATH environment variable to use this script"
  exit 1
fi

sed -i.bak 's/127.0.0.1/0.0.0.0/g' $IPFS_PATH/config

# Initialize the repo but ignore if error if it already exists
# This can be the case when we restart a container without stopping/removing it
node src/cli/bin.js init || true

node src/cli/bin.js daemon
