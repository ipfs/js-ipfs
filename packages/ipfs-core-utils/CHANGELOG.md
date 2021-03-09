# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.7.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.7.1...ipfs-core-utils@0.7.2) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.7.0...ipfs-core-utils@0.7.1) (2021-02-08)

**Note:** Version bump only for package ipfs-core-utils





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.6.1...ipfs-core-utils@0.7.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.6.0...ipfs-core-utils@0.6.1) (2021-01-22)

**Note:** Version bump only for package ipfs-core-utils





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.5.4...ipfs-core-utils@0.6.0) (2021-01-15)


### Features

* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)





## [0.5.4](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.5.3...ipfs-core-utils@0.5.4) (2020-12-16)


### Bug Fixes

* regressions introduced by new releases of CID & multicodec ([#3442](https://github.com/ipfs/js-ipfs/issues/3442)) ([b5152d8](https://github.com/ipfs/js-ipfs/commit/b5152d8cc93ecc8d39fc353ea66d7eaf1661e3c0)), closes [/github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26](https://github.com//github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb/issues/diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)
* types for withTimeoutOptions ([#3422](https://github.com/ipfs/js-ipfs/issues/3422)) ([af0b7f3](https://github.com/ipfs/js-ipfs/commit/af0b7f34587bd432860a31d40eabc6aa70aef619)), closes [/github.com/ipfs/js-ipfs/pull/3407/files#diff-722621abc3ed4edc6ab202fdf684f1607c261394b95da6b3ec79748711056f20](https://github.com//github.com/ipfs/js-ipfs/pull/3407/files/issues/diff-722621abc3ed4edc6ab202fdf684f1607c261394b95da6b3ec79748711056f20)





## [0.5.3](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.5.2...ipfs-core-utils@0.5.3) (2020-11-25)

**Note:** Version bump only for package ipfs-core-utils





## [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.5.1...ipfs-core-utils@0.5.2) (2020-11-16)


### Bug Fixes

* report ipfs.add progress over http ([#3310](https://github.com/ipfs/js-ipfs/issues/3310)) ([39cad4b](https://github.com/ipfs/js-ipfs/commit/39cad4b76b950ea6a76477fd01f8631b8bd9aa1e))





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.5.0...ipfs-core-utils@0.5.1) (2020-11-09)


### Bug Fixes

* typedef resolution & add examples that use types ([#3359](https://github.com/ipfs/js-ipfs/issues/3359)) ([dc2795a](https://github.com/ipfs/js-ipfs/commit/dc2795a4f3b515683d09967ce611bf87d5e67f86)), closes [#3356](https://github.com/ipfs/js-ipfs/issues/3356) [#3358](https://github.com/ipfs/js-ipfs/issues/3358)





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.4.0...ipfs-core-utils@0.5.0) (2020-10-28)


### Bug Fixes

* use fetch in electron renderer and electron-fetch in main ([#3251](https://github.com/ipfs/js-ipfs/issues/3251)) ([639d71f](https://github.com/ipfs/js-ipfs/commit/639d71f7ac8f66d9633e753a2a6be927e14a5af0))


### Features

* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.3.2...ipfs-core-utils@0.4.0) (2020-09-03)


### Features

* store pins in datastore instead of a DAG ([#2771](https://github.com/ipfs/js-ipfs/issues/2771)) ([64b7fe4](https://github.com/ipfs/js-ipfs/commit/64b7fe41738cbe96d5a9075f0c01156c6f889c40))





## [0.3.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.3.1...ipfs-core-utils@0.3.2) (2020-08-24)


### Bug Fixes

* validate ipns records with inline public keys ([#3224](https://github.com/ipfs/js-ipfs/issues/3224)) ([5cc0e08](https://github.com/ipfs/js-ipfs/commit/5cc0e086b036e7ba40b09768b67b7067adca43c1))





## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.3.0...ipfs-core-utils@0.3.1) (2020-08-12)


### Bug Fixes

* send blobs when running ipfs-http-client in the browser ([#3184](https://github.com/ipfs/js-ipfs/issues/3184)) ([6b24463](https://github.com/ipfs/js-ipfs/commit/6b24463431497bd13b579a730ad7063345729ad9)), closes [#3138](https://github.com/ipfs/js-ipfs/issues/3138)





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.2.4...ipfs-core-utils@0.3.0) (2020-07-16)


### Bug Fixes

* optional arguments go in the options object ([#3118](https://github.com/ipfs/js-ipfs/issues/3118)) ([8cb8c73](https://github.com/ipfs/js-ipfs/commit/8cb8c73037e44894d756b70f344b3282463206f9))
* set error code correctly ([#3150](https://github.com/ipfs/js-ipfs/issues/3150)) ([335c13d](https://github.com/ipfs/js-ipfs/commit/335c13d529fc54e4610fc1aa03212126f43c63ec))


### Features

* store blocks by multihash instead of CID ([#3124](https://github.com/ipfs/js-ipfs/issues/3124)) ([03b17f5](https://github.com/ipfs/js-ipfs/commit/03b17f5e2d290e84aa0cb541079b79e468e7d1bd))





## [0.2.4](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.2.3...ipfs-core-utils@0.2.4) (2020-06-24)

**Note:** Version bump only for package ipfs-core-utils





## [0.2.3](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.2.2...ipfs-core-utils@0.2.3) (2020-05-18)


### Bug Fixes

* remove node globals ([#2932](https://github.com/ipfs/js-ipfs/issues/2932)) ([d0d2f74](https://github.com/ipfs/js-ipfs/commit/d0d2f74cef4e439c6d2baadba1f1f9f52534fcba))


### Features

* cancellable api calls ([#2993](https://github.com/ipfs/js-ipfs/issues/2993)) ([2b24f59](https://github.com/ipfs/js-ipfs/commit/2b24f590041a0df9da87b75ae2344232fe22fe3a)), closes [#3015](https://github.com/ipfs/js-ipfs/issues/3015)





## [0.2.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.2.1...ipfs-core-utils@0.2.2) (2020-05-05)

**Note:** Version bump only for package ipfs-core-utils





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.2.0...ipfs-core-utils@0.2.1) (2020-05-05)


### Bug Fixes

* pass headers to request ([#3018](https://github.com/ipfs/js-ipfs/issues/3018)) ([3ba00f8](https://github.com/ipfs/js-ipfs/commit/3ba00f8c6a8a057c5776d539a671a74d9565fb29)), closes [#3017](https://github.com/ipfs/js-ipfs/issues/3017)





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.1.1...ipfs-core-utils@0.2.0) (2020-04-16)


### Bug Fixes

* make http api only accept POST requests ([#2977](https://github.com/ipfs/js-ipfs/issues/2977)) ([943d4a8](https://github.com/ipfs/js-ipfs/commit/943d4a8cf2d4c4ff5ecd4814c59cb0aae0cfa1fd))


### BREAKING CHANGES

* Where we used to accept all and any HTTP methods, now only POST is
accepted.  The API client will now only send POST requests too.

* test: add tests to make sure we are post-only

* chore: upgrade ipfs-utils

* fix: return 405 instead of 404 for bad methods

* fix: reject browsers that do not send an origin

Also fixes running interface tests over http in browsers against
js-ipfs





## [0.1.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core-utils@0.0.1...ipfs-core-utils@0.1.1) (2020-04-08)

**Note:** Version bump only for package ipfs-core-utils





## 0.0.1 (2020-03-31)

**Note:** Version bump only for package ipfs-core-utils





<a name="0.7.2"></a>
## [0.7.2](https://github.com/ipfs/js-ipfs-utils/compare/v0.7.1...v0.7.2) (2020-02-10)


### Bug Fixes

* number is not a valid mtime value ([#24](https://github.com/ipfs/js-ipfs-utils/issues/24)) ([bb2d841](https://github.com/ipfs/js-ipfs-utils/commit/bb2d841)), closes [/github.com/ipfs/js-ipfs-unixfs/blob/master/src/index.js#L104-L106](https://github.com//github.com/ipfs/js-ipfs-unixfs/blob/master/src/index.js/issues/L104-L106)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ipfs/js-ipfs-utils/compare/v0.7.0...v0.7.1) (2020-01-23)


### Bug Fixes

* downgrade to ky 15 ([#22](https://github.com/ipfs/js-ipfs-utils/issues/22)) ([5dd7570](https://github.com/ipfs/js-ipfs-utils/commit/5dd7570))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.6.0...v0.7.0) (2020-01-23)


### Features

* accept browser readable streams as input ([#21](https://github.com/ipfs/js-ipfs-utils/issues/21)) ([0902067](https://github.com/ipfs/js-ipfs-utils/commit/0902067))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.5.0...v0.6.0) (2020-01-09)


### Bug Fixes

* dependency badge URL ([#16](https://github.com/ipfs/js-ipfs-utils/issues/16)) ([5d93881](https://github.com/ipfs/js-ipfs-utils/commit/5d93881))
* format mtime as timespec ([#20](https://github.com/ipfs/js-ipfs-utils/issues/20)) ([a68f8b1](https://github.com/ipfs/js-ipfs-utils/commit/a68f8b1))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.4.0...v0.5.0) (2019-12-06)


### Features

* convert to async iterators ([#15](https://github.com/ipfs/js-ipfs-utils/issues/15)) ([251eff0](https://github.com/ipfs/js-ipfs-utils/commit/251eff0))
* support unixfs metadata and formatting it ([#14](https://github.com/ipfs/js-ipfs-utils/issues/14)) ([173e4bf](https://github.com/ipfs/js-ipfs-utils/commit/173e4bf))


### BREAKING CHANGES

* In order to support metadata on intermediate directories, globSource in this module will now emit directories and files where previously it only emitted files.
* Support for Node.js streams and Pull Streams has been removed



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.3.0...v0.4.0) (2019-09-19)


### Features

* add isElectronMain env test ([#13](https://github.com/ipfs/js-ipfs-utils/issues/13)) ([9072c90](https://github.com/ipfs/js-ipfs-utils/commit/9072c90))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.2.0...v0.3.0) (2019-09-15)


### Features

* support old school streams ([#12](https://github.com/ipfs/js-ipfs-utils/issues/12)) ([18cfa86](https://github.com/ipfs/js-ipfs-utils/commit/18cfa86))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.1.0...v0.2.0) (2019-09-06)


### Features

* env/isTest ([#10](https://github.com/ipfs/js-ipfs-utils/issues/10)) ([481aab1](https://github.com/ipfs/js-ipfs-utils/commit/481aab1))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.0.4...v0.1.0) (2019-09-04)


### Bug Fixes

* write after end ([#7](https://github.com/ipfs/js-ipfs-utils/issues/7)) ([b30d7a3](https://github.com/ipfs/js-ipfs-utils/commit/b30d7a3))


### Features

* add glob-source from js-ipfs to be shared ([#9](https://github.com/ipfs/js-ipfs-utils/issues/9)) ([0a95ef8](https://github.com/ipfs/js-ipfs-utils/commit/0a95ef8))
* add normalise input function ([#5](https://github.com/ipfs/js-ipfs-utils/issues/5)) ([b22b8de](https://github.com/ipfs/js-ipfs-utils/commit/b22b8de)), closes [#8](https://github.com/ipfs/js-ipfs-utils/issues/8)



<a name="0.0.4"></a>
## [0.0.4](https://github.com/ipfs/js-ipfs-utils/compare/v0.0.3...v0.0.4) (2019-07-18)


### Features

* add globalThis polyfill ([f0c7c42](https://github.com/ipfs/js-ipfs-utils/commit/f0c7c42))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/ipfs/js-ipfs-utils/compare/v0.0.2...v0.0.3) (2019-05-16)



<a name="0.0.2"></a>
## 0.0.2 (2019-05-16)


### Bug Fixes

* use is-buffer ([bbf5baf](https://github.com/ipfs/js-ipfs-utils/commit/bbf5baf))
