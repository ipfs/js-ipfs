# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [0.7.8](https://www.github.com/ipfs/js-ipfs/compare/ipfs-client-v0.7.7...ipfs-client-v0.7.8) (2022-03-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-grpc-client bumped from ^0.9.2 to ^0.9.3
    * ipfs-http-client bumped from ^56.0.1 to ^56.0.2

### [0.7.7](https://www.github.com/ipfs/js-ipfs/compare/ipfs-client-v0.7.6...ipfs-client-v0.7.7) (2022-02-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-grpc-client bumped from ^0.9.1 to ^0.9.2
    * ipfs-http-client bumped from ^56.0.0 to ^56.0.1

### [0.7.6](https://www.github.com/ipfs/js-ipfs/compare/ipfs-client-v0.7.5...ipfs-client-v0.7.6) (2022-01-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-grpc-client bumped from ^0.9.0 to ^0.9.1
    * ipfs-http-client bumped from ^55.0.0 to ^56.0.0

## [0.7.5](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.7.4...ipfs-client@0.7.5) (2021-12-15)

**Note:** Version bump only for package ipfs-client





## [0.7.4](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.7.3...ipfs-client@0.7.4) (2021-11-24)

**Note:** Version bump only for package ipfs-client





## [0.7.3](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.7.2...ipfs-client@0.7.3) (2021-11-19)

**Note:** Version bump only for package ipfs-client





## [0.7.2](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.7.1...ipfs-client@0.7.2) (2021-11-12)

**Note:** Version bump only for package ipfs-client





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.7.0...ipfs-client@0.7.1) (2021-09-28)

**Note:** Version bump only for package ipfs-client





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.6.6...ipfs-client@0.7.0) (2021-09-24)


### Features

* switch to esm ([#3879](https://github.com/ipfs/js-ipfs/issues/3879)) ([9a40109](https://github.com/ipfs/js-ipfs/commit/9a40109632e5b4837eb77a2f57dbc77fbf1fe099))


### BREAKING CHANGES

* There are no default exports and everything is now dual published as ESM/CJS





## [0.6.6](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.6.5...ipfs-client@0.6.6) (2021-09-17)

**Note:** Version bump only for package ipfs-client





## [0.6.5](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.6.4...ipfs-client@0.6.5) (2021-09-17)

**Note:** Version bump only for package ipfs-client





## [0.6.4](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.6.3...ipfs-client@0.6.4) (2021-09-02)


### Bug Fixes

* remove use of instanceof for CID class ([#3847](https://github.com/ipfs/js-ipfs/issues/3847)) ([ebbb12d](https://github.com/ipfs/js-ipfs/commit/ebbb12db523c53ce8e4ddae5266cd9acb3504431))





## [0.6.3](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.6.2...ipfs-client@0.6.3) (2021-08-25)

**Note:** Version bump only for package ipfs-client





## [0.6.2](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.6.1...ipfs-client@0.6.2) (2021-08-17)

**Note:** Version bump only for package ipfs-client





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.6.0...ipfs-client@0.6.1) (2021-08-17)

**Note:** Version bump only for package ipfs-client





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.5.1...ipfs-client@0.6.0) (2021-08-11)


### Features

* make ipfs.get output tarballs ([#3785](https://github.com/ipfs/js-ipfs/issues/3785)) ([1ad6001](https://github.com/ipfs/js-ipfs/commit/1ad60018d39d5b46c484756631e30e1989fd8eba))


### BREAKING CHANGES

* the output type of `ipfs.get` has changed and the `recursive` option has been removed from `ipfs.ls` since it was not supported everywhere





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.5.0...ipfs-client@0.5.1) (2021-07-30)

**Note:** Version bump only for package ipfs-client





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.4.3...ipfs-client@0.5.0) (2021-07-27)


### Features

* upgrade to the new multiformats ([#3556](https://github.com/ipfs/js-ipfs/issues/3556)) ([d13d15f](https://github.com/ipfs/js-ipfs/commit/d13d15f022a87d04a35f0f7822142f9cb898479c))


### BREAKING CHANGES

* ipld-formats no longer supported, use multiformat BlockCodecs instead

Co-authored-by: Rod Vagg <rod@vagg.org>
Co-authored-by: achingbrain <alex@achingbrain.net>





## [0.4.3](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.4.2...ipfs-client@0.4.3) (2021-06-18)

**Note:** Version bump only for package ipfs-client





## [0.4.2](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.4.1...ipfs-client@0.4.2) (2021-06-05)

**Note:** Version bump only for package ipfs-client





## [0.4.1](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.4.0...ipfs-client@0.4.1) (2021-05-26)

**Note:** Version bump only for package ipfs-client





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.3.4...ipfs-client@0.4.0) (2021-05-10)


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.3.4](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.3.3...ipfs-client@0.3.4) (2021-03-10)

**Note:** Version bump only for package ipfs-client





## [0.3.3](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.3.2...ipfs-client@0.3.3) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.3.2](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.3.1...ipfs-client@0.3.2) (2021-02-08)

**Note:** Version bump only for package ipfs-client





## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.3.0...ipfs-client@0.3.1) (2021-02-02)

**Note:** Version bump only for package ipfs-client





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.2.2...ipfs-client@0.3.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.2.2](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.2.1...ipfs-client@0.2.2) (2021-01-22)


### Bug Fixes

* issue with isolateModules flag ([#3495](https://github.com/ipfs/js-ipfs/issues/3495)) ([839e190](https://github.com/ipfs/js-ipfs/commit/839e1908f3c050b45af176883a7e450fb339bef0)), closes [#3494](https://github.com/ipfs/js-ipfs/issues/3494) [#3498](https://github.com/ipfs/js-ipfs/issues/3498) [/github.com/ipfs-shipyard/ipfs-webui/pull/1655#issuecomment-763846124](https://github.com//github.com/ipfs-shipyard/ipfs-webui/pull/1655/issues/issuecomment-763846124)





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-client@0.2.0...ipfs-client@0.2.1) (2021-01-20)

**Note:** Version bump only for package ipfs-client





# 0.2.0 (2021-01-15)


### Features

* add grpc server and client ([#3403](https://github.com/ipfs/js-ipfs/issues/3403)) ([a9027e0](https://github.com/ipfs/js-ipfs/commit/a9027e0ec0cea9a4f34b4f2f52e09abb35237384)), closes [#2519](https://github.com/ipfs/js-ipfs/issues/2519) [#2838](https://github.com/ipfs/js-ipfs/issues/2838) [#2943](https://github.com/ipfs/js-ipfs/issues/2943) [#2854](https://github.com/ipfs/js-ipfs/issues/2854) [#2864](https://github.com/ipfs/js-ipfs/issues/2864)
* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)
