# interface-ipfs-core <!-- omit in toc -->

[![ipfs.io](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io)
[![IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Discord](https://img.shields.io/discord/806902334369824788?style=flat-square)](https://discord.gg/ipfs)
[![codecov](https://img.shields.io/codecov/c/github/ipfs/js-ipfs.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs)
[![CI](https://img.shields.io/github/workflow/status/ipfs/js-ipfs/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/ipfs/js-ipfs/actions/workflows/js-test-and-release.yml)

> A test suite and interface you can use to implement a IPFS core interface.

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Background](#background)
- [Core API](#core-api)
- [Modules that implement the interface](#modules-that-implement-the-interface)
- [Badge](#badge)
- [Usage](#usage)
- [Running tests](#running-tests)
  - [Running tests by command](#running-tests-by-command)
  - [Running only some tests](#running-only-some-tests)
  - [Running only specific tests](#running-only-specific-tests)
- [Skipping tests](#skipping-tests)
  - [Skipping specific tests](#skipping-specific-tests)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i interface-ipfs-core
```

## Background

The primary goal of this module is to define and ensure that IPFS core implementations and their respective HTTP client libraries offer the same interface, so that developers can quickly change between a local and a remote node without having to change their applications.

It offers a suite of tests that can be run in order to check if the interface is implemented as described.

## Core API

In order to be considered "valid", an IPFS implementation must expose the Core API as described in [/docs/core-api](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api). You can also use this loose spec as documentation for consuming the core APIs.

## Modules that implement the interface

- [JavaScript IPFS implementation](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs)
- [JavaScript IPFS HTTP Client Library](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client)
- [JavaScript IPFS postMessage proxy](https://github.com/ipfs-shipyard/ipfs-postmsg-proxy)

Send in a PR if you find or write one!

## Badge

Include this badge in your readme if you make a new module that implements interface-ipfs-core API.

![](img/badge.svg)

```md
[![IPFS Core API Compatible](https://cdn.rawgit.com/ipfs/interface-ipfs-core/master/img/badge.svg)](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core)
```

```console
$ npm install interface-ipfs-core
```

If you want to run these tests against a Kubo daemon, checkout [ipfs-http-client](https://github.com/ipfs/js-ipfs-http-client) and run test tests:

```console
$ git clone https://github.com/ipfs/js-ipfs-http-client
$ npm install
$ npm test
```

## Usage

Install `interface-ipfs-core` as one of the dependencies of your project and as a test file. Then, using `mocha` (for Node.js) or a test runner with compatible API, do:

```js
import * as tests from 'interface-ipfs-core'
const nodes = []

// Create common setup and teardown
const createCommon = () => ({
  // Do some setup common to all tests
  setup: async () => {
    // Use ipfsd-ctl or other to spawn an IPFS node for testing
    const node = await spawnNode()
    nodes.push(node)

    return node.api
  },
  // Dispose of nodes created by the IPFS factory and any other teardown
  teardown: () => {
    return Promise.all(nodes.map(n => n.stop()))
  }
})

tests.block(createCommon)
tests.config(createCommon)
tests.dag(createCommon)
// ...etc. (see src/index.js)
```

## Running tests

```js
// run all the tests for the repo subsystem
tests.repo(createCommon)
```

### Running tests by command

```js
tests.repo.version(createCommon)
```

### Running only some tests

```js
tests.repo.gc(createCommon, { only: true }) // pass an options object to run only these tests

// OR, at the subsystem level

// runs only ALL the repo.gc tests
tests.repo(createCommon, { only: ['gc'] })
// runs only ALL the object.patch.addLink tests
tests.object(createCommon, { only: ['patch.addLink'] })
```

### Running only specific tests

```js
tests.repo.gc(createCommon, { only: ['should do a thing'] }) // only run these named test(s)

// OR, at the subsystem level
tests.repo(createCommon, { only: ['should do a thing'] })
```

## Skipping tests

```js
tests.repo.gc(createCommon, { skip: true }) // pass an options object to skip these tests

// skips ALL the repo.gc tests
tests.repo(createCommon, { skip: ['gc'] })
// skips ALL the object.patch.addLink tests
tests.object(createCommon, { skip: ['patch.addLink'] })
```

### Skipping specific tests

```js
tests.repo.gc(createCommon, { skip: ['should do a thing'] }) // named test(s) to skip

// OR, at the subsystem level
tests.repo(createCommon, { skip: ['should do a thing'] })

// Optionally specify a reason
tests.repo(createCommon, {
  skip: [{
    name: 'should do a thing',
    reason: 'Thing is not implemented yet'
  }]
})
```

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Contributions welcome! Please check out [the issues](https://github.com/ipfs/js-ipfs/issues).

Also see our [contributing document](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for more information on how we work, and about contributing in general.

Please be aware that all interactions related to this repo are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

[UnixFS]: https://github.com/ipfs/specs/tree/master/unixfs
