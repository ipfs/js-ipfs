# Custom IPLD formats

This example shows you how to configure an IPFS daemon with the ability to load extra IPLD formats so you can use them in your applications.

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

By default, IPFS is only configured to support a few common IPLD formats. Your application may require extra or more esoteric formats, in which case you can configure your node to support them using `options.ipld.formats` passed to the client or an in-process node or even a daemon if you start it with a wrapper.

See the following files for different configuration:

* [./in-process-node.js](./in-process-node.js) for running an in-process node as part of your confiugration
* [./daemon-node.js](./daemon-node.js) for running a node as a separate daemon process
