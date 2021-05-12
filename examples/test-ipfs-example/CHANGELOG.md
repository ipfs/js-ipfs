# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/ipfs/js-ipfs/compare/test-ipfs-example@2.1.0...test-ipfs-example@3.0.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





# [2.1.0](https://github.com/ipfs/js-ipfs/compare/test-ipfs-example@2.0.3...test-ipfs-example@2.1.0) (2020-10-28)


### Features

* ipns publish example ([#3207](https://github.com/ipfs/js-ipfs/issues/3207)) ([91faec6](https://github.com/ipfs/js-ipfs/commit/91faec6e3d89b0d9883b8d7815c276d44048e739))
* store pins in datastore instead of a DAG ([#2771](https://github.com/ipfs/js-ipfs/issues/2771)) ([64b7fe4](https://github.com/ipfs/js-ipfs/commit/64b7fe41738cbe96d5a9075f0c01156c6f889c40))





## [2.0.3](https://github.com/ipfs/js-ipfs/compare/test-ipfs-example@2.0.2...test-ipfs-example@2.0.3) (2020-05-29)

**Note:** Version bump only for package test-ipfs-example





## [2.0.2](https://github.com/ipfs/js-ipfs/compare/test-ipfs-example@2.0.1...test-ipfs-example@2.0.2) (2020-05-18)


### Bug Fixes

* fixes browser script tag example ([#3034](https://github.com/ipfs/js-ipfs/issues/3034)) ([ee8b769](https://github.com/ipfs/js-ipfs/commit/ee8b769b96f7e3c8414bbf85853ab4e21e8fd11c)), closes [#3027](https://github.com/ipfs/js-ipfs/issues/3027)





## [2.0.1](https://github.com/ipfs/js-ipfs/compare/test-ipfs-example@2.0.0...test-ipfs-example@2.0.1) (2020-04-08)

**Note:** Version bump only for package test-ipfs-example





# 2.0.0 (2020-03-31)


### chore

* update dep version and ignore interop test for raw leaves ([#2747](https://github.com/ipfs/js-ipfs/issues/2747)) ([6376cec](https://github.com/ipfs/js-ipfs/commit/6376cec2b4beccef4751c498088f600ec7788118))


### BREAKING CHANGES

* Files that fit into one block imported with either `--cid-version=1`
or `--raw-leaves=true` previously returned a CID that resolved to
a raw node (e.g. a buffer). Returned CIDs now resolve to a `dag-pb`
node that contains a UnixFS entry. This is to allow setting metadata
on small files with CIDv1.
