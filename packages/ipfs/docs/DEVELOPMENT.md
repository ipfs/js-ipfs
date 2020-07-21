# Development <!-- omit in toc -->

> Getting started with development on IPFS

## Table of contents <!-- omit in toc -->

- [Clone and install dependencies](#clone-and-install-dependencies)
- [Run tests](#run-tests)
  - [Run interop tests](#run-interop-tests)
  - [Run benchmark tests](#run-benchmark-tests)
- [Lint](#lint)
- [Build a dist version](#build-a-dist-version)

## Clone and install dependencies

```sh
> git clone https://github.com/ipfs/js-ipfs.git
> cd js-ipfs
> npm install
```

## Run tests

```sh
# run all the unit tests
> npm test

# run individual tests (findprovs)
> npm run test -- --grep findprovs

# run just IPFS tests in Node.js
> npm run test:node

# run just IPFS core tests
> npm run test:node:core

# run just IPFS HTTP-API tests
> npm run test:node:http

# run just IPFS CLI tests
> npm run test:cli

# run just IPFS core tests in the Browser (Chrome)
> npm run test:browser

# run some interface tests (block API) on Node.js
> npm run test:node:interface -- --grep '.block'
```

### Run interop tests


```sh
# run the interop tests with the default go-IPFS
> npm run test:interop

# run the interop tests with a different go-IPFS
> IPFS_EXEC_GO=/path/to/ipfs npm run test:interop
```

### Run benchmark tests

```sh
# run all the benchmark tests
> npm run benchmark

# run just IPFS benchmarks in Node.js
> npm run benchmark:node

# run just IPFS benchmarks in Node.js for an IPFS instance
> npm run benchmark:node:core

# run just IPFS benchmarks in Node.js for an IPFS daemon
> npm run benchmark:node:http

# run just IPFS benchmarks in the browser (Chrome)
> npm run benchmark:browser
```

## Lint

**Conforming to linting rules is a prerequisite to commit to js-ipfs.**

```sh
> npm run lint
```

## Build a dist version

```sh
> npm run build
```
