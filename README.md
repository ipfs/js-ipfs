IPFS JavaScript Implementation
==============================

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
$ npm install ipfs --global
```

The cli is availble through `jsipfs` in your terminal

# Project structure

```
┌───┐    ┌───────────────┐    ┌──────────────┐
│CLI│───▶│   HTTP API    ├───▶│IPFS Core Impl│
└───┘    └───────────────┘    └──────────────┘
  △              △                    △
  └──────────────└──────────┬─────────┘
                            │
                         ┌─────┐
                         │Tests│
                         └─────┘
```

# IPFS Core Implementation Architecture

IPFS Core is divided into separate subsystems, each of them exist in their own repo/module. The dependencies between each subsystem is assured by injection at the IPFS Core level. IPFS Core exposes an API, defined by the IPFS API spec. libp2p is the networking layer used by IPFS, but out of scope in IPFS core, follow that project [here](https://github.com/diasdavid/js-libp2p)


```
             ▶  ┌───────────────────────────────────────────────────────────────────────────────┐
                │                                   IPFS Core                                   │
             │  └───────────────────────────────────────────────────────────────────────────────┘
                                                        │                                        
             │                                          │                                        
                                                        │                                        
             │            ┌──────────────┬──────────────┼────────────┬─────────────────┐         
                          │              │              │            │                 │         
             │            │              │              │            │                 │         
                          ▼              │              ▼            │                 ▼         
             │  ┌──────────────────┐     │    ┌──────────────────┐   │       ┌──────────────────┐
                │                  │     │    │                  │   │       │                  │
             │  │  Block Service   │     │    │   DAG Service    │   │       │    IPFS Repo     │
                │                  │     │    │                  │   │       │                  │
             │  └──────────────────┘     │    └──────────────────┘   │       └──────────────────┘
                          │              │              │            │                           
  IPFS Core  │            ▼              │         ┌────┴────┐       │                           
                     ┌────────┐          │         ▼         ▼       │                           
             │       │ Block  │          │    ┌────────┐┌────────┐   │                           
                     └────────┘          │    │DAG Node││DAG Link│   │                           
             │                           │    └────────┘└────────┘   │                           
                ┌──────────────────┐     │                           │       ┌──────────────────┐
             │  │                  │     │                           │       │                  │
                │    Bitswap       │◀────┤                           ├──────▶│    Importer      │
             │  │                  │     │                           │       │                  │
                └──────────────────┘     │                           │       └──────────────────┘
             │                           │                           │                 │         
                                         │                           │            ┌────┴────┐    
             │                           │                           │            ▼         ▼    
                                         │                           │       ┌────────┐┌────────┐
             │  ┌──────────────────┐     │                           │       │ layout ││chunker │
                │                  │     │              ┌────────────┘       └────────┘└────────┘
             │  │    Files         │◀────┘              │                                        
                │                  │                    │                                        
             │  └──────────────────┘                    │                                        
             ▶                                          │                                        
                                                        ▼                                        
                ┌───────────────────────────────────────────────────────────────────────────────┐
                │                                                                               │
                │                                                                               │
                │                                                                               │
                │                                 libp2p                                        │
                │                                                                               │
                │                                                                               │
                └───────────────────────────────────────────────────────────────────────────────┘
```

#### IPFS Core

IPFS Core is the entry point module for IPFS. It exposes an interface defined on [IPFS Specs.](https://github.com/ipfs/specs/blob/ipfs/api/api/core/README.md)

#### Block Service

Block Service uses IPFS Repo (local storage) and Bitswap (network storage) to store and fetch blocks. A block is a serialized MerkleDAG node.

#### DAG Service

DAG Service offers some graph language semantics on top of the MerkleDAG, composed by DAG Nodes (which can have DAG Links). It uses the Block Service as its storage and discovery service.

#### IPFS Repo

IPFS Repo is storage driver of IPFS, follows the [IPFS Repo Spec](https://github.com/ipfs/specs/tree/master/repo) and supports the storage of different types of files.

#### Bitswap

Bitswap is the exchange protocol used by IPFS to 'trade' blocks with other IPFS nodes.

#### Files

Files is the API that lets us work with IPFS objects (DAG Nodes) as if they were Unix Files.

#### Importer

Importer are a set of layouts (e.g. UnixFS) and chunkers (e.g: fixed-size, rabin, etc) that convert data to a MerkleDAG representation inside IPFS.

# Usage

> This is a WIP, behare of the Dragons!

# Project Status

### Per component view

| Name | Spec | Disc |
| :----| :----| :----|
| data importing | https://github.com/ipfs/specs/pull/57 | https://github.com/ipfs/js-ipfs/issues/41
| repo | https://github.com/ipfs/specs/tree/master/repo | https://github.com/ipfs/js-ipfs/issues/51
| network layer | https://github.com/ipfs/specs/tree/master/libp2p | https://github.com/diasdavid/js-libp2p/issues
| bitswap | https://github.com/ipfs/js-ipfs/issues/51 | https://github.com/ipfs/js-ipfs/issues/51
| pin | | https://github.com/ipfs/js-ipfs/issues/59
| files | | https://github.com/ipfs/js-ipfs/issues/60
| daemon | | https://github.com/ipfs/js-ipfs/issues/57
| object | | https://github.com/ipfs/js-ipfs/issues/58
| block | |  https://github.com/ipfs/js-ipfs/issues/50
| bootstrap | | https://github.com/ipfs/js-ipfs/issues/46
| init | | https://github.com/ipfs/js-ipfs/issues/42

### Per feature view

- **core**
  - [x] version
  - [x] daemon
  - [x] id
  - [x] block
    - [x] get
    - [x] put
    - [x] stat
  - [x] object - Basic manipulation of the DAG
    - [x] data
    - [x] get
    - [x] links
    - [x] new
    - [x] patch
    - [x] put
    - [x] stat
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
    - [x] add
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
  - [x] commands
  - [ ] update
  - [ ] init - sugar on top of ipfs repo init
  - [x] config
    - [x] edit
    - [x] replace
    - [x] show
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
    - [ ] connect
    - [ ] disconnect
    - [ ] filters
    - [ ] peers
  - [ ] records (IPRS)
    - [ ] put
    - [ ] get
