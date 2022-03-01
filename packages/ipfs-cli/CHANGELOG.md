# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.11.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.10.2...ipfs-cli@0.11.0) (2021-12-15)


### Bug Fixes

* ensure directory is passed ([#3968](https://github.com/ipfs/js-ipfs/issues/3968)) ([80ac58c](https://github.com/ipfs/js-ipfs/commit/80ac58ca27cc9f21823a23d1e6357f738fdb6781))
* **pubsub:** multibase in pubsub http rpc ([#3922](https://github.com/ipfs/js-ipfs/issues/3922)) ([6eeaca4](https://github.com/ipfs/js-ipfs/commit/6eeaca452c36fa13be42d704575c577e4ca938f1))


### chore

* Bump @ipld/dag-cbor to v7 ([#3977](https://github.com/ipfs/js-ipfs/issues/3977)) ([73476f5](https://github.com/ipfs/js-ipfs/commit/73476f55e39ecfb01eb2b4880637aad658f51bc2))


### Features

* dht client ([#3947](https://github.com/ipfs/js-ipfs/issues/3947)) ([62d8ecb](https://github.com/ipfs/js-ipfs/commit/62d8ecbc723e693a2544e69172d99c576d187c23))
* update DAG API to match go-ipfs@0.10 changes ([#3917](https://github.com/ipfs/js-ipfs/issues/3917)) ([38c01be](https://github.com/ipfs/js-ipfs/commit/38c01be03b4fd5f401cd9b698cfdb4237d835b01))


### BREAKING CHANGES

* **pubsub:** We had to make breaking changes to `pubsub` commands sent over HTTP RPC  to fix data corruption caused by topic names and payload bytes that included `\n`. More details in https://github.com/ipfs/go-ipfs/issues/7939 and https://github.com/ipfs/go-ipfs/pull/8183 
* On decode of CBOR blocks, `undefined` values will be coerced to `null`
* `ipfs.dag.put` no longer accepts a `format` arg, it is now `storeCodec` and `inputCodec`.  `'json'` has become `'dag-json'`, `'cbor'` has become `'dag-cbor'` and so on
* The DHT API has been refactored to return async iterators of query events





### [0.12.2](https://www.github.com/ipfs/js-ipfs/compare/ipfs-cli-v0.12.1...ipfs-cli-v0.12.2) (2022-03-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core bumped from ^0.14.1 to ^0.14.2
    * ipfs-core-types bumped from ^0.10.1 to ^0.10.2
    * ipfs-core-utils bumped from ^0.14.1 to ^0.14.2
    * ipfs-daemon bumped from ^0.12.1 to ^0.12.2
    * ipfs-http-client bumped from ^56.0.1 to ^56.0.2

### [0.12.1](https://www.github.com/ipfs/js-ipfs/compare/ipfs-cli-v0.12.0...ipfs-cli-v0.12.1) (2022-02-06)


### Bug Fixes

* **dag:** replace custom dag walk with multiformats/traversal ([#3950](https://www.github.com/ipfs/js-ipfs/issues/3950)) ([596b1f4](https://www.github.com/ipfs/js-ipfs/commit/596b1f48a014083b1736e4ad7e746c652d2583b1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core bumped from ^0.14.0 to ^0.14.1
    * ipfs-core-types bumped from ^0.10.0 to ^0.10.1
    * ipfs-core-utils bumped from ^0.14.0 to ^0.14.1
    * ipfs-daemon bumped from ^0.12.0 to ^0.12.1
    * ipfs-http-client bumped from ^56.0.0 to ^56.0.1

## [0.12.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-cli-v0.11.0...ipfs-cli-v0.12.0) (2022-01-27)


### ⚠ BREAKING CHANGES

* peerstore methods are now all async, the repo is migrated to v12

### Features

* libp2p async peerstore ([#4018](https://www.github.com/ipfs/js-ipfs/issues/4018)) ([a6b201a](https://www.github.com/ipfs/js-ipfs/commit/a6b201af2c3697430ab0ebe002dd573d185f1ac0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core bumped from ^0.13.0 to ^0.14.0
    * ipfs-core-types bumped from ^0.9.0 to ^0.10.0
    * ipfs-core-utils bumped from ^0.13.0 to ^0.14.0
    * ipfs-daemon bumped from ^0.11.0 to ^0.12.0
    * ipfs-http-client bumped from ^55.0.0 to ^56.0.0

## [0.10.2](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.10.1...ipfs-cli@0.10.2) (2021-11-24)

**Note:** Version bump only for package ipfs-cli





## [0.10.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.10.0...ipfs-cli@0.10.1) (2021-11-19)

**Note:** Version bump only for package ipfs-cli





# [0.10.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.9.1...ipfs-cli@0.10.0) (2021-11-12)


### Bug Fixes

* do not accept single items for ipfs.add ([#3900](https://github.com/ipfs/js-ipfs/issues/3900)) ([04e3cf3](https://github.com/ipfs/js-ipfs/commit/04e3cf3f46b585c4644cba70516f375e95361f52))


### BREAKING CHANGES

* errors will now be thrown if multiple items are passed to `ipfs.add` or single items to `ipfs.addAll` (n.b. you can still pass a list of a single item to `ipfs.addAll`)





## [0.9.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.9.0...ipfs-cli@0.9.1) (2021-09-28)

**Note:** Version bump only for package ipfs-cli





# [0.9.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.8.8...ipfs-cli@0.9.0) (2021-09-24)


### Features

* pull in new globSource ([#3889](https://github.com/ipfs/js-ipfs/issues/3889)) ([be4a542](https://github.com/ipfs/js-ipfs/commit/be4a5428ebc4b05a2edd9a91bf9df6416c1a8c2b))
* switch to esm ([#3879](https://github.com/ipfs/js-ipfs/issues/3879)) ([9a40109](https://github.com/ipfs/js-ipfs/commit/9a40109632e5b4837eb77a2f57dbc77fbf1fe099))


### BREAKING CHANGES

* the globSource api has changed from `globSource(dir, opts)` to `globSource(dir, pattern, opts)`
* There are no default exports and everything is now dual published as ESM/CJS





## [0.8.8](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.8.7...ipfs-cli@0.8.8) (2021-09-17)

**Note:** Version bump only for package ipfs-cli





## [0.8.7](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.8.6...ipfs-cli@0.8.7) (2021-09-17)

**Note:** Version bump only for package ipfs-cli





## [0.8.6](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.8.5...ipfs-cli@0.8.6) (2021-09-08)

**Note:** Version bump only for package ipfs-cli





## [0.8.5](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.8.4...ipfs-cli@0.8.5) (2021-09-02)


### Bug Fixes

* declare types in .ts files ([#3840](https://github.com/ipfs/js-ipfs/issues/3840)) ([eba5fe6](https://github.com/ipfs/js-ipfs/commit/eba5fe6832858107b3e1ae02c99de674622f12b4))
* remove use of instanceof for CID class ([#3847](https://github.com/ipfs/js-ipfs/issues/3847)) ([ebbb12d](https://github.com/ipfs/js-ipfs/commit/ebbb12db523c53ce8e4ddae5266cd9acb3504431))





## [0.8.4](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.8.3...ipfs-cli@0.8.4) (2021-08-25)


### Bug Fixes

* grpc server may not be enabled ([#3834](https://github.com/ipfs/js-ipfs/issues/3834)) ([533845e](https://github.com/ipfs/js-ipfs/commit/533845e3d140459ca383b1538e571d08850c0ef8))





## [0.8.3](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.8.1...ipfs-cli@0.8.3) (2021-08-17)

**Note:** Version bump only for package ipfs-cli





## [0.8.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.8.0...ipfs-cli@0.8.1) (2021-08-17)


### Bug Fixes

* pin nanoid version ([#3807](https://github.com/ipfs/js-ipfs/issues/3807)) ([474523a](https://github.com/ipfs/js-ipfs/commit/474523ab8702729f697843d433a7a08baf2d101f))





# [0.8.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.7.1...ipfs-cli@0.8.0) (2021-08-11)


### Features

* ed25519 keys by default ([#3693](https://github.com/ipfs/js-ipfs/issues/3693)) ([33fa734](https://github.com/ipfs/js-ipfs/commit/33fa7341c3baaf0926d887c071cc6fbce5ac49a8))
* make ipfs.get output tarballs ([#3785](https://github.com/ipfs/js-ipfs/issues/3785)) ([1ad6001](https://github.com/ipfs/js-ipfs/commit/1ad60018d39d5b46c484756631e30e1989fd8eba))


### BREAKING CHANGES

* the output type of `ipfs.get` has changed and the `recursive` option has been removed from `ipfs.ls` since it was not supported everywhere





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.7.0...ipfs-cli@0.7.1) (2021-07-30)

**Note:** Version bump only for package ipfs-cli





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.6.2...ipfs-cli@0.7.0) (2021-07-27)


### Bug Fixes

* make "ipfs resolve" cli command recursive by default ([#3707](https://github.com/ipfs/js-ipfs/issues/3707)) ([399ce36](https://github.com/ipfs/js-ipfs/commit/399ce367a1dbc531b52fe228ee4212008c9a1091)), closes [#3692](https://github.com/ipfs/js-ipfs/issues/3692)


### Features

* implement dag import/export ([#3728](https://github.com/ipfs/js-ipfs/issues/3728)) ([700765b](https://github.com/ipfs/js-ipfs/commit/700765be2634fa5d2d71d8b87cf68c9cd328d2c4)), closes [#2953](https://github.com/ipfs/js-ipfs/issues/2953) [#2745](https://github.com/ipfs/js-ipfs/issues/2745)
* upgrade to the new multiformats ([#3556](https://github.com/ipfs/js-ipfs/issues/3556)) ([d13d15f](https://github.com/ipfs/js-ipfs/commit/d13d15f022a87d04a35f0f7822142f9cb898479c))


### BREAKING CHANGES

* resolve is now recursive by default

Co-authored-by: Alex Potsides <alex@achingbrain.net>
* ipld-formats no longer supported, use multiformat BlockCodecs instead

Co-authored-by: Rod Vagg <rod@vagg.org>
Co-authored-by: achingbrain <alex@achingbrain.net>





## [0.6.2](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.6.1...ipfs-cli@0.6.2) (2021-06-18)

**Note:** Version bump only for package ipfs-cli





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.6.0...ipfs-cli@0.6.1) (2021-06-05)


### Bug Fixes

* stalling subscription on (node) http-client when daemon is stopped ([#3468](https://github.com/ipfs/js-ipfs/issues/3468)) ([0266abf](https://github.com/ipfs/js-ipfs/commit/0266abf0c4b817636172f78c6e91eb4dd5aad451)), closes [#3465](https://github.com/ipfs/js-ipfs/issues/3465)





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.5.1...ipfs-cli@0.6.0) (2021-05-26)


### Features

* allow passing the id of a network peer to ipfs.id ([#3386](https://github.com/ipfs/js-ipfs/issues/3386)) ([00fd709](https://github.com/ipfs/js-ipfs/commit/00fd709a7b71e7cf354ea452ebce460dd7375d34))





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.5.0...ipfs-cli@0.5.1) (2021-05-11)

**Note:** Version bump only for package ipfs-cli





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.4.4...ipfs-cli@0.5.0) (2021-05-10)


### Bug Fixes

* mark ipld options as partial ([#3669](https://github.com/ipfs/js-ipfs/issues/3669)) ([f98af8e](https://github.com/ipfs/js-ipfs/commit/f98af8ed24784929898bb5d33a64dc442c77074d))
* update ipfs repo ([#3671](https://github.com/ipfs/js-ipfs/issues/3671)) ([9029ee5](https://github.com/ipfs/js-ipfs/commit/9029ee591fa74ea65c9600f2d249897e933416fa))
* update types after feedback from ceramic ([#3657](https://github.com/ipfs/js-ipfs/issues/3657)) ([0ddbb1b](https://github.com/ipfs/js-ipfs/commit/0ddbb1b1deb4e40dac3e365d7f98a5f174c2ce8f)), closes [#3640](https://github.com/ipfs/js-ipfs/issues/3640)


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.4.4](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.4.3...ipfs-cli@0.4.4) (2021-03-10)

**Note:** Version bump only for package ipfs-cli





## [0.4.3](https://github.com/ipfs/js-ipfs/compare/ipfs-cli@0.4.2...ipfs-cli@0.4.3) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





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
