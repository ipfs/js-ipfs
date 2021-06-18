# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.4](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.3.3...ipfs-grpc-server@0.3.4) (2021-06-18)

**Note:** Version bump only for package ipfs-grpc-server





## [0.3.3](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.3.2...ipfs-grpc-server@0.3.3) (2021-06-05)

**Note:** Version bump only for package ipfs-grpc-server





## [0.3.2](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.3.1...ipfs-grpc-server@0.3.2) (2021-05-26)

**Note:** Version bump only for package ipfs-grpc-server





## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.3.0...ipfs-grpc-server@0.3.1) (2021-05-11)

**Note:** Version bump only for package ipfs-grpc-server





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.2.4...ipfs-grpc-server@0.3.0) (2021-05-10)


### Bug Fixes

* ignore the ts error caused by the recent protobufjs type change ([#3656](https://github.com/ipfs/js-ipfs/issues/3656)) ([084589c](https://github.com/ipfs/js-ipfs/commit/084589c0116d8f27ce1462424fb93b6037b776a9))
* update data type for ws message event handler ([#3641](https://github.com/ipfs/js-ipfs/issues/3641)) ([4a14d20](https://github.com/ipfs/js-ipfs/commit/4a14d20e727b50a8d98c14573d9a5b6fa0e8699d))


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.2.4](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.2.3...ipfs-grpc-server@0.2.4) (2021-03-10)

**Note:** Version bump only for package ipfs-grpc-server





## [0.2.3](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.2.2...ipfs-grpc-server@0.2.3) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.2.2](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.2.1...ipfs-grpc-server@0.2.2) (2021-02-08)

**Note:** Version bump only for package ipfs-grpc-server





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.2.0...ipfs-grpc-server@0.2.1) (2021-02-02)

**Note:** Version bump only for package ipfs-grpc-server





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.1.2...ipfs-grpc-server@0.2.0) (2021-02-01)


### Bug Fixes

* updates webpack example to use v5 ([#3512](https://github.com/ipfs/js-ipfs/issues/3512)) ([c7110db](https://github.com/ipfs/js-ipfs/commit/c7110db71b5c0f0f9f415f31f91b5b228341e13e)), closes [#3511](https://github.com/ipfs/js-ipfs/issues/3511)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### Features

* support  remote pinning services in ipfs-http-client ([#3293](https://github.com/ipfs/js-ipfs/issues/3293)) ([ba240fd](https://github.com/ipfs/js-ipfs/commit/ba240fdf93edc88028315483240d7822a7ca88ed))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.1.2](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.1.1...ipfs-grpc-server@0.1.2) (2021-01-22)

**Note:** Version bump only for package ipfs-grpc-server





## [0.1.1](https://github.com/ipfs/js-ipfs/compare/ipfs-grpc-server@0.1.0...ipfs-grpc-server@0.1.1) (2021-01-20)

**Note:** Version bump only for package ipfs-grpc-server





# 0.1.0 (2021-01-15)


### Features

* add grpc server and client ([#3403](https://github.com/ipfs/js-ipfs/issues/3403)) ([a9027e0](https://github.com/ipfs/js-ipfs/commit/a9027e0ec0cea9a4f34b4f2f52e09abb35237384)), closes [#2519](https://github.com/ipfs/js-ipfs/issues/2519) [#2838](https://github.com/ipfs/js-ipfs/issues/2838) [#2943](https://github.com/ipfs/js-ipfs/issues/2943) [#2854](https://github.com/ipfs/js-ipfs/issues/2854) [#2864](https://github.com/ipfs/js-ipfs/issues/2864)
