#!/bin/sh

for f in ipfs-*; do
  cd $f;
  if [ -e "package.json" ]
  then
    echo "installing deps for $f...";
    npm install;
  fi
  cd ..;
done
