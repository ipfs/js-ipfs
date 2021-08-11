# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
