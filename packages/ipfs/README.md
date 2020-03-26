<p align="center">
  <a href="https://js.ipfs.io" title="JS IPFS">
    <img src="https://ipfs.io/ipfs/Qme6KJdKcp85TYbLxuLV7oQzMiLremD7HMoXLZEmgo6Rnh/js-ipfs-sticker.png" alt="IPFS in JavaScript logo" width="244" />
  </a>
</p>

<h3 align="center">The JavaScript implementation of the IPFS protocol</h3>

<p align="center">
  <a href="https://riot.im/app/#/room/#ipfs-dev:matrix.org"><img src="https://img.shields.io/badge/matrix-%23ipfs%3Amatrix.org-blue.svg?style=flat" /> </a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat" /></a>
  <a href="https://discord.gg/24fmuwR"><img src="https://img.shields.io/discord/475789330380488707?color=blueviolet&label=discord&style=flat" /></a>
  <a href="https://github.com/ipfs/team-mgmt/blob/master/MGMT_JS_CORE_DEV.md"><img src="https://img.shields.io/badge/team-mgmt-blue.svg?style=flat" /></a>
</p>

<p align="center">
  <a href="https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core"><img src="https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg"></a>
  <a href="https://travis-ci.com/ipfs/js-ipfs?branch=master"><img src="https://badgen.net/travis/ipfs/js-ipfs?branch=master" /></a>
  <a href="https://codecov.io/gh/ipfs/js-ipfs"><img src="https://badgen.net/codecov/c/github/ipfs/js-ipfs" /></a>
  <a href="https://bundlephobia.com/result?p=ipfs"><img src="https://badgen.net/bundlephobia/minzip/ipfs"></a>
  <a href="https://david-dm.org/ipfs/js-ipfs?path=packages/ipfs"><img src="https://david-dm.org/ipfs/js-ipfs.svg?style=flat&path=packages/ipfs" /></a>
  <a href="https://github.com/feross/standard"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat"></a>
  <a href=""><img src="https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat" /></a>
  <a href=""><img src="https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat" /></a>
  <a href="https://www.npmjs.com/package/ipfs"><img src="https://img.shields.io/npm/dm/ipfs.svg" /></a>
  <a href="https://www.jsdelivr.com/package/npm/ipfs"><img src="https://data.jsdelivr.com/v1/package/npm/ipfs/badge"/></a>
  <br>
</p>

