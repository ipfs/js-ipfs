# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.10.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.9.2...ipfs-http-server@0.10.0) (2021-12-15)


### Bug Fixes

* **pubsub:** multibase in pubsub http rpc ([#3922](https://github.com/ipfs/js-ipfs/issues/3922)) ([6eeaca4](https://github.com/ipfs/js-ipfs/commit/6eeaca452c36fa13be42d704575c577e4ca938f1))


### Features

* dht client ([#3947](https://github.com/ipfs/js-ipfs/issues/3947)) ([62d8ecb](https://github.com/ipfs/js-ipfs/commit/62d8ecbc723e693a2544e69172d99c576d187c23))
* improve collected metrics ([#3978](https://github.com/ipfs/js-ipfs/issues/3978)) ([33f1034](https://github.com/ipfs/js-ipfs/commit/33f1034a6fc257f1a87de7bb38d876925f61cb5f))
* update DAG API to match go-ipfs@0.10 changes ([#3917](https://github.com/ipfs/js-ipfs/issues/3917)) ([38c01be](https://github.com/ipfs/js-ipfs/commit/38c01be03b4fd5f401cd9b698cfdb4237d835b01))


### BREAKING CHANGES

* **pubsub:** We had to make breaking changes to `pubsub` commands sent over HTTP RPC  to fix data corruption caused by topic names and payload bytes that included `\n`. More details in https://github.com/ipfs/go-ipfs/issues/7939 and https://github.com/ipfs/go-ipfs/pull/8183 
* `ipfs.dag.put` no longer accepts a `format` arg, it is now `storeCodec` and `inputCodec`.  `'json'` has become `'dag-json'`, `'cbor'` has become `'dag-cbor'` and so on
* The DHT API has been refactored to return async iterators of query events





### [0.11.2](https://www.github.com/ipfs/js-ipfs/compare/ipfs-http-server-v0.11.1...ipfs-http-server-v0.11.2) (2022-03-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-types bumped from ^0.10.1 to ^0.10.2
    * ipfs-core-utils bumped from ^0.14.1 to ^0.14.2
    * ipfs-http-gateway bumped from ^0.9.1 to ^0.9.2
  * devDependencies
    * ipfs-http-client bumped from ^56.0.1 to ^56.0.2

### [0.11.1](https://www.github.com/ipfs/js-ipfs/compare/ipfs-http-server-v0.11.0...ipfs-http-server-v0.11.1) (2022-02-06)


### Bug Fixes

* **dag:** replace custom dag walk with multiformats/traversal ([#3950](https://www.github.com/ipfs/js-ipfs/issues/3950)) ([596b1f4](https://www.github.com/ipfs/js-ipfs/commit/596b1f48a014083b1736e4ad7e746c652d2583b1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-types bumped from ^0.10.0 to ^0.10.1
    * ipfs-core-utils bumped from ^0.14.0 to ^0.14.1
    * ipfs-http-gateway bumped from ^0.9.0 to ^0.9.1
  * devDependencies
    * ipfs-http-client bumped from ^56.0.0 to ^56.0.1

## [0.11.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-http-server-v0.10.0...ipfs-http-server-v0.11.0) (2022-01-27)


### ⚠ BREAKING CHANGES

* peerstore methods are now all async, the repo is migrated to v12
* node 15+ is required

### Features

* libp2p async peerstore ([#4018](https://www.github.com/ipfs/js-ipfs/issues/4018)) ([a6b201a](https://www.github.com/ipfs/js-ipfs/commit/a6b201af2c3697430ab0ebe002dd573d185f1ac0))


### Bug Fixes

* remove abort-controller deps ([#4015](https://www.github.com/ipfs/js-ipfs/issues/4015)) ([902e887](https://www.github.com/ipfs/js-ipfs/commit/902e887e1acac87f607324fa7cb5ad4b14aefcf3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-types bumped from ^0.9.0 to ^0.10.0
    * ipfs-core-utils bumped from ^0.13.0 to ^0.14.0
    * ipfs-http-gateway bumped from ^0.8.0 to ^0.9.0
  * devDependencies
    * ipfs-http-client bumped from ^55.0.0 to ^56.0.0

## [0.9.2](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.9.1...ipfs-http-server@0.9.2) (2021-11-24)

**Note:** Version bump only for package ipfs-http-server





## [0.9.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.9.0...ipfs-http-server@0.9.1) (2021-11-19)

**Note:** Version bump only for package ipfs-http-server





# [0.9.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.8.1...ipfs-http-server@0.9.0) (2021-11-12)


### Bug Fixes

* do not accept single items for ipfs.add ([#3900](https://github.com/ipfs/js-ipfs/issues/3900)) ([04e3cf3](https://github.com/ipfs/js-ipfs/commit/04e3cf3f46b585c4644cba70516f375e95361f52))


### BREAKING CHANGES

* errors will now be thrown if multiple items are passed to `ipfs.add` or single items to `ipfs.addAll` (n.b. you can still pass a list of a single item to `ipfs.addAll`)





## [0.8.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.8.0...ipfs-http-server@0.8.1) (2021-09-28)

**Note:** Version bump only for package ipfs-http-server





# [0.8.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.7.6...ipfs-http-server@0.8.0) (2021-09-24)


### Features

* switch to esm ([#3879](https://github.com/ipfs/js-ipfs/issues/3879)) ([9a40109](https://github.com/ipfs/js-ipfs/commit/9a40109632e5b4837eb77a2f57dbc77fbf1fe099))


### BREAKING CHANGES

* There are no default exports and everything is now dual published as ESM/CJS





## [0.7.6](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.7.5...ipfs-http-server@0.7.6) (2021-09-17)

**Note:** Version bump only for package ipfs-http-server





## [0.7.5](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.7.4...ipfs-http-server@0.7.5) (2021-09-17)

**Note:** Version bump only for package ipfs-http-server





## [0.7.4](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.7.3...ipfs-http-server@0.7.4) (2021-09-08)

**Note:** Version bump only for package ipfs-http-server





## [0.7.3](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.7.2...ipfs-http-server@0.7.3) (2021-09-02)


### Bug Fixes

* declare types in .ts files ([#3840](https://github.com/ipfs/js-ipfs/issues/3840)) ([eba5fe6](https://github.com/ipfs/js-ipfs/commit/eba5fe6832858107b3e1ae02c99de674622f12b4))
* remove use of instanceof for CID class ([#3847](https://github.com/ipfs/js-ipfs/issues/3847)) ([ebbb12d](https://github.com/ipfs/js-ipfs/commit/ebbb12db523c53ce8e4ddae5266cd9acb3504431))





## [0.7.2](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.7.1...ipfs-http-server@0.7.2) (2021-08-25)

**Note:** Version bump only for package ipfs-http-server





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.7.0...ipfs-http-server@0.7.1) (2021-08-17)

**Note:** Version bump only for package ipfs-http-server





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.6.1...ipfs-http-server@0.7.0) (2021-08-11)


### Bug Fixes

* return rate in/out as number ([#3798](https://github.com/ipfs/js-ipfs/issues/3798)) ([2f3df7a](https://github.com/ipfs/js-ipfs/commit/2f3df7a70fe94d6bdf20947854dc9d0b88cb759a)), closes [#3782](https://github.com/ipfs/js-ipfs/issues/3782)


### Features

* make ipfs.get output tarballs ([#3785](https://github.com/ipfs/js-ipfs/issues/3785)) ([1ad6001](https://github.com/ipfs/js-ipfs/commit/1ad60018d39d5b46c484756631e30e1989fd8eba))


### BREAKING CHANGES

* rateIn/rateOut are returned as numbers
* the output type of `ipfs.get` has changed and the `recursive` option has been removed from `ipfs.ls` since it was not supported everywhere





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.6.0...ipfs-http-server@0.6.1) (2021-07-30)


### Bug Fixes

* typo in 'multiformats' type defs ([#3778](https://github.com/ipfs/js-ipfs/issues/3778)) ([1bf35f8](https://github.com/ipfs/js-ipfs/commit/1bf35f8a1622dea1e88bfbd701205df4f96998b1))





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.5.2...ipfs-http-server@0.6.0) (2021-07-27)


### Features

* implement dag import/export ([#3728](https://github.com/ipfs/js-ipfs/issues/3728)) ([700765b](https://github.com/ipfs/js-ipfs/commit/700765be2634fa5d2d71d8b87cf68c9cd328d2c4)), closes [#2953](https://github.com/ipfs/js-ipfs/issues/2953) [#2745](https://github.com/ipfs/js-ipfs/issues/2745)
* upgrade to the new multiformats ([#3556](https://github.com/ipfs/js-ipfs/issues/3556)) ([d13d15f](https://github.com/ipfs/js-ipfs/commit/d13d15f022a87d04a35f0f7822142f9cb898479c))


### BREAKING CHANGES

* ipld-formats no longer supported, use multiformat BlockCodecs instead

Co-authored-by: Rod Vagg <rod@vagg.org>
Co-authored-by: achingbrain <alex@achingbrain.net>





## [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.5.1...ipfs-http-server@0.5.2) (2021-06-18)

**Note:** Version bump only for package ipfs-http-server





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.5.0...ipfs-http-server@0.5.1) (2021-06-05)

**Note:** Version bump only for package ipfs-http-server





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.4.0...ipfs-http-server@0.5.0) (2021-05-26)


### Features

* allow passing the id of a network peer to ipfs.id ([#3386](https://github.com/ipfs/js-ipfs/issues/3386)) ([00fd709](https://github.com/ipfs/js-ipfs/commit/00fd709a7b71e7cf354ea452ebce460dd7375d34))





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.3.4...ipfs-http-server@0.4.0) (2021-05-10)


### Bug Fixes

* only use public api in http api server ([#3660](https://github.com/ipfs/js-ipfs/issues/3660)) ([61d0981](https://github.com/ipfs/js-ipfs/commit/61d0981c05371c4846dcea3330ac9fb2e810b8fa)), closes [#3639](https://github.com/ipfs/js-ipfs/issues/3639)
* reject requests when cors origin list is empty ([#3674](https://github.com/ipfs/js-ipfs/issues/3674)) ([0b2d98c](https://github.com/ipfs/js-ipfs/commit/0b2d98c53ba18491d7b99ae9cc0955281146610d))


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### Features

* support identity hash in block.get + dag.get ([#3616](https://github.com/ipfs/js-ipfs/issues/3616)) ([28ad9ad](https://github.com/ipfs/js-ipfs/commit/28ad9ad6e50abb89a366ecd6b5301e848f0e9962))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.3.4](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.3.3...ipfs-http-server@0.3.4) (2021-03-10)

**Note:** Version bump only for package ipfs-http-server





## [0.3.3](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.3.2...ipfs-http-server@0.3.3) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.3.2](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.3.1...ipfs-http-server@0.3.2) (2021-02-08)

**Note:** Version bump only for package ipfs-http-server





## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.3.0...ipfs-http-server@0.3.1) (2021-02-02)

**Note:** Version bump only for package ipfs-http-server





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.2.2...ipfs-http-server@0.3.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.2.2](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.2.1...ipfs-http-server@0.2.2) (2021-01-22)

**Note:** Version bump only for package ipfs-http-server





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.2.0...ipfs-http-server@0.2.1) (2021-01-20)

**Note:** Version bump only for package ipfs-http-server





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.1.4...ipfs-http-server@0.2.0) (2021-01-15)


### Features

* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)





## [0.1.4](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.1.3...ipfs-http-server@0.1.4) (2020-12-16)


### Bug Fixes

* fix ipfs.ls() for a single file object ([#3440](https://github.com/ipfs/js-ipfs/issues/3440)) ([f243dd1](https://github.com/ipfs/js-ipfs/commit/f243dd1c37fcb9786d77d129cd9b238457d18a15))
* regressions introduced by new releases of CID & multicodec ([#3442](https://github.com/ipfs/js-ipfs/issues/3442)) ([b5152d8](https://github.com/ipfs/js-ipfs/commit/b5152d8cc93ecc8d39fc353ea66d7eaf1661e3c0)), closes [/github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26](https://github.com//github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb/issues/diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)





## [0.1.3](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.1.2...ipfs-http-server@0.1.3) (2020-11-25)

**Note:** Version bump only for package ipfs-http-server





## [0.1.2](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.1.1...ipfs-http-server@0.1.2) (2020-11-16)


### Bug Fixes

* align behaviour between go and js for content without paths ([#3385](https://github.com/ipfs/js-ipfs/issues/3385)) ([334873d](https://github.com/ipfs/js-ipfs/commit/334873d3784e2baa2b19f8f69b5aade36715ba03))





## [0.1.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.1.0...ipfs-http-server@0.1.1) (2020-11-09)

**Note:** Version bump only for package ipfs-http-server





# 0.1.0 (2020-10-28)


### Bug Fixes

* files ls should return string ([#3352](https://github.com/ipfs/js-ipfs/issues/3352)) ([16ecc74](https://github.com/ipfs/js-ipfs/commit/16ecc7485dfbb1f0c827c5f804974bb804f3dafd)), closes [#3345](https://github.com/ipfs/js-ipfs/issues/3345) [#2939](https://github.com/ipfs/js-ipfs/issues/2939) [#3330](https://github.com/ipfs/js-ipfs/issues/3330) [#2948](https://github.com/ipfs/js-ipfs/issues/2948)
* use fetch in electron renderer and electron-fetch in main ([#3251](https://github.com/ipfs/js-ipfs/issues/3251)) ([639d71f](https://github.com/ipfs/js-ipfs/commit/639d71f7ac8f66d9633e753a2a6be927e14a5af0))


### Features

* enable custom formats for dag put and get ([#3347](https://github.com/ipfs/js-ipfs/issues/3347)) ([3250ff4](https://github.com/ipfs/js-ipfs/commit/3250ff453a1d3275cc4ab746f59f9f70abd5cc5f))
* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))
* webui v2.11.4 ([#3317](https://github.com/ipfs/js-ipfs/issues/3317)) ([7f32f7f](https://github.com/ipfs/js-ipfs/commit/7f32f7fd1eb3cffc3cd529827e4af7a8a08e36d9))


### BREAKING CHANGES

* types returned by `ipfs.files.ls` are now strings, in line with the docs but different to previous behaviour

Co-authored-by: Geoffrey Cohler <g.cohler@computer.org>
