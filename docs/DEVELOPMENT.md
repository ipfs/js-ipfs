# Development <!-- omit in toc -->

- [Clone and install dependencies](#clone-and-install-dependencies)
- [Run tests](#run-tests)
- [Lint](#lint)
- [Build a dist version](#build-a-dist-version)
- [Publishing new versions](#publishing-new-versions)
- [Using prerelease versions](#using-prerelease-versions)

## Clone and install dependencies

```sh
> git clone https://github.com/ipfs/js-ipfs.git
> cd js-ipfs
> npm install
```

This will install [lerna](https://www.npmjs.com/package/lerna) and bootstrap the various packages, deduping and hoisting dependencies into the root folder.

If later you add new dependencies to submodules or just wish to remove all the `node_modules`/`dist` folders and start again, run `npm run reset && npm install` from the root.

See the scripts section of the root [`package.json`](./package.json) for more commands.

## Run tests

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

## Lint

Please run the linter before submitting a PR, the build will not pass if it fails:

```sh
> npm run lint
```

## Build a dist version

```sh
> npm run build
```

## Publishing new versions

1. Ensure you have a `GH_TOKEN` env var containing a GitHub [Personal Access Token](https://github.com/settings/tokens) with `public_repo` permissions
2. You'll also need a valid [Docker Hub](https://hub.docker.com) login with sufficient permissions to publish new Docker images to the [ipfs/js-ipfs](https://hub.docker.com/repository/docker/ipfs/js-ipfs) repository
3. From the root of this repo run `npm run release` and follow the on screen prompts.  It will use [conventional commits](https://www.conventionalcommits.org) to work out the new package version

## Using prerelease versions

Any changed packages from each successful build of master are published to npm as canary builds under the npm tag `next`.
