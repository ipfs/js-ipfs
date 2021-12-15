# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.9.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.8.4...ipfs-core-types@0.9.0) (2021-12-15)


### Features

* dht client ([#3947](https://github.com/ipfs/js-ipfs/issues/3947)) ([62d8ecb](https://github.com/ipfs/js-ipfs/commit/62d8ecbc723e693a2544e69172d99c576d187c23))
* update DAG API to match go-ipfs@0.10 changes ([#3917](https://github.com/ipfs/js-ipfs/issues/3917)) ([38c01be](https://github.com/ipfs/js-ipfs/commit/38c01be03b4fd5f401cd9b698cfdb4237d835b01))


### BREAKING CHANGES

* `ipfs.dag.put` no longer accepts a `format` arg, it is now `storeCodec` and `inputCodec`.  `'json'` has become `'dag-json'`, `'cbor'` has become `'dag-cbor'` and so on
* The DHT API has been refactored to return async iterators of query events





## [0.8.4](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.8.3...ipfs-core-types@0.8.4) (2021-11-24)

**Note:** Version bump only for package ipfs-core-types





## [0.8.3](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.8.2...ipfs-core-types@0.8.3) (2021-11-19)

**Note:** Version bump only for package ipfs-core-types





## [0.8.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.8.1...ipfs-core-types@0.8.2) (2021-11-12)

**Note:** Version bump only for package ipfs-core-types





## [0.8.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.8.0...ipfs-core-types@0.8.1) (2021-09-28)

**Note:** Version bump only for package ipfs-core-types





# [0.8.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.7.3...ipfs-core-types@0.8.0) (2021-09-24)


### Features

* switch to esm ([#3879](https://github.com/ipfs/js-ipfs/issues/3879)) ([9a40109](https://github.com/ipfs/js-ipfs/commit/9a40109632e5b4837eb77a2f57dbc77fbf1fe099))


### BREAKING CHANGES

* There are no default exports and everything is now dual published as ESM/CJS





## [0.7.3](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.7.2...ipfs-core-types@0.7.3) (2021-09-17)


### Bug Fixes

* use Key.asKey instead of instanceOf ([#3877](https://github.com/ipfs/js-ipfs/issues/3877)) ([e3acf9b](https://github.com/ipfs/js-ipfs/commit/e3acf9b67765c166c53f923a9e00430cdf46935b)), closes [#3852](https://github.com/ipfs/js-ipfs/issues/3852)





## [0.7.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.7.1...ipfs-core-types@0.7.2) (2021-09-17)

**Note:** Version bump only for package ipfs-core-types





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.7.0...ipfs-core-types@0.7.1) (2021-09-02)


### Bug Fixes

* declare types in .ts files ([#3840](https://github.com/ipfs/js-ipfs/issues/3840)) ([eba5fe6](https://github.com/ipfs/js-ipfs/commit/eba5fe6832858107b3e1ae02c99de674622f12b4))
* remove use of instanceof for CID class ([#3847](https://github.com/ipfs/js-ipfs/issues/3847)) ([ebbb12d](https://github.com/ipfs/js-ipfs/commit/ebbb12db523c53ce8e4ddae5266cd9acb3504431))





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.6.1...ipfs-core-types@0.7.0) (2021-08-11)


### Bug Fixes

* return rate in/out as number ([#3798](https://github.com/ipfs/js-ipfs/issues/3798)) ([2f3df7a](https://github.com/ipfs/js-ipfs/commit/2f3df7a70fe94d6bdf20947854dc9d0b88cb759a)), closes [#3782](https://github.com/ipfs/js-ipfs/issues/3782)
* typescript errors ([#3781](https://github.com/ipfs/js-ipfs/issues/3781)) ([79f661e](https://github.com/ipfs/js-ipfs/commit/79f661ef0da859e1fd8ef979df3fb1303d384b8d))


### Features

* make ipfs.get output tarballs ([#3785](https://github.com/ipfs/js-ipfs/issues/3785)) ([1ad6001](https://github.com/ipfs/js-ipfs/commit/1ad60018d39d5b46c484756631e30e1989fd8eba))


### BREAKING CHANGES

* rateIn/rateOut are returned as numbers
* the output type of `ipfs.get` has changed and the `recursive` option has been removed from `ipfs.ls` since it was not supported everywhere





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.6.0...ipfs-core-types@0.6.1) (2021-07-30)


### Bug Fixes

* typo in 'multiformats' type defs ([#3778](https://github.com/ipfs/js-ipfs/issues/3778)) ([1bf35f8](https://github.com/ipfs/js-ipfs/commit/1bf35f8a1622dea1e88bfbd701205df4f96998b1))





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.5.2...ipfs-core-types@0.6.0) (2021-07-27)


### Bug Fixes

* export ipfs http client type and use option extension for client ([#3763](https://github.com/ipfs/js-ipfs/issues/3763)) ([31bddd4](https://github.com/ipfs/js-ipfs/commit/31bddd40ab85848cd283ec66001fb7555b4f2d88)), closes [#3749](https://github.com/ipfs/js-ipfs/issues/3749) [#3736](https://github.com/ipfs/js-ipfs/issues/3736)
* **ipfs-core-types:** wrong extension ([#3753](https://github.com/ipfs/js-ipfs/issues/3753)) ([4bad1c6](https://github.com/ipfs/js-ipfs/commit/4bad1c61f5946e32cf75196cd2c45c5316500b0f))


### Features

* implement dag import/export ([#3728](https://github.com/ipfs/js-ipfs/issues/3728)) ([700765b](https://github.com/ipfs/js-ipfs/commit/700765be2634fa5d2d71d8b87cf68c9cd328d2c4)), closes [#2953](https://github.com/ipfs/js-ipfs/issues/2953) [#2745](https://github.com/ipfs/js-ipfs/issues/2745)
* upgrade to the new multiformats ([#3556](https://github.com/ipfs/js-ipfs/issues/3556)) ([d13d15f](https://github.com/ipfs/js-ipfs/commit/d13d15f022a87d04a35f0f7822142f9cb898479c))


### BREAKING CHANGES

* ipld-formats no longer supported, use multiformat BlockCodecs instead

Co-authored-by: Rod Vagg <rod@vagg.org>
Co-authored-by: achingbrain <alex@achingbrain.net>





## [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.5.1...ipfs-core-types@0.5.2) (2021-06-18)

**Note:** Version bump only for package ipfs-core-types





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.5.0...ipfs-core-types@0.5.1) (2021-06-05)


### Bug Fixes

* add onError to pubsub.subscribe types ([#3706](https://github.com/ipfs/js-ipfs/issues/3706)) ([d910aea](https://github.com/ipfs/js-ipfs/commit/d910aead8c8be6798cf838245511331b3f69634c)), closes [#3468](https://github.com/ipfs/js-ipfs/issues/3468)





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.4.0...ipfs-core-types@0.5.0) (2021-05-26)


### Features

* allow passing the id of a network peer to ipfs.id ([#3386](https://github.com/ipfs/js-ipfs/issues/3386)) ([00fd709](https://github.com/ipfs/js-ipfs/commit/00fd709a7b71e7cf354ea452ebce460dd7375d34))





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.3.1...ipfs-core-types@0.4.0) (2021-05-10)


### Bug Fixes

* fix types ([#3662](https://github.com/ipfs/js-ipfs/issues/3662)) ([0fe8892](https://github.com/ipfs/js-ipfs/commit/0fe8892361180dab53ed3c3b006479b32a792d44))
* loosen input type for swarm.connect and swarm.disconnect ([#3673](https://github.com/ipfs/js-ipfs/issues/3673)) ([46618c7](https://github.com/ipfs/js-ipfs/commit/46618c795bf5363ba3186645640fb81349231db7)), closes [#3638](https://github.com/ipfs/js-ipfs/issues/3638)
* mark ipld options as partial ([#3669](https://github.com/ipfs/js-ipfs/issues/3669)) ([f98af8e](https://github.com/ipfs/js-ipfs/commit/f98af8ed24784929898bb5d33a64dc442c77074d))
* update ipfs repo ([#3671](https://github.com/ipfs/js-ipfs/issues/3671)) ([9029ee5](https://github.com/ipfs/js-ipfs/commit/9029ee591fa74ea65c9600f2d249897e933416fa))
* update types after feedback from ceramic ([#3657](https://github.com/ipfs/js-ipfs/issues/3657)) ([0ddbb1b](https://github.com/ipfs/js-ipfs/commit/0ddbb1b1deb4e40dac3e365d7f98a5f174c2ce8f)), closes [#3640](https://github.com/ipfs/js-ipfs/issues/3640)


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.3.0...ipfs-core-types@0.3.1) (2021-03-09)


### Bug Fixes

* bitswap related typedefs ([#3580](https://github.com/ipfs/js-ipfs/issues/3580)) ([1af82d1](https://github.com/ipfs/js-ipfs/commit/1af82d1ca4bd447d8c162e1fd8da8b043131969c))
* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.2.1...ipfs-core-types@0.3.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### Features

* support  remote pinning services in ipfs-http-client ([#3293](https://github.com/ipfs/js-ipfs/issues/3293)) ([ba240fd](https://github.com/ipfs/js-ipfs/commit/ba240fdf93edc88028315483240d7822a7ca88ed))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-types@0.2.0...ipfs-core-types@0.2.1) (2021-01-22)


### Bug Fixes

* issue with isolateModules flag ([#3495](https://github.com/ipfs/js-ipfs/issues/3495)) ([839e190](https://github.com/ipfs/js-ipfs/commit/839e1908f3c050b45af176883a7e450fb339bef0)), closes [#3494](https://github.com/ipfs/js-ipfs/issues/3494) [#3498](https://github.com/ipfs/js-ipfs/issues/3498) [/github.com/ipfs-shipyard/ipfs-webui/pull/1655#issuecomment-763846124](https://github.com//github.com/ipfs-shipyard/ipfs-webui/pull/1655/issues/issuecomment-763846124)





# 0.2.0 (2021-01-15)


### Features

* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)
