Resolve through IPLD graphs with the dag API
============================================

IPLD stands for [`InterPlanetary Linked-Data`](https://ipld.io/), it is the data model of the content-addressable web. It gives IPFS the ability to resolve through any kind of content-addressed graph, as long as the [adapter for the format is available](https://github.com/ipld/interface-ipld-format#modules-that-implement-the-interface).

This tutorial goes through several operations over IPLD graphs using the [DAG API](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core/API/dag).

## Before you start

First clone this repo, install dependencies in the project root and build the project.

```console
$ git clone https://github.com/ipfs/js-ipfs.git
$ cd js-ipfs
$ npm install
$ npm run build
```

## IPLD Formats

[IPLD](https://docs.ipld.io/) can read many datatypes, all of which are represented as blocks in the blockstore of your IPFS node.  In order to turn a block into a data structure it can use, IPLD uses different codecs to turn `Uint8Arrays` into JavaScript objects and back.

By default IPFS is bundled with [dag-pb](https://www.npmjs.com/package/ipld-dag-pb), [dag-cbor](https://www.npmjs.com/package/ipld-dag-cbor) and [raw](https://www.npmjs.com/package/ipld-raw) codecs which allow reading UnixFS files and JavaScript objects from the blockstore.

To configure other types, we must pass the `ipld.formats` option to the `IPFS.create()` function:

```javascript
const IPFS = require('ipfs')

const node = await IPFS.create({
  ipld: {
    formats: [
      require('ipld-git'),
      require('ipld-zcash'),
      require('ipld-bitcoin'),
      ...Object.values(require('ipld-ethereum')) // this format exports multiple codecs so flatten into a list
      // etc, etc
    ]
  }
})
```

See [ipld/interface-ipld-format](https://github.com/ipld/interface-ipld-format) for a list of modules that implement the `ipld-format` interface.

## [create nodes to build a graph](./put.js)

## [retrieve a node from a graph](./get.js)

## [resolve a path in a graph](./get-path.js)

## [resolve through graphs of different kind](./get-path-accross-formats.js)

## Video of the demos

Find a video with a walkthrough of this examples on Youtube:

[![](https://ipfs.io/ipfs/QmYkeiPtVTR8TdgBNa4u46RvjfnbUFUxSDdb8BqDpqDEer)](https://youtu.be/drULwJ_ZDRQ?t=1m29s)
