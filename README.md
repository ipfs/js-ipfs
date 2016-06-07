
![](https://ipfs.io/ipfs/QmVk7srrwahXLNmcDYvyUEJptyoxpndnRa57YJ11L4jV26/ipfs.js.png)

IPFS JavaScript Implementation
==============================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/js-ipfs/badge.svg?branch=master)](https://coveralls.io/github/ipfs/js-ipfs?branch=master)
[![Travis CI](https://travis-ci.org/ipfs/js-ipfs.svg?branch=master)](https://travis-ci.org/ipfs/js-ipfs)
[![Circle CI](https://circleci.com/gh/ipfs/js-ipfs.svg?style=svg)](https://circleci.com/gh/ipfs/js-ipfs)
[![Dependency Status](https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> IPFS JavaScript implementation.

# Description

This repo contains the JavaScript implementation of the IPFS protocol, with feature parity to the [Go implementation](https://github.com/ipfs/go-ipfs).

# Project status

Consult the [Roadmap](/ROADMAP.md) for a complete state description of the project. A lot of components can be used currently, but it is a WIP, so beware of the Dragons.

# Contribute

IPFS implementation in JavaScript is a work in progress. As such, there's a few things you can do right now to help out:

  * Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS may be required, as well as the infrastructure behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
  * **Perform code reviews**. More eyes will help a) speed the project along b) ensure quality and c) reduce possible future bugs.
  * Take a look at go-ipfs and some of the planning repositories or issues: for instance, the libp2p spec [here](https://github.com/ipfs/specs/pull/19). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
  * **Add tests**. There can never be enough tests.
  * **Contribute to the [FAQ repository](https://github.com/ipfs/faq/issues)** with any questions you have about IPFS or any of the relevant technology. A good example would be asking, 'What is a merkledag tree?'. If you don't know a term, odds are, someone else doesn't either. Eventually, we should have a good understanding of where we need to improve communications and teaching together to make IPFS and IPN better.

# Installation

## npm

```bash
$ npm i ipfs --save
```

## Use in Node.js

```js
var IPFS = require('ipfs')

var node = new IPFS()
```

## Through command line tool

In order to use js-ipfs as a CLI, you must install it with the `global` flag.

```bash
$ npm install ipfs --global
```

The cli is available through `jsipfs` in your terminal

## Use in the browser with browserify, webpack or any bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```js
```

## Use in a browser using a script tag

```html
```

# Usage

## Examples

> **Will come soon**

## API

> **Will come soon**



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

## License

MIT.

# Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)
