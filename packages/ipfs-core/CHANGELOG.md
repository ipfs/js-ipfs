# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.13.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.12.2...ipfs-core@0.13.0) (2021-12-15)


### Bug Fixes

* always close writer so iterator throws on error ([#3980](https://github.com/ipfs/js-ipfs/issues/3980)) ([d147494](https://github.com/ipfs/js-ipfs/commit/d147494f362d38244bbeafbd6e7d76789c7c5020))
* **pubsub:** multibase in pubsub http rpc ([#3922](https://github.com/ipfs/js-ipfs/issues/3922)) ([6eeaca4](https://github.com/ipfs/js-ipfs/commit/6eeaca452c36fa13be42d704575c577e4ca938f1))
* return nested value from dag.get ([#3966](https://github.com/ipfs/js-ipfs/issues/3966)) ([45ac973](https://github.com/ipfs/js-ipfs/commit/45ac9730d6484e8324acfbc3579fce052b8452d7)), closes [#3957](https://github.com/ipfs/js-ipfs/issues/3957)
* use peer store for id ([#3973](https://github.com/ipfs/js-ipfs/issues/3973)) ([adde8c1](https://github.com/ipfs/js-ipfs/commit/adde8c13ba433b81e76033c418607be389fb3d31))


### chore

* Bump @ipld/dag-cbor to v7 ([#3977](https://github.com/ipfs/js-ipfs/issues/3977)) ([73476f5](https://github.com/ipfs/js-ipfs/commit/73476f55e39ecfb01eb2b4880637aad658f51bc2))


### Features

* dht client ([#3947](https://github.com/ipfs/js-ipfs/issues/3947)) ([62d8ecb](https://github.com/ipfs/js-ipfs/commit/62d8ecbc723e693a2544e69172d99c576d187c23))
* improve collected metrics ([#3978](https://github.com/ipfs/js-ipfs/issues/3978)) ([33f1034](https://github.com/ipfs/js-ipfs/commit/33f1034a6fc257f1a87de7bb38d876925f61cb5f))
* update DAG API to match go-ipfs@0.10 changes ([#3917](https://github.com/ipfs/js-ipfs/issues/3917)) ([38c01be](https://github.com/ipfs/js-ipfs/commit/38c01be03b4fd5f401cd9b698cfdb4237d835b01))


### BREAKING CHANGES

* **pubsub:** We had to make breaking changes to `pubsub` commands sent over HTTP RPC  to fix data corruption caused by topic names and payload bytes that included `\n`. More details in https://github.com/ipfs/go-ipfs/issues/7939 and https://github.com/ipfs/go-ipfs/pull/8183 
* On decode of CBOR blocks, `undefined` values will be coerced to `null`
* `ipfs.dag.put` no longer accepts a `format` arg, it is now `storeCodec` and `inputCodec`.  `'json'` has become `'dag-json'`, `'cbor'` has become `'dag-cbor'` and so on
* The DHT API has been refactored to return async iterators of query events





### [0.14.2](https://www.github.com/ipfs/js-ipfs/compare/ipfs-core-v0.14.1...ipfs-core-v0.14.2) (2022-03-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-config bumped from ^0.3.1 to ^0.3.2
    * ipfs-core-types bumped from ^0.10.1 to ^0.10.2
    * ipfs-core-utils bumped from ^0.14.1 to ^0.14.2
    * ipfs-http-client bumped from ^56.0.1 to ^56.0.2
  * devDependencies
    * interface-ipfs-core bumped from ^0.154.1 to ^0.154.2

### [0.14.1](https://www.github.com/ipfs/js-ipfs/compare/ipfs-core-v0.14.0...ipfs-core-v0.14.1) (2022-02-06)


### Bug Fixes

* **dag:** replace custom dag walk with multiformats/traversal ([#3950](https://www.github.com/ipfs/js-ipfs/issues/3950)) ([596b1f4](https://www.github.com/ipfs/js-ipfs/commit/596b1f48a014083b1736e4ad7e746c652d2583b1))
* override hashing algorithm when importing files ([#4042](https://www.github.com/ipfs/js-ipfs/issues/4042)) ([709831f](https://www.github.com/ipfs/js-ipfs/commit/709831f61a822d28a6b8e4d6ddc2b659a836079f)), closes [#3952](https://www.github.com/ipfs/js-ipfs/issues/3952)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-config bumped from ^0.3.0 to ^0.3.1
    * ipfs-core-types bumped from ^0.10.0 to ^0.10.1
    * ipfs-core-utils bumped from ^0.14.0 to ^0.14.1
    * ipfs-http-client bumped from ^56.0.0 to ^56.0.1
  * devDependencies
    * interface-ipfs-core bumped from ^0.154.0 to ^0.154.1

## [0.14.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-core-v0.13.0...ipfs-core-v0.14.0) (2022-01-27)


### ⚠ BREAKING CHANGES

* peerstore methods are now all async, the repo is migrated to v12
* node 15+ is required

### Features

* add support for dag-jose codec ([#4028](https://www.github.com/ipfs/js-ipfs/issues/4028)) ([fbe1492](https://www.github.com/ipfs/js-ipfs/commit/fbe1492395ad98e620a872208530a3f8f61535a9))
* libp2p async peerstore ([#4018](https://www.github.com/ipfs/js-ipfs/issues/4018)) ([a6b201a](https://www.github.com/ipfs/js-ipfs/commit/a6b201af2c3697430ab0ebe002dd573d185f1ac0))


### Bug Fixes

* remove abort-controller deps ([#4015](https://www.github.com/ipfs/js-ipfs/issues/4015)) ([902e887](https://www.github.com/ipfs/js-ipfs/commit/902e887e1acac87f607324fa7cb5ad4b14aefcf3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-config bumped from ^0.2.0 to ^0.3.0
    * ipfs-core-types bumped from ^0.9.0 to ^0.10.0
    * ipfs-core-utils bumped from ^0.13.0 to ^0.14.0
    * ipfs-http-client bumped from ^55.0.0 to ^56.0.0
  * devDependencies
    * interface-ipfs-core bumped from ^0.153.0 to ^0.154.0

## [0.12.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.12.1...ipfs-core@0.12.2) (2021-11-24)

**Note:** Version bump only for package ipfs-core





## [0.12.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.12.0...ipfs-core@0.12.1) (2021-11-19)


### Bug Fixes

* pass hasher loader to bitswap ([#3944](https://github.com/ipfs/js-ipfs/issues/3944)) ([f419553](https://github.com/ipfs/js-ipfs/commit/f419553b9dccc0a1172f399c41b766a754a3ac56))





# [0.12.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.11.1...ipfs-core@0.12.0) (2021-11-12)


### Bug Fixes

* do not accept single items for ipfs.add ([#3900](https://github.com/ipfs/js-ipfs/issues/3900)) ([04e3cf3](https://github.com/ipfs/js-ipfs/commit/04e3cf3f46b585c4644cba70516f375e95361f52))
* do not lose files when writing files into subshards that contain other subshards ([#3936](https://github.com/ipfs/js-ipfs/issues/3936)) ([8a3ed19](https://github.com/ipfs/js-ipfs/commit/8a3ed19575beaafe5dfd3bce310a548950c148d0)), closes [#3921](https://github.com/ipfs/js-ipfs/issues/3921)


### BREAKING CHANGES

* errors will now be thrown if multiple items are passed to `ipfs.add` or single items to `ipfs.addAll` (n.b. you can still pass a list of a single item to `ipfs.addAll`)





## [0.11.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.11.0...ipfs-core@0.11.1) (2021-09-28)

**Note:** Version bump only for package ipfs-core





# [0.11.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.10.8...ipfs-core@0.11.0) (2021-09-24)


### Features

* pull in new globSource ([#3889](https://github.com/ipfs/js-ipfs/issues/3889)) ([be4a542](https://github.com/ipfs/js-ipfs/commit/be4a5428ebc4b05a2edd9a91bf9df6416c1a8c2b))
* switch to esm ([#3879](https://github.com/ipfs/js-ipfs/issues/3879)) ([9a40109](https://github.com/ipfs/js-ipfs/commit/9a40109632e5b4837eb77a2f57dbc77fbf1fe099))


### BREAKING CHANGES

* the globSource api has changed from `globSource(dir, opts)` to `globSource(dir, pattern, opts)`
* There are no default exports and everything is now dual published as ESM/CJS





## [0.10.8](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.10.7...ipfs-core@0.10.8) (2021-09-17)


### Bug Fixes

* use Key.asKey instead of instanceOf ([#3877](https://github.com/ipfs/js-ipfs/issues/3877)) ([e3acf9b](https://github.com/ipfs/js-ipfs/commit/e3acf9b67765c166c53f923a9e00430cdf46935b)), closes [#3852](https://github.com/ipfs/js-ipfs/issues/3852)





## [0.10.7](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.10.6...ipfs-core@0.10.7) (2021-09-17)

**Note:** Version bump only for package ipfs-core





## [0.10.6](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.10.5...ipfs-core@0.10.6) (2021-09-08)

**Note:** Version bump only for package ipfs-core





## [0.10.5](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.10.4...ipfs-core@0.10.5) (2021-09-02)


### Bug Fixes

* declare types in .ts files ([#3840](https://github.com/ipfs/js-ipfs/issues/3840)) ([eba5fe6](https://github.com/ipfs/js-ipfs/commit/eba5fe6832858107b3e1ae02c99de674622f12b4))
* remove client-side timeout from http rpc calls ([#3178](https://github.com/ipfs/js-ipfs/issues/3178)) ([f11220e](https://github.com/ipfs/js-ipfs/commit/f11220e00a12afed5ebbbd8b4c5134595aea735d)), closes [#3161](https://github.com/ipfs/js-ipfs/issues/3161)
* remove use of instanceof for CID class ([#3847](https://github.com/ipfs/js-ipfs/issues/3847)) ([ebbb12d](https://github.com/ipfs/js-ipfs/commit/ebbb12db523c53ce8e4ddae5266cd9acb3504431))





## [0.10.4](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.10.3...ipfs-core@0.10.4) (2021-08-25)

**Note:** Version bump only for package ipfs-core





## [0.10.3](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.10.1...ipfs-core@0.10.3) (2021-08-17)

**Note:** Version bump only for package ipfs-core





## [0.10.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.10.0...ipfs-core@0.10.1) (2021-08-17)


### Bug Fixes

* pass correct types to libp2p dht methods ([#3806](https://github.com/ipfs/js-ipfs/issues/3806)) ([5c8da9a](https://github.com/ipfs/js-ipfs/commit/5c8da9a703b8b043ebc670c6c5dcc7df4f687df7)), closes [#3502](https://github.com/ipfs/js-ipfs/issues/3502)
* pin nanoid version ([#3807](https://github.com/ipfs/js-ipfs/issues/3807)) ([474523a](https://github.com/ipfs/js-ipfs/commit/474523ab8702729f697843d433a7a08baf2d101f))
* use correct datastores ([#3820](https://github.com/ipfs/js-ipfs/issues/3820)) ([479e09e](https://github.com/ipfs/js-ipfs/commit/479e09e73c936c5770aa83e4d097b62c3987cf6f))





# [0.10.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.9.1...ipfs-core@0.10.0) (2021-08-11)


### Bug Fixes

* do not write blocks we already have ([#3801](https://github.com/ipfs/js-ipfs/issues/3801)) ([4f532a5](https://github.com/ipfs/js-ipfs/commit/4f532a541dfd9a1ed73ba8eb68ae86e311caeeb3))
* return rate in/out as number ([#3798](https://github.com/ipfs/js-ipfs/issues/3798)) ([2f3df7a](https://github.com/ipfs/js-ipfs/commit/2f3df7a70fe94d6bdf20947854dc9d0b88cb759a)), closes [#3782](https://github.com/ipfs/js-ipfs/issues/3782)


### Features

* ed25519 keys by default ([#3693](https://github.com/ipfs/js-ipfs/issues/3693)) ([33fa734](https://github.com/ipfs/js-ipfs/commit/33fa7341c3baaf0926d887c071cc6fbce5ac49a8))
* make ipfs.get output tarballs ([#3785](https://github.com/ipfs/js-ipfs/issues/3785)) ([1ad6001](https://github.com/ipfs/js-ipfs/commit/1ad60018d39d5b46c484756631e30e1989fd8eba))


### BREAKING CHANGES

* rateIn/rateOut are returned as numbers
* the output type of `ipfs.get` has changed and the `recursive` option has been removed from `ipfs.ls` since it was not supported everywhere





## [0.9.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.9.0...ipfs-core@0.9.1) (2021-07-30)


### Bug Fixes

* restore default level-js options ([#3779](https://github.com/ipfs/js-ipfs/issues/3779)) ([8380d71](https://github.com/ipfs/js-ipfs/commit/8380d7160e7205bed9cc4aecfc46882bc97d42c3))
* typo in 'multiformats' type defs ([#3778](https://github.com/ipfs/js-ipfs/issues/3778)) ([1bf35f8](https://github.com/ipfs/js-ipfs/commit/1bf35f8a1622dea1e88bfbd701205df4f96998b1))





# [0.9.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.8.0...ipfs-core@0.9.0) (2021-07-27)


### Bug Fixes

* make "ipfs resolve" cli command recursive by default ([#3707](https://github.com/ipfs/js-ipfs/issues/3707)) ([399ce36](https://github.com/ipfs/js-ipfs/commit/399ce367a1dbc531b52fe228ee4212008c9a1091)), closes [#3692](https://github.com/ipfs/js-ipfs/issues/3692)
* root datastore extension ([#3768](https://github.com/ipfs/js-ipfs/issues/3768)) ([62311f8](https://github.com/ipfs/js-ipfs/commit/62311f8ffa90ff5d88a23e2da9fabb0841f1b0f5))
* round bandwidth stats ([#3735](https://github.com/ipfs/js-ipfs/issues/3735)) ([58fb802](https://github.com/ipfs/js-ipfs/commit/58fb802a05f7ea44ef595f118130952176f7190d)), closes [#3726](https://github.com/ipfs/js-ipfs/issues/3726)


### Features

* implement dag import/export ([#3728](https://github.com/ipfs/js-ipfs/issues/3728)) ([700765b](https://github.com/ipfs/js-ipfs/commit/700765be2634fa5d2d71d8b87cf68c9cd328d2c4)), closes [#2953](https://github.com/ipfs/js-ipfs/issues/2953) [#2745](https://github.com/ipfs/js-ipfs/issues/2745)
* upgrade to the new multiformats ([#3556](https://github.com/ipfs/js-ipfs/issues/3556)) ([d13d15f](https://github.com/ipfs/js-ipfs/commit/d13d15f022a87d04a35f0f7822142f9cb898479c))


### BREAKING CHANGES

* resolve is now recursive by default

Co-authored-by: Alex Potsides <alex@achingbrain.net>
* ipld-formats no longer supported, use multiformat BlockCodecs instead

Co-authored-by: Rod Vagg <rod@vagg.org>
Co-authored-by: achingbrain <alex@achingbrain.net>





# [0.8.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.7.1...ipfs-core@0.8.0) (2021-06-18)


### Bug Fixes

* repo auto-migration regression ([#3718](https://github.com/ipfs/js-ipfs/issues/3718)) ([b5470d4](https://github.com/ipfs/js-ipfs/commit/b5470d40ea455069f3f3bd7ab3fb42d7c08926b4)), closes [#3712](https://github.com/ipfs/js-ipfs/issues/3712)


### Features

* support v2 ipns signatures ([#3708](https://github.com/ipfs/js-ipfs/issues/3708)) ([ade01d1](https://github.com/ipfs/js-ipfs/commit/ade01d138bb185fda902c0a3f7fa14d5bfd48a5e))





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.7.0...ipfs-core@0.7.1) (2021-06-05)


### Bug Fixes

* stalling subscription on (node) http-client when daemon is stopped ([#3468](https://github.com/ipfs/js-ipfs/issues/3468)) ([0266abf](https://github.com/ipfs/js-ipfs/commit/0266abf0c4b817636172f78c6e91eb4dd5aad451)), closes [#3465](https://github.com/ipfs/js-ipfs/issues/3465)





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.6.1...ipfs-core@0.7.0) (2021-05-26)


### Bug Fixes

* remove optional chaining from code that will be transpiled ([#3698](https://github.com/ipfs/js-ipfs/issues/3698)) ([96b3909](https://github.com/ipfs/js-ipfs/commit/96b39099efb051b7a76f0afc2ff9429997c73971))


### Features

* allow passing the id of a network peer to ipfs.id ([#3386](https://github.com/ipfs/js-ipfs/issues/3386)) ([00fd709](https://github.com/ipfs/js-ipfs/commit/00fd709a7b71e7cf354ea452ebce460dd7375d34))





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.6.0...ipfs-core@0.6.1) (2021-05-11)


### Bug Fixes

* ipfs get with raw blocks ([#3683](https://github.com/ipfs/js-ipfs/issues/3683)) ([28235b0](https://github.com/ipfs/js-ipfs/commit/28235b02558c513e1119dfd3d12b622d67546eca)), closes [#3682](https://github.com/ipfs/js-ipfs/issues/3682)





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.4...ipfs-core@0.6.0) (2021-05-10)


### Bug Fixes

* do not republish self key twice ([#3634](https://github.com/ipfs/js-ipfs/issues/3634)) ([8545a76](https://github.com/ipfs/js-ipfs/commit/8545a763daa38aefa71cca514016ba400363830a))
* fix types ([#3662](https://github.com/ipfs/js-ipfs/issues/3662)) ([0fe8892](https://github.com/ipfs/js-ipfs/commit/0fe8892361180dab53ed3c3b006479b32a792d44))
* mark ipld options as partial ([#3669](https://github.com/ipfs/js-ipfs/issues/3669)) ([f98af8e](https://github.com/ipfs/js-ipfs/commit/f98af8ed24784929898bb5d33a64dc442c77074d))
* only accept cid for ipfs.dag.get ([#3675](https://github.com/ipfs/js-ipfs/issues/3675)) ([bb8f8bc](https://github.com/ipfs/js-ipfs/commit/bb8f8bc501ffc1ee0f064ba61ec0bca4015bf6ad)), closes [#3637](https://github.com/ipfs/js-ipfs/issues/3637)
* update ipfs repo ([#3671](https://github.com/ipfs/js-ipfs/issues/3671)) ([9029ee5](https://github.com/ipfs/js-ipfs/commit/9029ee591fa74ea65c9600f2d249897e933416fa))
* update types after feedback from ceramic ([#3657](https://github.com/ipfs/js-ipfs/issues/3657)) ([0ddbb1b](https://github.com/ipfs/js-ipfs/commit/0ddbb1b1deb4e40dac3e365d7f98a5f174c2ce8f)), closes [#3640](https://github.com/ipfs/js-ipfs/issues/3640)


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### Features

* support identity hash in block.get + dag.get ([#3616](https://github.com/ipfs/js-ipfs/issues/3616)) ([28ad9ad](https://github.com/ipfs/js-ipfs/commit/28ad9ad6e50abb89a366ecd6b5301e848f0e9962))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.5.4](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.3...ipfs-core@0.5.4) (2021-03-10)

**Note:** Version bump only for package ipfs-core





## [0.5.3](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.2...ipfs-core@0.5.3) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.1...ipfs-core@0.5.2) (2021-02-08)


### Bug Fixes

* ts types after multihashing-async release ([#3529](https://github.com/ipfs/js-ipfs/issues/3529)) ([95b891f](https://github.com/ipfs/js-ipfs/commit/95b891f10e0661f508e8641a1c5d41ea9194c630)), closes [#3527](https://github.com/ipfs/js-ipfs/issues/3527)





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.0...ipfs-core@0.5.1) (2021-02-02)

**Note:** Version bump only for package ipfs-core





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.4.2...ipfs-core@0.5.0) (2021-02-01)


### Bug Fixes

* updates webpack example to use v5 ([#3512](https://github.com/ipfs/js-ipfs/issues/3512)) ([c7110db](https://github.com/ipfs/js-ipfs/commit/c7110db71b5c0f0f9f415f31f91b5b228341e13e)), closes [#3511](https://github.com/ipfs/js-ipfs/issues/3511)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### Features

* enable upnp nat hole punching ([#3426](https://github.com/ipfs/js-ipfs/issues/3426)) ([65dc161](https://github.com/ipfs/js-ipfs/commit/65dc161feebe154b4a2d1472940dc9e70fbb817f))
* support  remote pinning services in ipfs-http-client ([#3293](https://github.com/ipfs/js-ipfs/issues/3293)) ([ba240fd](https://github.com/ipfs/js-ipfs/commit/ba240fdf93edc88028315483240d7822a7ca88ed))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.4.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.4.1...ipfs-core@0.4.2) (2021-01-22)

**Note:** Version bump only for package ipfs-core





## [0.4.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.4.0...ipfs-core@0.4.1) (2021-01-20)

**Note:** Version bump only for package ipfs-core





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.3.1...ipfs-core@0.4.0) (2021-01-15)


### chore

* update libp2p to 0.30 ([#3427](https://github.com/ipfs/js-ipfs/issues/3427)) ([a39e6fb](https://github.com/ipfs/js-ipfs/commit/a39e6fb372bf9e7782462b6a4b7530a3f8c9b3f1))


### Features

* add grpc server and client ([#3403](https://github.com/ipfs/js-ipfs/issues/3403)) ([a9027e0](https://github.com/ipfs/js-ipfs/commit/a9027e0ec0cea9a4f34b4f2f52e09abb35237384)), closes [#2519](https://github.com/ipfs/js-ipfs/issues/2519) [#2838](https://github.com/ipfs/js-ipfs/issues/2838) [#2943](https://github.com/ipfs/js-ipfs/issues/2943) [#2854](https://github.com/ipfs/js-ipfs/issues/2854) [#2864](https://github.com/ipfs/js-ipfs/issues/2864)
* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)


### BREAKING CHANGES

* The websocket transport will only dial DNS+WSS addresses - see https://github.com/libp2p/js-libp2p-websockets/releases/tag/v0.15.0

Co-authored-by: Hugo Dias <hugomrdias@gmail.com>





## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.3.0...ipfs-core@0.3.1) (2020-12-16)


### Bug Fixes

* export IPFS type ([#3447](https://github.com/ipfs/js-ipfs/issues/3447)) ([cacbfc6](https://github.com/ipfs/js-ipfs/commit/cacbfc6e87eabee0e2a6df2056ac5cc993690a0d)), closes [#3439](https://github.com/ipfs/js-ipfs/issues/3439)
* fix ipfs.ls() for a single file object ([#3440](https://github.com/ipfs/js-ipfs/issues/3440)) ([f243dd1](https://github.com/ipfs/js-ipfs/commit/f243dd1c37fcb9786d77d129cd9b238457d18a15))
* regressions introduced by new releases of CID & multicodec ([#3442](https://github.com/ipfs/js-ipfs/issues/3442)) ([b5152d8](https://github.com/ipfs/js-ipfs/commit/b5152d8cc93ecc8d39fc353ea66d7eaf1661e3c0)), closes [/github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26](https://github.com//github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb/issues/diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.2.1...ipfs-core@0.3.0) (2020-11-25)


### Features

* announce addresses via config ([#3409](https://github.com/ipfs/js-ipfs/issues/3409)) ([1529da9](https://github.com/ipfs/js-ipfs/commit/1529da9bb2f31eeb525584e67a3e0548b4445721))





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.2.0...ipfs-core@0.2.1) (2020-11-16)


### Bug Fixes

* ensure correct progress is reported ([#3384](https://github.com/ipfs/js-ipfs/issues/3384)) ([633d870](https://github.com/ipfs/js-ipfs/commit/633d8704f74534542f54536bc6960528214339a2))
* report ipfs.add progress over http ([#3310](https://github.com/ipfs/js-ipfs/issues/3310)) ([39cad4b](https://github.com/ipfs/js-ipfs/commit/39cad4b76b950ea6a76477fd01f8631b8bd9aa1e))





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.1.0...ipfs-core@0.2.0) (2020-11-09)


### Bug Fixes

* cache preloaded CIDs ([#3363](https://github.com/ipfs/js-ipfs/issues/3363)) ([b5ea76a](https://github.com/ipfs/js-ipfs/commit/b5ea76ad29082fb40e9fc72ef6223039f1ea3be4)), closes [#3307](https://github.com/ipfs/js-ipfs/issues/3307)
* typedef resolution & add examples that use types ([#3359](https://github.com/ipfs/js-ipfs/issues/3359)) ([dc2795a](https://github.com/ipfs/js-ipfs/commit/dc2795a4f3b515683d09967ce611bf87d5e67f86)), closes [#3356](https://github.com/ipfs/js-ipfs/issues/3356) [#3358](https://github.com/ipfs/js-ipfs/issues/3358)


### Features

* pass file name to add/addAll progress handler ([#3372](https://github.com/ipfs/js-ipfs/issues/3372)) ([69681a7](https://github.com/ipfs/js-ipfs/commit/69681a7d7a8434c11f6f10e370e324f5a3d31042)), closes [ipfs/js-ipfs-unixfs#87](https://github.com/ipfs/js-ipfs-unixfs/issues/87)
* remove all esoteric ipld formats ([#3360](https://github.com/ipfs/js-ipfs/issues/3360)) ([a542882](https://github.com/ipfs/js-ipfs/commit/a5428820a5b157fbb298b8eb49978e08157beca3)), closes [#3347](https://github.com/ipfs/js-ipfs/issues/3347)


### BREAKING CHANGES

* only dag-pb, dag-cbor and raw formats are supported out of the box, any others will need to be configured during node startup.





# 0.1.0 (2020-10-28)


### Bug Fixes

* files ls should return string ([#3352](https://github.com/ipfs/js-ipfs/issues/3352)) ([16ecc74](https://github.com/ipfs/js-ipfs/commit/16ecc7485dfbb1f0c827c5f804974bb804f3dafd)), closes [#3345](https://github.com/ipfs/js-ipfs/issues/3345) [#2939](https://github.com/ipfs/js-ipfs/issues/2939) [#3330](https://github.com/ipfs/js-ipfs/issues/3330) [#2948](https://github.com/ipfs/js-ipfs/issues/2948)
* remove buffer export from ipfs-core ([#3348](https://github.com/ipfs/js-ipfs/issues/3348)) ([5cc6dfe](https://github.com/ipfs/js-ipfs/commit/5cc6dfebf96ad9509e7ded175291789e32402eec)), closes [#3312](https://github.com/ipfs/js-ipfs/issues/3312)
* use fetch in electron renderer and electron-fetch in main ([#3251](https://github.com/ipfs/js-ipfs/issues/3251)) ([639d71f](https://github.com/ipfs/js-ipfs/commit/639d71f7ac8f66d9633e753a2a6be927e14a5af0))


### Features

* enable custom formats for dag put and get ([#3347](https://github.com/ipfs/js-ipfs/issues/3347)) ([3250ff4](https://github.com/ipfs/js-ipfs/commit/3250ff453a1d3275cc4ab746f59f9f70abd5cc5f))
* remove support for SECIO ([#3295](https://github.com/ipfs/js-ipfs/issues/3295)) ([5f5ef7e](https://github.com/ipfs/js-ipfs/commit/5f5ef7ee6cc6dc634cc6adbede0602492490a85d))
* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))


### BREAKING CHANGES

* types returned by `ipfs.files.ls` are now strings, in line with the docs but different to previous behaviour

Co-authored-by: Geoffrey Cohler <g.cohler@computer.org>
* `Buffer` is no longer exported from core
* this removes support for SECIO making Noise the only security transport.

Closes https://github.com/ipfs/js-ipfs/issues/3210

Co-authored-by: achingbrain <alex@achingbrain.net>
