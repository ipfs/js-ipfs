#!/bin/sh

echo "-- downloading benchmarks"
go get github.com/whyrusleeping/ipfs-whatever

echo "-- setting up ipfs"
export IPFS_PATH=/tmp/bench-repo
node src/cli/bin.js init
node src/cli/bin.js daemon &
sleep 5

echo "-- running benchmarks"
ipfs-whatever > current.json

echo "-- cleaning up"
rm -rf /tmp/bench-repo
