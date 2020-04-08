# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
