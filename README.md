js-ipfs
=======

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) ![Build Status](https://travis-ci.org/ipfs/js-ipfs.svg?style=flat-square)](https://travis-ci.org/ipfs/js-ipfs) ![](https://img.shields.io/badge/coverage-75%25-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> IPFS JavaScript implementation  entry point and roadmap

# Description

This repo will contain the entry point for the JavaScript implementation of IPFS spec, similar to [go-ipfs](https://github.com/ipfs/go-ipfs). 

We are building js-ipfs because it will inform how go-ipfs works, separate concerns, and allow a complete in-browser-tab implementation with no install friction. Most of the work for IPFS does happen elsewhere, but this is an equally important part of our roadmap to lead to a permanent, IPFSed web.

# Contribute

IPFS implementation in JavaScript is a work in progress. As such, there's a few things you can do right now to help out:

  * Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS may be required, as well as the infrasture behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
  * **Perform code reviews**. Most of this has been developed by @diasdavid, which means that more eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
  * Take a look at go-ipfs and some of the planning repositories or issues: for instance, the libp2p spec [here](https://github.com/ipfs/specs/pull/19). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
  * **Add tests**. There can never be enough tests.
  * **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

# Usage

> **Disclamer: Currently, js-ipfs is not a full IPFS node, it delegates all of its operations to a IPFS node available in the network, see "Getting jsipfs ready" below for more details.

### Installation

```bash
$ npm i ipfs --save
```

```JavaScript
var IPFS = require('ipfs')

var node = new IPFS()
```

### Command line tool

In order to use js-ipfs as a CLI, you must install it with the -g flag.

```bash
$ npm i ipfs -g
```

The cli is availble through `jsipfs` in your terminal

# Project structure

```
┌───┐    ┌───────────────┐    ┌──────────────┐
│CLI│───▶│   HTTP API    ├───▶│IPFS Node Impl│
└───┘    └───────────────┘    └──────────────┘
                 △                    △
                 └──────────┬─────────┘
                            │
                         ┌─────┐
                         │Tests│
                         └─────┘
```

# Usage

> WIP

# Project Status

### Per component view

- **Network layer** - See hhttps://github.com/diasdavid/js-libp2p
- ipfs-repo - [spec](https://github.com/ipfs/specs/tree/master/repo) - [impl](https://github.com/ipfs/js-ipfs-repo)
  - keys
  - version
  - datastore.legacy
  - datastore
  - config
  - logs
  - locks
- ipfs-data-importing - [spec](https://github.com/ipfs/specs/pull/57) - [impl](https://github.com/ipfs/js-ipfs-data-importing)
  - fixed size chunker
  - rabin chunking
  - tar importer
  - MerkleDAG layout (protobufs)
  - IPLD layout (json + cbor)
- bitswap - [spec](https://github.com/ipfs/specs/pull/53) - [impl](https://github.com/ipfs/js-ipfs-bitswap)

### Per feature view

- **core**
  - [x] version
  - [ ] node (previously known as daemon)
    - [x] id
    - [ ] start
    - [ ] stop
  - [ ] block
    - [ ] get
    - [ ] put
    - [ ] stat
  - [ ] object - Basic manipulation of the DAG
    - [ ] data
    - [ ] get
    - [ ] links
    - [ ] new
    - [ ] patch
    - [ ] put
    - [ ] stat
  - [ ] refs - Listing of references. (alking around the graph)
    - [ ] local
  - [ ] repo
    - [ ] init
    - [ ] stat
    - [ ] gc
  - [ ] pin
    - [ ] add
    - [ ] ls
    - [ ] rm
  - [ ] log
    - [ ] level
    - [ ] tail
- **extensions**
  - [ ] name (IPNS)
    - [ ] publish
    - [ ] resolve
  - [ ] dns
    - [ ] resolve
  - [ ] tar
    - [ ] add
    - [ ] cat
  - [ ] tour
    - [ ] list
    - [ ] next
    - [ ] restart
  - [ ] files
    - [ ] add
    - [ ] cat
    - [ ] get
  - [ ] stat - Statistics about everything
    - [ ] bw
  - [ ] mount
  - [x] bootstrap
    - [x] add
    - [x] list
    - [x] rm
  - [ ] bitswap
    - [ ] stat
    - [ ] unwant
    - [ ] wantlist
- **tooling**
  - [ ] commands
  - [ ] update
  - [ ] init - sugar around ipfs repo init
  - [ ] config
    - [ ] edit
    - [x] replace
    - [x] show
  - [ ] daemon
  - [ ] diag
    - [ ] net
    - [ ] sys
- **network** (bubbles up from libp2p)
  - [ ] ping
  - [ ] dht
    - [ ] findpeer
    - [ ] findprovs
    - [ ] get
    - [ ] put
    - [ ] query
  - [ ] swarm
    - [ ] addrs
    - [ ] addrs local
    - [ ] connect
    - [ ] disconnect
    - [ ] filters
    - [ ] filters add
    - [ ] filters rm
    - [ ] peers
  - [ ] records (IPRS)
    - [ ] put
    - [ ] get
