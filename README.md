<p align="center">
  <a href="https://js.ipfs.io" title="JS IPFS">
    <img src="https://ipfs.io/ipfs/Qme6KJdKcp85TYbLxuLV7oQzMiLremD7HMoXLZEmgo6Rnh/js-ipfs-sticker.png" alt="IPFS in JavaScript logo" width="244" />
  </a>
</p>

<h3 align="center">The JavaScript implementation of the IPFS protocol.</h3>

<p align="center">
  <a href="http://protocol.ai"><img src="https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat" /></a>
  <a href="http://ipfs.io/"><img src="https://img.shields.io/badge/project-IPFS-blue.svg?style=flat" /></a>
</p>

<p align="center">
  <a href="https://riot.im/app/#/room/#ipfs-dev:matrix.org"><img src="https://img.shields.io/badge/matrix-%23ipfs%3Amatrix.org-blue.svg?style=flat" /> </a>
  <a href="http://webchat.freenode.net/?channels=%23ipfs"><img src="https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat" /></a>
  <a href="https://discord.gg/24fmuwR"><img src="https://img.shields.io/discord/475789330380488707?color=blueviolet&label=discord&style=flat" /></a>
  <a href="https://github.com/ipfs/team-mgmt/blob/master/MGMT_JS_CORE_DEV.md"><img src="https://img.shields.io/badge/team-mgmt-blue.svg?style=flat" /></a>
</p>

<p align="center">
  <a href="https://github.com/ipfs/interface-ipfs-core"><img src="https://img.shields.io/badge/interface--ipfs--core-API%20Docs-blue.svg"></a>
  <a href="https://travis-ci.com/ipfs/js-ipfs?branch=master"><img src="https://badgen.net/travis/ipfs/js-ipfs?branch=master" /></a>
  <a href="https://codecov.io/gh/ipfs/js-ipfs"><img src="https://badgen.net/codecov/c/github/ipfs/js-ipfs" /></a>
  <br>
</p>

> **Upgrading from <=0.40 to 0.41?** See the [release notes](https://github.com/ipfs/js-ipfs/issues/2656) for the list of API changes and the [migration guide](https://gist.github.com/alanshaw/04b2ddc35a6fff25c040c011ac6acf26).

### Project status - `Alpha` <!-- omit in toc -->

We've come a long way, but this project is still in Alpha, lots of development is happening, API might change, beware of the Dragons 🐉.

**Want to get started?** Check our [examples folder](/packages/ipfs/examples) to learn how to spawn an IPFS node in Node.js and in the Browser.

🚨 **Please read this** 🚨 The [DHT](https://en.wikipedia.org/wiki/Distributed_hash_table), a fundamental piece for automatic content and peer discovery is not yet complete. There are multiple applications that can be built without this service but nevertheless it is fundamental to getting that magic IPFS experience. The current status is that implementation is done and merged and we're working on performance issues. Expect the DHT to be available in a release very soon.

[**`Weekly Core Implementations Call`**](https://github.com/ipfs/team-mgmt/issues/992)

## Tech Lead <!-- omit in toc -->

[David Dias](https://github.com/daviddias)

## Lead Maintainer <!-- omit in toc -->

[Alan Shaw](https://github.com/alanshaw)

## Table of Contents <!-- omit in toc -->

- [Structure](#structure)
- [Development](#development)
  - [Clone and install dependencies](#clone-and-install-dependencies)
  - [Run tests](#run-tests)
  - [Lint](#lint)
  - [Build a dist version](#build-a-dist-version)
  - [Publishing new versions](#publishing-new-versions)
  - [Using prerelease versions](#using-prerelease-versions)
- [Contribute](#contribute)
  - [Want to hack on IPFS?](#want-to-hack-on-ipfs)
- [License](#license)

## Structure

This project is broken into several modules, their purposes are:

* [`/packages/ipfs`](./packages/ipfs) The core implementation
* [`/packages/ipfs-http-client`](./packages/ipfs-http-client) A client for the RPC-over-HTTP API presented by both js-ipfs and go-ipfs
* [`/packages/interface-ipfs-core`](./packages/interface-ipfs-core) Tests to ensure adherance of an implementation to the spec

## Development

### Clone and install dependencies

```sh
> git clone https://github.com/ipfs/js-ipfs.git
> cd js-ipfs
> npm install
```

This will install [lerna](https://www.npmjs.com/package/lerna) and bootstrap the various packages, dedpuing and hoisting dependencies into the root folder.

If later you wish to remove all the `node_modules`/`dist` folders and start again, run `npm run reset && npm install` from the root.

See the scripts section of the root [`package.json`](./package.json) for more commands.

### Run tests

```sh
# run all the unit tests
> npm test

# run just IPFS tests in Node.js
> npm run test:node

# run just IPFS tests in a browser
> npm run test:browser

# run just IPFS tests in a webworker
> npm run test:webworker
```

More granular test suites can be run from each submodule.

Please see the `package.json` in each submodule for available commands.

### Lint

Please run the linter before submitting a PR, the build will not pass if it fails:

```sh
> npm run lint
```

### Build a dist version

```sh
> npm run build
```

### Publishing new versions

1. Ensure you have a `GH_TOKEN` env var containing a GitHub [Personal Access Token](https://github.com/settings/tokens) with `public_repo` permissions
2. From the root of this repo run `npm run release` and follow the on screen prompts.  It will use [conventional commits](https://www.conventionalcommits.org) to work out the new package version

### Using prerelease versions

Any changed packages from each successful build of master are published to npm as canary builds under the npm tag `next`.

## Contribute

IPFS implementation in JavaScript is a work in progress. As such, there's a few things you can do right now to help out:

- Go through the modules below and **check out existing issues**. This would be especially useful for modules in active development. Some knowledge of IPFS may be required, as well as the infrastructure behind it - for instance, you may need to read up on p2p and more complex operations like muxing to be able to help technically.
- **Perform code reviews**. More eyes will help (a) speed the project along, (b) ensure quality, and (c) reduce possible future bugs.
- Take a look at go-ipfs and some of the planning repositories or issues: for instance, the [libp2p spec](https://github.com/ipfs/specs/pull/19). Contributions here that would be most helpful are **top-level comments** about how it should look based on our understanding. Again, the more eyes the better.
- **Add tests**. There can never be enough tests.

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

Check out [ipfs/community/CONTRIBUTING_JS.md](https://github.com/ipfs/community/blob/master/CONTRIBUTING_JS.md) for details on coding standards, commit messages and other project conventions

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fipfs%2Fjs-ipfs?ref=badge_large)
