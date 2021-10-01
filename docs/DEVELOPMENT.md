# Development <!-- omit in toc -->

> Getting started with development on IPFS

- [Install npm@7](#install-npm7)
- [Clone and install dependencies](#clone-and-install-dependencies)
- [Run tests](#run-tests)
- [Lint](#lint)
- [Build types and minified browser bundles](#build-types-and-minified-browser-bundles)
- [Publishing new versions](#publishing-new-versions)
- [Using prerelease versions](#using-prerelease-versions)
- [Testing strategy](#testing-strategy)
  - [CLI](#cli)
  - [HTTP API](#http-api)
  - [Core](#core)
  - [Non-Core](#non-core)

## Install npm@7

This project uses a [workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces) structure so requires npm@7 or above.  If you are running node 15 or later you already have it, if not run:

```sh
$ npm install -g npm@latest
```

## Clone and install dependencies

```sh
> git clone https://github.com/ipfs/js-ipfs.git
> cd js-ipfs
> npm install
```

This will install [lerna](https://www.npmjs.com/package/lerna) and bootstrap the various packages, deduping and hoisting dependencies into the root folder.

If later you add new dependencies to submodules or just wish to remove all the `node_modules`/`dist` folders and start again, run `npm run reset && npm install` from the root.

See the scripts section of the root [`package.json`](../package.json) for more commands.

## Run tests

```sh
# run all the unit tests
> npm test

# run individual tests (findprovs)
> npm run test -- --grep findprovs

# run just IPFS tests in Node.js
> npm run test -- -- -- -t node

# run just IPFS tests in a headless browser
> npm run test -- -- -- -t browser

# run the interface tests against ipfs-core
> npm run test:interface:core

# run the interface tests over HTTP against js-ipfs
> npm run test:interface:http-js

# run the interface tests over HTTP against go-ipfs from a browser
> npm run test:interface:http-go -- -- -- -t browser

# run the interop tests against js-ipfs and go-ipfs on the Electron main process
> npm run test:interop -- -- -- -t electron-main
```

More granular test suites can be run from each submodule.

Please see the `package.json` in each submodule for available commands.

## Lint

Please run the linter before submitting a PR, the build will not pass if it fails:

```sh
> npm run lint
```

## Build types and minified browser bundles

```sh
> npm run build
```

## Publishing new versions

1. Ensure you have a `GH_TOKEN` env var containing a GitHub [Personal Access Token](https://github.com/settings/tokens) with `public_repo` permissions
2. You'll also need a valid [Docker Hub](https://hub.docker.com) login with sufficient permissions to publish new Docker images to the [ipfs/js-ipfs](https://hub.docker.com/repository/docker/ipfs/js-ipfs) repository
3. From the root of this repo run `npm run release` and follow the on screen prompts.  It will use [conventional commits](https://www.conventionalcommits.org) to work out the new package version

## Using prerelease versions

Any changed packages from each successful build of master are published to npm as canary builds under the npm tag `next`.

## Testing strategy

This project has a number of components that have their own tests, then some components that share interface tests.

When adding new features you may need to add tests to one or more of the test suites described below.

### CLI

Tests live in [/packages/ipfs/test/cli](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/test/cli).

All interactions with IPFS core are stubbed so we just ensure that the correct arguments are passed in

### HTTP API

Tests live in [/packages/ipfs/test/http-api](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/test/http-api) and are similar to the CLI tests in that we stub out core interactions and inject requests with [shot](https://www.npmjs.com/package/@hapi/shot).

### Core

Anything non-implementation specific should be considered part of the 'Core API'.  For example node setup code is not Core, but anything that does useful work, e.g. network/repo/etc interactions would be Core.

All Core APIs should be documented in [/docs/core-api](https://github.com/ipfs/js-ipfs/tree/master/docs/core-api).

All Core APIs should have comprehensive tests in [/packages/interface-ipfs-core](https://github.com/ipfs/js-ipfs/tree/master/packages/interface-ipfs-core).

`interface-ipfs-core` should ensure API compatibility across implementations. Tests are run:

1. Against [/packages/ipfs/src/core](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/core) directly
1. Against [/packages/ipfs/src/http](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/src/http) over HTTP via `ipfs-http-client`
1. Against `go-ipfs` over HTTP via `ipfs-http-client`

### Non-Core

Any non-core API functionality should have tests in the `tests` directory of the module in question, for example: [/packages/ipfs-http-api/tests](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client/test) and [/packages/ipfs/tests](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs/test) for `ipfs-http-client` and `ipfs` respectively.
