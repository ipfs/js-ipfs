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
  <br>
</p>

> **Upgrading from <=0.40 to 0.48?** See the [release notes](https://github.com/ipfs/js-ipfs/issues/2656) for the list of API changes and the [migration guide](https://github.com/ipfs/js-ipfs/tree/master/docs/MIGRATION-TO-ASYNC-AWAIT.md).

We've come a long way, but this project is still in Alpha, lots of development is happening, APIs might change, beware of 🐉..

## Getting started

* Look into the [examples](/examples) to learn how to spawn an IPFS node in Node.js and in the Browser
* Read the [Core API docs](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api) to see what you can do with an IPFS node
* Visit https://dweb-primer.ipfs.io to learn about IPFS and the concepts that underpin it
* Head over to https://proto.school to take interactive tutorials that cover core IPFS APIs
* Check out https://docs.ipfs.io for tips, how-tos and more

## Lead Maintainer <!-- omit in toc -->

[Alex Potsides](http://github.com/achingbrain)

## Table of Contents <!-- omit in toc -->

- [Getting started](#getting-started)
- [Documentation](#documentation)
- [Structure](#structure)
- [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [License](#license)

## Documentation

* [Config](./docs/CONFIG.md)
* [Core API](./docs/core-api)
* [Examples](./examples)
* [Development](./docs/DEVELOPMENT.md)

## Structure

This project is broken into several modules, their purposes are:

* [`/packages/ipfs`](./packages/ipfs) The core implementation
* [`/packages/ipfs-http-client`](./packages/ipfs-http-client) A client for the RPC-over-HTTP API presented by both js-ipfs and go-ipfs
* [`/packages/interface-ipfs-core`](./packages/interface-ipfs-core) Tests to ensure adherence of an implementation to the spec
* [`/packages/ipfs-core-utils`](./packages/ipfs-core-utils) Helpers and utilities common to core and the HTTP RPC API client

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


## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_large)
