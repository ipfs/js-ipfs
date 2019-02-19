# interface-ipfs-core

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A test suite and interface you can use to implement an IPFS core interface.

## Lead Maintainer

[Alan Shaw](http://github.com/alanshaw).

## Table of Contents

- [Background](#background)
  - [Modules that implement the interface](#modules-that-implement-the-interface)
  - [Badge](#badge)
- [Install](#install)
- [Usage](#usage)
  - [JavaScript](#javascript)
  - [Go](#go)
- [API](#api)
- [Contribute](#contribute)
  - [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [License](#license)

## Background

The primary goal of this module is to define and ensure that both IPFS core implementations and their respective HTTP client libraries offer the same interface, so that developers can quickly change between a local and a remote node without having to change their applications. In addition to the definition of the expected interface, this module offers a suite of tests that can be run in order to check if the interface is used as described.

The API is presented with both Node.js and Go primitives. However, there are no actual limitations keeping it from being extended for any other language, pushing forward cross compatibility and interoperability through different stacks.

### Modules that implement the interface

- [JavaScript IPFS implementation](https://github.com/ipfs/js-ipfs)
- [JavaScript IPFS HTTP Client Library](https://github.com/ipfs/js-ipfs-api)
- Soon™, go-ipfs, go-ipfs-api, java-ipfs-api, python-ipfs-api and others will implement it as well.

Send in a PR if you find or write one!

### Badge

Include this badge in your readme if you make a new module that implements interface-ipfs-core API.

![](/img/badge.svg)

```md
[![IPFS Core API Compatible](https://cdn.rawgit.com/ipfs/interface-ipfs-core/master/img/badge.svg)](https://github.com/ipfs/interface-ipfs-core)
```

## Install

In JavaScript land:

```js
npm install interface-ipfs-core
```

In Go land:

If you want to run these tests against a go-ipfs daemon, checkout [ipfs-http-client](https://github.com/ipfs/js-ipfs-http-client) and run test tests:

```
git clone https://github.com/ipfs/js-ipfs-http-client
npm install
npm test
```

## Usage

### JavaScript

Install `interface-ipfs-core` as one of the dependencies of your project and as a test file. Then, using `mocha` (for Node.js) or a test runner with compatible API, do:

```js
const tests = require('interface-ipfs-core')

// Create common setup and teardown
const createCommon = () => ({
  // Do some setup common to all tests
  setup (cb) {
    // Must call back with an "IPFS factory", an object with a `spawnNode` method
    cb(null, {
      // Use ipfsd-ctl or other to spawn an IPFS node for testing
      spawnNode (cb) { /* ... */ }
    })
  },
  // Dispose of nodes created by the IPFS factory and any other teardown
  teardown (cb) {
    cb()
  }
})

tests.block(createCommon)
tests.config(createCommon)
tests.dag(createCommon)
// ...etc. (see src/index.js)
```

#### Running tests by command

```js
tests.repo.version(createCommon)
```

#### Skipping tests

```js
tests.repo.gc(createCommon, { skip: true }) // pass an options object to skip these tests

// OR, at the subsystem level

// skips ALL the repo.gc tests
tests.repo(createCommon, { skip: ['gc'] })
// skips ALL the object.patch.addLink tests
tests.object(createCommon, { skip: ['patch.addLink'] })
```

##### Skipping specific tests

```js
tests.repo.gc(createCommon, { skip: ['should do a thing'] }) // named test(s) to skip

// OR, at the subsystem level

tests.repo(createCommon, { skip: ['should do a thing'] })
```

#### Running only some tests

```js
tests.repo.gc(createCommon, { only: true }) // pass an options object to run only these tests

// OR, at the subsystem level

// runs only ALL the repo.gc tests
tests.repo(createCommon, { only: ['gc'] })
// runs only ALL the object.patch.addLink tests
tests.object(createCommon, { only: ['patch.addLink'] })
```

##### Running only specific tests

```js
tests.repo.gc(createCommon, { only: ['should do a thing'] }) // only run these named test(s)

// OR, at the subsystem level

tests.repo(createCommon, { only: ['should do a thing'] })
```

### Go

> [WIP](https://github.com/ipfs/interface-ipfs-core/issues/66)

## API

In order to be considered "valid", an IPFS core implementation  must expose the API described in [/SPEC](/SPEC). You can also use this loose spec as documentation for consuming the core APIs. Here is an outline of the contents of that directory:

- **Files**
  - [files](/SPEC/FILES.md)
  - [block](/SPEC/BLOCK.md)
  - [repo (not spec'ed yet)](/SPEC/REPO)
- **Graph**
  - [dag](/SPEC/DAG.md)
  - [object](/SPEC/OBJECT.md)
  - [pin](/SPEC/PIN.md)
- **Network**
  - [bootstrap](/SPEC/BOOSTRAP.md)
  - [bitswap (not spec'ed yet)](/SPEC/BITSWAP.md)
  - [dht (not spec'ed yet)](/SPEC/DHT.md)
  - [pubsub](/SPEC/PUBSUB.md)
  - [swarm](/SPEC/SWARM.md)
- **Node Management**
  - [Miscellaneous](/SPEC/MISCELLANEOUS.md)
  - [config](/SPEC/CONFIG.md)
  - [stats](/SPEC/STATS.md)
  - [repo](/SPEC/REPO.md)
- [**Types**](/SPEC/TYPES.md)
- [**Util**](/SPEC/UTIL.md)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/interface-ipfs-core/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

Copyright (c) Protocol Labs, Inc. under the **MIT License**. See [LICENSE.md](./LICENSE.md) for details.

[UnixFS]: https://github.com/ipfs/specs/tree/master/unixfs
