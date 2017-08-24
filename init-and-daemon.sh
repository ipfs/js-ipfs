#! /bin/sh -e
node src/cli/bin.js init

sed -i.bak 's/127.0.0.1/0.0.0.0/g' $IPFS_PATH/config

node src/cli/bin.js daemon