> **Upgrading from <=0.40 to 0.41?** See the [release notes](https://github.com/ipfs/js-ipfs/issues/2656) for the list of API changes and the [migration guide](https://gist.github.com/alanshaw/04b2ddc35a6fff25c040c011ac6acf26).

We've come a long way, but this project is still in Alpha, lots of development is happening, APIs might change, beware of 🐉..

## Getting started

* Look into the [examples folder](https://github.com/ipfs/js-ipfs/tree/master/examples) to learn how to spawn an IPFS node in Node.js and in the Browser
* Read the [Core API docs](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) to see what you can do with an IPFS node
* Visit https://dweb-primer.ipfs.io to learn about IPFS and the concepts that underpin it
* Head over to https://proto.school to take interactive tutorials that cover core IPFS APIs
* Check out https://docs-beta.ipfs.io for tips, how-tos and more

## Tech Lead <!-- omit in toc -->

[David Dias](https://github.com/daviddias)

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](http://github.com/achingbrain)

## Table of Contents <!-- omit in toc -->

- [Getting started](#getting-started)
- [Install](#install)
  - [Browser CDN](#browser-cdn)
  - [Browser bundle](#browser-bundle)
- [Documentation](#documentation)
  - [Core API](#core-api)
  - [How to run IPFS in various environments](#how-to-run-ipfs-in-various-environments)
  - [How to use IPFS in your application](#how-to-use-ipfs-in-your-application)
  - [Different topics in detail](#different-topics-in-detail)
  - [Questions?](#questions)
  - [Need help?](#need-help)
- [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [Packages](#packages)
- [License](#license)

## Install

```console
$ npm install ipfs
```

If you are planning on using js-ipfs on the command line, install it globally:

```console
$ npm install -g ipfs
```

### Browser CDN

You can load IPFS right in your browser by adding the following to your page using the super fast [jsdelivr](https://www.jsdelivr.com) CDN:

```html
<!-- loading the minified version using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.min.js"></script>

<!-- loading the human-readable (not minified) version jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/ipfs/dist/index.js"></script>
```

Inserting one of the above lines will make an `Ipfs` object available in the global namespace:

```html
<script>
async function main () {
  const node = await window.Ipfs.create()
  // Ready to use!
  // See https://github.com/ipfs/js-ipfs#core-api
}
main()
</script>
```

### Browser bundle

Learn how to bundle IPFS into your application with webpack, parceljs and browserify in the [examples](https://github.com/ipfs/js-ipfs/tree/master/examples) folder.

## Documentation

### Core API

* [API Docs](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api)

### How to run IPFS in various environments

* [docs/CLI.md](./docs/CLI.md)
* [docs/DAEMON.md](./docs/DAEMON.md)
* [docs/DOCKER.md](./docs/DOCKER.md)

### How to use IPFS in your application

* [docs/MODULE.md](./docs/MODULE.md)

### Different topics in detail

* [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
* [docs/MONITORING.md](./docs/MONITORING.md)
* [docs/DELEGATE_ROUTERS.md](./docs/DELEGATE_ROUTERS.md)
* [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

### Questions?

* [docs/FAQ.md](./docs/FAQ.md)

### Need help?

Please ask 'How do I?' questions on https://discuss.ipfs.io

## Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

The IPFS implementation in JavaScript needs your help!  There are a few things you can do right now to help out:

Read the [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md) and [JavaScript Contributing Guidelines](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md).

- **Check out existing issues** The [issue list](https://github.com/ipfs/js-ipfs/issues) has many that are marked as ['help wanted'](https://github.com/ipfs/js-ipfs/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22) or ['difficulty:easy'](https://github.com/ipfs/js-ipfs/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3Adifficulty%3Aeasy) which make great starting points for development, many of which can be tackled with no prior IPFS knowledge
- **Look at the [IPFS Roadmap](https://github.com/ipfs/roadmap)** This are the high priority items being worked on right now
- **Perform code reviews** More eyes will help
  a. speed the project along
  b. ensure quality, and
  c. reduce possible future bugs.
- **Add tests**. There can never be enough tests.
- **Join the [Weekly Core Implementations Call](https://github.com/ipfs/team-mgmt/issues/992)** it's where everyone discusses what's going on with IPFS and what's next

## Packages

List of the main packages that make up the IPFS ecosystem.

| Package | Version | Deps | CI/Travis | Coverage | Lead Maintainer |
| ---------|---------|---------|---------|---------|--------- |
| **Files** |
| [`ipfs-unixfs-exporter`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-exporter.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-unixfs/master)](https://travis-ci.com/ipfs/js-ipfs-unixfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-unixfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-unixfs-importer`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs-importer.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-unixfs/master)](https://travis-ci.com/ipfs/js-ipfs-unixfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-unixfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| [`ipfs-unixfs`](//github.com/ipfs/js-ipfs-unixfs) | [![npm](https://img.shields.io/npm/v/ipfs-unixfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-unixfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-unixfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-unixfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-unixfs/master)](https://travis-ci.com/ipfs/js-ipfs-unixfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-unixfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-unixfs) | [Alex Potsides](mailto:alex.potsides@protocol.ai) |
| **Repo** |
| [`ipfs-repo`](//github.com/ipfs/js-ipfs-repo) | [![npm](https://img.shields.io/npm/v/ipfs-repo.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-repo/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-repo.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-repo/master)](https://travis-ci.com/ipfs/js-ipfs-repo) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-repo/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-repo) | [Alex Potsides](mailto:alex@achingbrain.net) |
| **Exchange** |
| [`ipfs-block-service`](//github.com/ipfs/js-ipfs-block-service) | [![npm](https://img.shields.io/npm/v/ipfs-block-service.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block-service/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-block-service.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block-service) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-block-service/master)](https://travis-ci.com/ipfs/js-ipfs-block-service) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-block-service/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-block-service) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipfs-block`](//github.com/ipfs/js-ipfs-block) | [![npm](https://img.shields.io/npm/v/ipfs-block.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-block/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-block.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-block) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-block/master)](https://travis-ci.com/ipfs/js-ipfs-block) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-block/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-block) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipfs-bitswap`](//github.com/ipfs/js-ipfs-bitswap) | [![npm](https://img.shields.io/npm/v/ipfs-bitswap.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-bitswap/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-bitswap.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-bitswap) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-bitswap/master)](https://travis-ci.com/ipfs/js-ipfs-bitswap) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-bitswap/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-bitswap) | [Dirk McCormick](mailto:dirk@protocol.ai) |
| **IPNS** |
| [`ipfs-name`](//github.com/ipfs/js-ipfs-name) | [![npm](https://img.shields.io/npm/v/ipfs-name.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-name/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-name.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-name) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-name/master)](https://travis-ci.com/ipfs/js-ipfs-name) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-name/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-name) | N/A |
| **Generics/Utils** |
| [`ipfs-utils`](//github.com/ipfs/js-ipfs) | [![npm](https://img.shields.io/npm/v/ipfs-utils.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs/master)](https://travis-ci.com/ipfs/js-ipfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs) | [Hugo Dias](mailto:hugomrdias@gmail.com) |
| [`ipfs-http-client`](//github.com/ipfs/js-ipfs) | [![npm](https://img.shields.io/npm/v/ipfs-http-client.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs/master)](https://travis-ci.com/ipfs/js-ipfs) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs) | [Alan Shaw](mailto:alan@tableflip.io) |
| [`ipfs-http-response`](//github.com/ipfs/js-ipfs-http-response) | [![npm](https://img.shields.io/npm/v/ipfs-http-response.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-http-response/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-http-response.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-http-response) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-http-response/master)](https://travis-ci.com/ipfs/js-ipfs-http-response) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-http-response/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-http-response) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`ipfsd-ctl`](//github.com/ipfs/js-ipfsd-ctl) | [![npm](https://img.shields.io/npm/v/ipfsd-ctl.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfsd-ctl/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfsd-ctl.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfsd-ctl) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfsd-ctl/master)](https://travis-ci.com/ipfs/js-ipfsd-ctl) | [![codecov](https://codecov.io/gh/ipfs/js-ipfsd-ctl/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfsd-ctl) | [Hugo Dias](mailto:mail@hugodias.me) |
| [`is-ipfs`](//github.com/ipfs/is-ipfs) | [![npm](https://img.shields.io/npm/v/is-ipfs.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/is-ipfs/releases) | [![Deps](https://david-dm.org/ipfs/is-ipfs.svg?style=flat-square)](https://david-dm.org/ipfs/is-ipfs) | [![Travis CI](https://flat.badgen.net/travis/ipfs/is-ipfs/master)](https://travis-ci.com/ipfs/is-ipfs) | [![codecov](https://codecov.io/gh/ipfs/is-ipfs/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/is-ipfs) | [Marcin Rataj](mailto:lidel@lidel.org) |
| [`aegir`](//github.com/ipfs/aegir) | [![npm](https://img.shields.io/npm/v/aegir.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/aegir/releases) | [![Deps](https://david-dm.org/ipfs/aegir.svg?style=flat-square)](https://david-dm.org/ipfs/aegir) | [![Travis CI](https://flat.badgen.net/travis/ipfs/aegir/master)](https://travis-ci.com/ipfs/aegir) | [![codecov](https://codecov.io/gh/ipfs/aegir/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/aegir) | [Hugo Dias](mailto:hugomrdias@gmail.com) |
| [`ipfs-repo-migrations`](//github.com/ipfs/js-ipfs-repo-migrations) | [![npm](https://img.shields.io/npm/v/ipfs-repo-migrations.svg?maxAge=86400&style=flat-square)](//github.com/ipfs/js-ipfs-repo-migrations/releases) | [![Deps](https://david-dm.org/ipfs/js-ipfs-repo-migrations.svg?style=flat-square)](https://david-dm.org/ipfs/js-ipfs-repo-migrations) | [![Travis CI](https://flat.badgen.net/travis/ipfs/js-ipfs-repo-migrations/master)](https://travis-ci.com/ipfs/js-ipfs-repo-migrations) | [![codecov](https://codecov.io/gh/ipfs/js-ipfs-repo-migrations/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipfs/js-ipfs-repo-migrations) | N/A |
| **libp2p** |
| [`libp2p`](//github.com/libp2p/js-libp2p) | [![npm](https://img.shields.io/npm/v/libp2p.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p/master)](https://travis-ci.com/libp2p/js-libp2p) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`peer-id`](//github.com/libp2p/js-peer-id) | [![npm](https://img.shields.io/npm/v/peer-id.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-id/releases) | [![Deps](https://david-dm.org/libp2p/js-peer-id.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-peer-id/master)](https://travis-ci.com/libp2p/js-peer-id) | [![codecov](https://codecov.io/gh/libp2p/js-peer-id/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-peer-id) | [Vasco Santos](mailto:santos.vasco10@gmail.com) |
| [`peer-info`](//github.com/libp2p/js-peer-info) | [![npm](https://img.shields.io/npm/v/peer-info.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-peer-info/releases) | [![Deps](https://david-dm.org/libp2p/js-peer-info.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-info) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-peer-info/master)](https://travis-ci.com/libp2p/js-peer-info) | [![codecov](https://codecov.io/gh/libp2p/js-peer-info/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-peer-info) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-crypto`](//github.com/libp2p/js-libp2p-crypto) | [![npm](https://img.shields.io/npm/v/libp2p-crypto.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-crypto/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-crypto.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-crypto) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-crypto/master)](https://travis-ci.com/libp2p/js-libp2p-crypto) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-crypto/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-crypto) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-keychain`](//github.com/libp2p/js-libp2p-keychain) | [![npm](https://img.shields.io/npm/v/libp2p-keychain.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-keychain/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-keychain.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-keychain) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-keychain/master)](https://travis-ci.com/libp2p/js-libp2p-keychain) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-keychain/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-keychain) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-circuit`](//github.com/libp2p/js-libp2p-circuit) | [![npm](https://img.shields.io/npm/v/libp2p-circuit.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-circuit/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-circuit.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-circuit) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-circuit/master)](https://travis-ci.com/libp2p/js-libp2p-circuit) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-circuit/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-circuit) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-floodsub`](//github.com/libp2p/js-libp2p-floodsub) | [![npm](https://img.shields.io/npm/v/libp2p-floodsub.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-floodsub/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-floodsub.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-floodsub) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-floodsub/master)](https://travis-ci.com/libp2p/js-libp2p-floodsub) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-floodsub/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-floodsub) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-gossipsub`](//github.com/ChainSafe/gossipsub-js) | [![npm](https://img.shields.io/npm/v/libp2p-gossipsub.svg?maxAge=86400&style=flat-square)](//github.com/ChainSafe/gossipsub-js/releases) | [![Deps](https://david-dm.org/ChainSafe/gossipsub-js.svg?style=flat-square)](https://david-dm.org/ChainSafe/gossipsub-js) | [![Travis CI](https://flat.badgen.net/travis/ChainSafe/gossipsub-js/master)](https://travis-ci.com/ChainSafe/gossipsub-js) | [![codecov](https://codecov.io/gh/ChainSafe/gossipsub-js/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ChainSafe/gossipsub-js) | [Cayman Nava](mailto:caymannava@gmail.com) |
| [`libp2p-kad-dht`](//github.com/libp2p/js-libp2p-kad-dht) | [![npm](https://img.shields.io/npm/v/libp2p-kad-dht.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-kad-dht/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-kad-dht.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-kad-dht) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-kad-dht/master)](https://travis-ci.com/libp2p/js-libp2p-kad-dht) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-kad-dht/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-kad-dht) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-mdns`](//github.com/libp2p/js-libp2p-mdns) | [![npm](https://img.shields.io/npm/v/libp2p-mdns.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-mdns/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-mdns.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-mdns) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-mdns/master)](https://travis-ci.com/libp2p/js-libp2p-mdns) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-mdns/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-mdns) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-bootstrap`](//github.com/libp2p/js-libp2p-bootstrap) | [![npm](https://img.shields.io/npm/v/libp2p-bootstrap.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-bootstrap/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-bootstrap.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-bootstrap) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-bootstrap/master)](https://travis-ci.com/libp2p/js-libp2p-bootstrap) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-bootstrap/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-bootstrap) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-secio`](//github.com/libp2p/js-libp2p-secio) | [![npm](https://img.shields.io/npm/v/libp2p-secio.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-secio/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-secio.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-secio) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-secio/master)](https://travis-ci.com/libp2p/js-libp2p-secio) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-secio/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-secio) | [Friedel Ziegelmayer](mailto:dignifiedquire@gmail.com) |
| [`libp2p-tcp`](//github.com/libp2p/js-libp2p-tcp) | [![npm](https://img.shields.io/npm/v/libp2p-tcp.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-tcp/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-tcp.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-tcp) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-tcp/master)](https://travis-ci.com/libp2p/js-libp2p-tcp) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-tcp/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-tcp) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-webrtc-star`](//github.com/libp2p/js-libp2p-webrtc-star) | [![npm](https://img.shields.io/npm/v/libp2p-webrtc-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-webrtc-star/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-webrtc-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-webrtc-star) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-webrtc-star/master)](https://travis-ci.com/libp2p/js-libp2p-webrtc-star) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-webrtc-star) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`libp2p-websocket-star`](//github.com/libp2p/js-libp2p-websocket-star) | [![npm](https://img.shields.io/npm/v/libp2p-websocket-star.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websocket-star/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-websocket-star.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websocket-star) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-websocket-star/master)](https://travis-ci.com/libp2p/js-libp2p-websocket-star) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-websocket-star/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-websocket-star) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`libp2p-websockets`](//github.com/libp2p/js-libp2p-websockets) | [![npm](https://img.shields.io/npm/v/libp2p-websockets.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/js-libp2p-websockets/releases) | [![Deps](https://david-dm.org/libp2p/js-libp2p-websockets.svg?style=flat-square)](https://david-dm.org/libp2p/js-libp2p-websockets) | [![Travis CI](https://flat.badgen.net/travis/libp2p/js-libp2p-websockets/master)](https://travis-ci.com/libp2p/js-libp2p-websockets) | [![codecov](https://codecov.io/gh/libp2p/js-libp2p-websockets/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/js-libp2p-websockets) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`pull-mplex`](//github.com/libp2p/pull-mplex) | [![npm](https://img.shields.io/npm/v/pull-mplex.svg?maxAge=86400&style=flat-square)](//github.com/libp2p/pull-mplex/releases) | [![Deps](https://david-dm.org/libp2p/pull-mplex.svg?style=flat-square)](https://david-dm.org/libp2p/pull-mplex) | [![Travis CI](https://flat.badgen.net/travis/libp2p/pull-mplex/master)](https://travis-ci.com/libp2p/pull-mplex) | [![codecov](https://codecov.io/gh/libp2p/pull-mplex/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/libp2p/pull-mplex) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| **IPLD** |
| [`ipld`](//github.com/ipld/js-ipld) | [![npm](https://img.shields.io/npm/v/ipld.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld/releases) | [![Deps](https://david-dm.org/ipld/js-ipld.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld) | [![Travis CI](https://flat.badgen.net/travis/ipld/js-ipld/master)](https://travis-ci.com/ipld/js-ipld) | [![codecov](https://codecov.io/gh/ipld/js-ipld/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipld/js-ipld) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipld-dag-pb`](//github.com/ipld/js-ipld-dag-pb) | [![npm](https://img.shields.io/npm/v/ipld-dag-pb.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-pb/releases) | [![Deps](https://david-dm.org/ipld/js-ipld-dag-pb.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-pb) | [![Travis CI](https://flat.badgen.net/travis/ipld/js-ipld-dag-pb/master)](https://travis-ci.com/ipld/js-ipld-dag-pb) | [![codecov](https://codecov.io/gh/ipld/js-ipld-dag-pb/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipld/js-ipld-dag-pb) | [Volker Mische](mailto:volker.mische@gmail.com) |
| [`ipld-dag-cbor`](//github.com/ipld/js-ipld-dag-cbor) | [![npm](https://img.shields.io/npm/v/ipld-dag-cbor.svg?maxAge=86400&style=flat-square)](//github.com/ipld/js-ipld-dag-cbor/releases) | [![Deps](https://david-dm.org/ipld/js-ipld-dag-cbor.svg?style=flat-square)](https://david-dm.org/ipld/js-ipld-dag-cbor) | [![Travis CI](https://flat.badgen.net/travis/ipld/js-ipld-dag-cbor/master)](https://travis-ci.com/ipld/js-ipld-dag-cbor) | [![codecov](https://codecov.io/gh/ipld/js-ipld-dag-cbor/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/ipld/js-ipld-dag-cbor) | [Volker Mische](mailto:volker.mische@gmail.com) |
| **Multiformats** |
| [`multihashing`](//github.com/multiformats/js-multihashing) | [![npm](https://img.shields.io/npm/v/multihashing.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihashing/releases) | [![Deps](https://david-dm.org/multiformats/js-multihashing.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihashing) | [![Travis CI](https://flat.badgen.net/travis/multiformats/js-multihashing/master)](https://travis-ci.com/multiformats/js-multihashing) | [![codecov](https://codecov.io/gh/multiformats/js-multihashing/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multihashing) | [Hugo Dias](mailto:mail@hugodias.me) |
| [`mafmt`](//github.com/multiformats/js-mafmt) | [![npm](https://img.shields.io/npm/v/mafmt.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-mafmt/releases) | [![Deps](https://david-dm.org/multiformats/js-mafmt.svg?style=flat-square)](https://david-dm.org/multiformats/js-mafmt) | [![Travis CI](https://flat.badgen.net/travis/multiformats/js-mafmt/master)](https://travis-ci.com/multiformats/js-mafmt) | [![codecov](https://codecov.io/gh/multiformats/js-mafmt/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-mafmt) | [Vasco Santos](mailto:vasco.santos@moxy.studio) |
| [`multiaddr`](//github.com/multiformats/js-multiaddr) | [![npm](https://img.shields.io/npm/v/multiaddr.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multiaddr/releases) | [![Deps](https://david-dm.org/multiformats/js-multiaddr.svg?style=flat-square)](https://david-dm.org/multiformats/js-multiaddr) | [![Travis CI](https://flat.badgen.net/travis/multiformats/js-multiaddr/master)](https://travis-ci.com/multiformats/js-multiaddr) | [![codecov](https://codecov.io/gh/multiformats/js-multiaddr/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multiaddr) | [Jacob Heun](mailto:jacobheun@gmail.com) |
| [`multihashes`](//github.com/multiformats/js-multihash) | [![npm](https://img.shields.io/npm/v/multihashes.svg?maxAge=86400&style=flat-square)](//github.com/multiformats/js-multihash/releases) | [![Deps](https://david-dm.org/multiformats/js-multihash.svg?style=flat-square)](https://david-dm.org/multiformats/js-multihash) | [![Travis CI](https://flat.badgen.net/travis/multiformats/js-multihash/master)](https://travis-ci.com/multiformats/js-multihash) | [![codecov](https://codecov.io/gh/multiformats/js-multihash/branch/master/graph/badge.svg?style=flat-square)](https://codecov.io/gh/multiformats/js-multihash) | [David Dias](mailto:daviddias@ipfs.io) |

> This table is generated using the module [`package-table`](https://www.npmjs.com/package/package-table) with `package-table --data=package-list.json`.

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_large)

[![](https://github.com/ipfs/js-ipfs/raw/master/packages/interface-ipfs-core/img/badge.png)](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core)
