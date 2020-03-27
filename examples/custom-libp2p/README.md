# Customizing your libp2p bundle

This example shows you how to make full use of the ipfs configuration to create a libp2p bundle function. As IPFS applications become more complex, their needs for a custom libp2p bundle also grow. Instead of fighting with configuration options, you can use your own libp2p bundle function to get exactly what you need.

## Before you start

First clone this repo, install dependencies in the project root and build the project.

```console
$ git clone https://github.com/ipfs/js-ipfs.git
$ cd js-ipfs
$ npm install
$ npm run build
```

## Running the example

Running this example should result in metrics being logged out to the console every few seconds.

```
> npm start
```

## Play with the configuration!

With the metrics for peers and bandwidth stats being logged out, try playing around with the nodes configuration to see what kind of metrics you can get. How many peers are you getting? What does your bandwidth look like?

This is also a good opportunity to explore the various stats that ipfs offers! Not seeing a statistic you think would be useful? We'd love to have you [contribute](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md)!
