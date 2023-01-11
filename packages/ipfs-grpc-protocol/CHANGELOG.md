# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.8.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol-v0.7.0...ipfs-grpc-protocol-v0.8.0) (2023-01-11)


### ⚠ BREAKING CHANGES

* update multiformats to v11.x.x and related depenendcies (#4277)

### Bug Fixes

* update multiformats to v11.x.x and related depenendcies ([#4277](https://www.github.com/ipfs/js-ipfs/issues/4277)) ([521c84a](https://www.github.com/ipfs/js-ipfs/commit/521c84a958b04d61702577a5adce28519c1b2a3b))
* use aegir to publish RCs ([#4284](https://www.github.com/ipfs/js-ipfs/issues/4284)) ([6d90cbf](https://www.github.com/ipfs/js-ipfs/commit/6d90cbf321a7dbf4b1084ba20f0c514dc08d8d0a))

## [0.7.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol-v0.6.0...ipfs-grpc-protocol-v0.7.0) (2022-09-06)


### ⚠ BREAKING CHANGES

* update to libp2p@0.38.x (#4151)

### deps

* update to libp2p@0.38.x ([#4151](https://www.github.com/ipfs/js-ipfs/issues/4151)) ([39dbf70](https://www.github.com/ipfs/js-ipfs/commit/39dbf708ec31b263115e44f420651fa4e056a89e))

## [0.6.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol-v0.5.5...ipfs-grpc-protocol-v0.6.0) (2022-05-27)


### ⚠ BREAKING CHANGES

* This module is now ESM only and there return types of some methods have changed

### Features

* update to libp2p 0.37.x ([#4092](https://www.github.com/ipfs/js-ipfs/issues/4092)) ([74aee8b](https://www.github.com/ipfs/js-ipfs/commit/74aee8b3d78f233c3199a3e9a6c0ac628a31a433))

### [0.5.5](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.5.4...ipfs-grpc-protocol@0.5.5) (2021-12-15)

**Note:** Version bump only for package ipfs-grpc-protocol





### [0.5.4](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.5.3...ipfs-grpc-protocol@0.5.4) (2021-11-24)

**Note:** Version bump only for package ipfs-grpc-protocol





### [0.5.3](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.5.2...ipfs-grpc-protocol@0.5.3) (2021-11-19)

**Note:** Version bump only for package ipfs-grpc-protocol





### [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.5.1...ipfs-grpc-protocol@0.5.2) (2021-11-12)

**Note:** Version bump only for package ipfs-grpc-protocol





### [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.5.0...ipfs-grpc-protocol@0.5.1) (2021-09-28)

**Note:** Version bump only for package ipfs-grpc-protocol





## [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.4.1...ipfs-grpc-protocol@0.5.0) (2021-09-24)


### Features

* switch to esm ([#3879](https://github.com/ipfs/js-ipfs/issues/3879)) ([9a40109](https://github.com/ipfs/js-ipfs/commit/9a40109632e5b4837eb77a2f57dbc77fbf1fe099))


### BREAKING CHANGES

* There are no default exports and everything is now dual published as ESM/CJS





### [0.4.1](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.4.0...ipfs-grpc-protocol@0.4.1) (2021-09-17)

**Note:** Version bump only for package ipfs-grpc-protocol





## [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.3.0...ipfs-grpc-protocol@0.4.0) (2021-08-17)


### Features

* pubsub over gRPC ([#3813](https://github.com/ipfs/js-ipfs/issues/3813)) ([e7d5509](https://github.com/ipfs/js-ipfs/commit/e7d5509c87e87aed6be3c1d0b2a01ab74cdc1ed9)), closes [#3741](https://github.com/ipfs/js-ipfs/issues/3741)





## [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.2.0...ipfs-grpc-protocol@0.3.0) (2021-05-10)


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-protocol@0.1.0...ipfs-grpc-protocol@0.2.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





# 0.1.0 (2021-01-15)


### Features

* add grpc server and client ([#3403](https://github.com/ipfs/js-ipfs/issues/3403)) ([a9027e0](https://github.com/ipfs/js-ipfs/commit/a9027e0ec0cea9a4f34b4f2f52e09abb35237384)), closes [#2519](https://github.com/ipfs/js-ipfs/issues/2519) [#2838](https://github.com/ipfs/js-ipfs/issues/2838) [#2943](https://github.com/ipfs/js-ipfs/issues/2943) [#2854](https://github.com/ipfs/js-ipfs/issues/2854) [#2864](https://github.com/ipfs/js-ipfs/issues/2864)
