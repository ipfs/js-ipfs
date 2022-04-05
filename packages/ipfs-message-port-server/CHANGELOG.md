# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [0.11.2](https://www.github.com/ipfs/js-ipfs/compare/ipfs-message-port-server-v0.11.1...ipfs-message-port-server-v0.11.2) (2022-03-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-types bumped from ^0.10.1 to ^0.10.2
    * ipfs-message-port-protocol bumped from ^0.11.1 to ^0.11.2

### [0.11.1](https://www.github.com/ipfs/js-ipfs/compare/ipfs-message-port-server-v0.11.0...ipfs-message-port-server-v0.11.1) (2022-02-06)


### Bug Fixes

* **dag:** replace custom dag walk with multiformats/traversal ([#3950](https://www.github.com/ipfs/js-ipfs/issues/3950)) ([596b1f4](https://www.github.com/ipfs/js-ipfs/commit/596b1f48a014083b1736e4ad7e746c652d2583b1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-types bumped from ^0.10.0 to ^0.10.1
    * ipfs-message-port-protocol bumped from ^0.11.0 to ^0.11.1

## [0.11.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-message-port-server-v0.10.5...ipfs-message-port-server-v0.11.0) (2022-01-27)


### ⚠ BREAKING CHANGES

* peerstore methods are now all async, the repo is migrated to v12

### Features

* libp2p async peerstore ([#4018](https://www.github.com/ipfs/js-ipfs/issues/4018)) ([a6b201a](https://www.github.com/ipfs/js-ipfs/commit/a6b201af2c3697430ab0ebe002dd573d185f1ac0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core-types bumped from ^0.9.0 to ^0.10.0
    * ipfs-message-port-protocol bumped from ^0.10.5 to ^0.11.0

## [0.10.5](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.10.4...ipfs-message-port-server@0.10.5) (2021-12-15)

**Note:** Version bump only for package ipfs-message-port-server





## [0.10.4](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.10.3...ipfs-message-port-server@0.10.4) (2021-11-24)

**Note:** Version bump only for package ipfs-message-port-server





## [0.10.3](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.10.2...ipfs-message-port-server@0.10.3) (2021-11-19)

**Note:** Version bump only for package ipfs-message-port-server





## [0.10.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.10.1...ipfs-message-port-server@0.10.2) (2021-11-12)


### Bug Fixes

* transfer set ([#3573](https://github.com/ipfs/js-ipfs/issues/3573)) ([b09a18c](https://github.com/ipfs/js-ipfs/commit/b09a18cd98883662353d116a8ff25a3ddaa48fc2))





## [0.10.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.10.0...ipfs-message-port-server@0.10.1) (2021-09-28)

**Note:** Version bump only for package ipfs-message-port-server





# [0.10.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.9.4...ipfs-message-port-server@0.10.0) (2021-09-24)


### Features

* switch to esm ([#3879](https://github.com/ipfs/js-ipfs/issues/3879)) ([9a40109](https://github.com/ipfs/js-ipfs/commit/9a40109632e5b4837eb77a2f57dbc77fbf1fe099))


### BREAKING CHANGES

* There are no default exports and everything is now dual published as ESM/CJS





## [0.9.4](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.9.3...ipfs-message-port-server@0.9.4) (2021-09-17)

**Note:** Version bump only for package ipfs-message-port-server





## [0.9.3](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.9.2...ipfs-message-port-server@0.9.3) (2021-09-17)

**Note:** Version bump only for package ipfs-message-port-server





## [0.9.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.9.1...ipfs-message-port-server@0.9.2) (2021-09-02)


### Bug Fixes

* remove use of instanceof for CID class ([#3847](https://github.com/ipfs/js-ipfs/issues/3847)) ([ebbb12d](https://github.com/ipfs/js-ipfs/commit/ebbb12db523c53ce8e4ddae5266cd9acb3504431))





## [0.9.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.9.0...ipfs-message-port-server@0.9.1) (2021-08-25)

**Note:** Version bump only for package ipfs-message-port-server





# [0.9.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.8.1...ipfs-message-port-server@0.9.0) (2021-08-11)


### Features

* make ipfs.get output tarballs ([#3785](https://github.com/ipfs/js-ipfs/issues/3785)) ([1ad6001](https://github.com/ipfs/js-ipfs/commit/1ad60018d39d5b46c484756631e30e1989fd8eba))


### BREAKING CHANGES

* the output type of `ipfs.get` has changed and the `recursive` option has been removed from `ipfs.ls` since it was not supported everywhere





## [0.8.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.8.0...ipfs-message-port-server@0.8.1) (2021-07-30)

**Note:** Version bump only for package ipfs-message-port-server





# [0.8.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.7.3...ipfs-message-port-server@0.8.0) (2021-07-27)


### Features

* upgrade to the new multiformats ([#3556](https://github.com/ipfs/js-ipfs/issues/3556)) ([d13d15f](https://github.com/ipfs/js-ipfs/commit/d13d15f022a87d04a35f0f7822142f9cb898479c))


### BREAKING CHANGES

* ipld-formats no longer supported, use multiformat BlockCodecs instead

Co-authored-by: Rod Vagg <rod@vagg.org>
Co-authored-by: achingbrain <alex@achingbrain.net>





## [0.7.3](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.7.2...ipfs-message-port-server@0.7.3) (2021-06-18)

**Note:** Version bump only for package ipfs-message-port-server





## [0.7.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.7.1...ipfs-message-port-server@0.7.2) (2021-06-05)

**Note:** Version bump only for package ipfs-message-port-server





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.7.0...ipfs-message-port-server@0.7.1) (2021-05-26)

**Note:** Version bump only for package ipfs-message-port-server





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.6.3...ipfs-message-port-server@0.7.0) (2021-05-10)


### chore

* update node version in docker build ([#3603](https://github.com/ipfs/js-ipfs/issues/3603)) ([087fd1e](https://github.com/ipfs/js-ipfs/commit/087fd1eb402d1b933730e09c1d0cfb21067e9992))
* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* Minimum supported node version is 14
* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.6.3](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.6.2...ipfs-message-port-server@0.6.3) (2021-03-10)

**Note:** Version bump only for package ipfs-message-port-server





## [0.6.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.6.1...ipfs-message-port-server@0.6.2) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.6.0...ipfs-message-port-server@0.6.1) (2021-02-02)

**Note:** Version bump only for package ipfs-message-port-server





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.5.0...ipfs-message-port-server@0.6.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.4.3...ipfs-message-port-server@0.5.0) (2021-01-15)


### Features

* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)





## [0.4.3](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.4.2...ipfs-message-port-server@0.4.3) (2020-12-16)


### Bug Fixes

* regressions introduced by new releases of CID & multicodec ([#3442](https://github.com/ipfs/js-ipfs/issues/3442)) ([b5152d8](https://github.com/ipfs/js-ipfs/commit/b5152d8cc93ecc8d39fc353ea66d7eaf1661e3c0)), closes [/github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26](https://github.com//github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb/issues/diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)
* transfer unique set over message prort ([#3421](https://github.com/ipfs/js-ipfs/issues/3421)) ([da7bc55](https://github.com/ipfs/js-ipfs/commit/da7bc55e8dfbdc200ef43ccbf774bbc24af07785))





## [0.4.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.4.1...ipfs-message-port-server@0.4.2) (2020-11-25)

**Note:** Version bump only for package ipfs-message-port-server





## [0.4.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.4.0...ipfs-message-port-server@0.4.1) (2020-11-16)


### Bug Fixes

* make message-port-protocol non dev dependency ([#3393](https://github.com/ipfs/js-ipfs/issues/3393)) ([cea7317](https://github.com/ipfs/js-ipfs/commit/cea7317569ed899c6a4476c17f54795e49b6db4d))





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.3.0...ipfs-message-port-server@0.4.0) (2020-11-09)


### Bug Fixes

* typedef resolution & add examples that use types ([#3359](https://github.com/ipfs/js-ipfs/issues/3359)) ([dc2795a](https://github.com/ipfs/js-ipfs/commit/dc2795a4f3b515683d09967ce611bf87d5e67f86)), closes [#3356](https://github.com/ipfs/js-ipfs/issues/3356) [#3358](https://github.com/ipfs/js-ipfs/issues/3358)


### Features

* pass file name to add/addAll progress handler ([#3372](https://github.com/ipfs/js-ipfs/issues/3372)) ([69681a7](https://github.com/ipfs/js-ipfs/commit/69681a7d7a8434c11f6f10e370e324f5a3d31042)), closes [ipfs/js-ipfs-unixfs#87](https://github.com/ipfs/js-ipfs-unixfs/issues/87)





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.2.2...ipfs-message-port-server@0.3.0) (2020-10-28)


### Features

* implement message-port ipfs.ls ([#3322](https://github.com/ipfs/js-ipfs/issues/3322)) ([4b8021d](https://github.com/ipfs/js-ipfs/commit/4b8021d389ac01f191d4fe87beead10088e53297))
* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))





## [0.2.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.2.1...ipfs-message-port-server@0.2.2) (2020-09-09)

**Note:** Version bump only for package ipfs-message-port-server





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.2.0...ipfs-message-port-server@0.2.1) (2020-09-04)

**Note:** Version bump only for package ipfs-message-port-server





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.1.1...ipfs-message-port-server@0.2.0) (2020-09-03)


### Features

* store pins in datastore instead of a DAG ([#2771](https://github.com/ipfs/js-ipfs/issues/2771)) ([64b7fe4](https://github.com/ipfs/js-ipfs/commit/64b7fe41738cbe96d5a9075f0c01156c6f889c40))





## [0.1.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-server@0.1.0...ipfs-message-port-server@0.1.1) (2020-08-24)

**Note:** Version bump only for package ipfs-message-port-server





# 0.1.0 (2020-08-12)


### Features

* share IPFS node between browser tabs ([#3081](https://github.com/ipfs/js-ipfs/issues/3081)) ([1b8b1b8](https://github.com/ipfs/js-ipfs/commit/1b8b1b822a252498889c54972a1f57e1fedc39d0)), closes [#3022](https://github.com/ipfs/js-ipfs/issues/3022)
