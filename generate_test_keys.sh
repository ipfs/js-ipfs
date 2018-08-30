#! /usr/bin/env bash

for I in {1..65}
do
  export IPFS_PATH=$(mktemp -d)
  node src/cli/bin.js init --bits=512
  KEYFILE=$(jq -r .Identity.PrivKey $IPFS_PATH/config | xargs -I {} echo "module.exports = '{}'")
  echo "Writing $KEYFILE to $I"
  echo "$KEYFILE" > "test/utils/keys/$I.js"
  rm -rf $IPFS_PATH
done
# > test/utils/keys/
