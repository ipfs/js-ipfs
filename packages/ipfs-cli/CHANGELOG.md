# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.4.2](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.4.1...ipfs-cli@0.4.2) (2021-02-08)

**Note:** Version bump only for package ipfs-cli





## [0.4.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.4.0...ipfs-cli@0.4.1) (2021-02-02)

**Note:** Version bump only for package ipfs-cli





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.3.2...ipfs-cli@0.4.0) (2021-02-01)


### Bug Fixes

* updates webpack example to use v5 ([#3512](https://github.com/ipfs/js-ipfs/issues/3512)) ([c7110db](https://github.com/ipfs/js-ipfs/commit/c7110db71b5c0f0f9f415f31f91b5b228341e13e)), closes [#3511](https://github.com/ipfs/js-ipfs/issues/3511)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.3.2](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.3.1...ipfs-cli@0.3.2) (2021-01-22)

**Note:** Version bump only for package ipfs-cli





## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.3.0...ipfs-cli@0.3.1) (2021-01-20)

**Note:** Version bump only for package ipfs-cli





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.2.3...ipfs-cli@0.3.0) (2021-01-15)


### Features

* add grpc server and client ([#3403](https://github.com/ipfs/js-ipfs/issues/3403)) ([a9027e0](https://github.com/ipfs/js-ipfs/commit/a9027e0ec0cea9a4f34b4f2f52e09abb35237384)), closes [#2519](https://github.com/ipfs/js-ipfs/issues/2519) [#2838](https://github.com/ipfs/js-ipfs/issues/2838) [#2943](https://github.com/ipfs/js-ipfs/issues/2943) [#2854](https://github.com/ipfs/js-ipfs/issues/2854) [#2864](https://github.com/ipfs/js-ipfs/issues/2864)
* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)





## [0.2.3](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.2.2...ipfs-cli@0.2.3) (2020-12-16)


### Bug Fixes

* regressions introduced by new releases of CID & multicodec ([#3442](https://github.com/ipfs/js-ipfs/issues/3442)) ([b5152d8](https://github.com/ipfs/js-ipfs/commit/b5152d8cc93ecc8d39fc353ea66d7eaf1661e3c0)), closes [/github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26](https://github.com//github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb/issues/diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)





## [0.2.2](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.2.1...ipfs-cli@0.2.2) (2020-11-25)


### Bug Fixes

* do not write to prefix outside of output directory ([#3417](https://github.com/ipfs/js-ipfs/issues/3417)) ([75dd865](https://github.com/ipfs/js-ipfs/commit/75dd86529650b039be21b05b92a6413269baa4ab))
* strip control characters from user output ([#3420](https://github.com/ipfs/js-ipfs/issues/3420)) ([d13b064](https://github.com/ipfs/js-ipfs/commit/d13b064882751b00c48d42aeb309131fde0dd5c8))





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.2.0...ipfs-cli@0.2.1) (2020-11-16)


### Bug Fixes

* correct raw leaves setting ([#3401](https://github.com/ipfs/js-ipfs/issues/3401)) ([c0703ef](https://github.com/ipfs/js-ipfs/commit/c0703ef78626a91186e0c7c3374584283367c064))
* report ipfs.add progress over http ([#3310](https://github.com/ipfs/js-ipfs/issues/3310)) ([39cad4b](https://github.com/ipfs/js-ipfs/commit/39cad4b76b950ea6a76477fd01f8631b8bd9aa1e))





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.1.0...ipfs-cli@0.2.0) (2020-11-09)


### Bug Fixes

* remove electron-webrtc dependency ([#3378](https://github.com/ipfs/js-ipfs/issues/3378)) ([2bd5368](https://github.com/ipfs/js-ipfs/commit/2bd53686003527a102db9df92cedad4c6d9164f9)), closes [#3376](https://github.com/ipfs/js-ipfs/issues/3376)


### BREAKING CHANGES

* electron-webrtc was accidentally bundled with ipfs, now it needs installing separately





# 0.1.0 (2020-10-28)


### Bug Fixes

* error invalid version triggered in cli pin add/rm ([#3306](https://github.com/ipfs/js-ipfs/issues/3306)) ([69757f3](https://github.com/ipfs/js-ipfs/commit/69757f3c321c5d135ebde7a262c169427e4f1105)), closes [/github.com/ipfs/js-ipfs/blob/master/docs/core-api/PIN.md#returns-1](https://github.com//github.com/ipfs/js-ipfs/blob/master/docs/core-api/PIN.md/issues/returns-1)
* use fetch in electron renderer and electron-fetch in main ([#3251](https://github.com/ipfs/js-ipfs/issues/3251)) ([639d71f](https://github.com/ipfs/js-ipfs/commit/639d71f7ac8f66d9633e753a2a6be927e14a5af0))


### Features

* enable custom formats for dag put and get ([#3347](https://github.com/ipfs/js-ipfs/issues/3347)) ([3250ff4](https://github.com/ipfs/js-ipfs/commit/3250ff453a1d3275cc4ab746f59f9f70abd5cc5f))
* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))
