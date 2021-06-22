# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.6.4](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.6.3...ipfs-message-port-client@0.6.4) (2021-06-18)

**Note:** Version bump only for package ipfs-message-port-client





## [0.6.3](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.6.2...ipfs-message-port-client@0.6.3) (2021-06-05)

**Note:** Version bump only for package ipfs-message-port-client





## [0.6.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.6.1...ipfs-message-port-client@0.6.2) (2021-05-26)

**Note:** Version bump only for package ipfs-message-port-client





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.6.0...ipfs-message-port-client@0.6.1) (2021-05-11)

**Note:** Version bump only for package ipfs-message-port-client





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.5.4...ipfs-message-port-client@0.6.0) (2021-05-10)


### chore

* update node version in docker build ([#3603](https://github.com/ipfs/js-ipfs/issues/3603)) ([087fd1e](https://github.com/ipfs/js-ipfs/commit/087fd1eb402d1b933730e09c1d0cfb21067e9992))
* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* Minimum supported node version is 14
* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.5.4](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.5.3...ipfs-message-port-client@0.5.4) (2021-03-10)

**Note:** Version bump only for package ipfs-message-port-client





## [0.5.3](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.5.2...ipfs-message-port-client@0.5.3) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.5.1...ipfs-message-port-client@0.5.2) (2021-02-08)

**Note:** Version bump only for package ipfs-message-port-client





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.5.0...ipfs-message-port-client@0.5.1) (2021-02-02)

**Note:** Version bump only for package ipfs-message-port-client





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.4.6...ipfs-message-port-client@0.5.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.4.6](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.4.5...ipfs-message-port-client@0.4.6) (2021-01-22)

**Note:** Version bump only for package ipfs-message-port-client





## [0.4.5](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.4.4...ipfs-message-port-client@0.4.5) (2021-01-20)

**Note:** Version bump only for package ipfs-message-port-client





## [0.4.4](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.4.3...ipfs-message-port-client@0.4.4) (2021-01-15)

**Note:** Version bump only for package ipfs-message-port-client





## [0.4.3](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.4.2...ipfs-message-port-client@0.4.3) (2020-12-16)


### Bug Fixes

* transfer unique set over message prort ([#3421](https://github.com/ipfs/js-ipfs/issues/3421)) ([da7bc55](https://github.com/ipfs/js-ipfs/commit/da7bc55e8dfbdc200ef43ccbf774bbc24af07785))





## [0.4.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.4.1...ipfs-message-port-client@0.4.2) (2020-11-25)

**Note:** Version bump only for package ipfs-message-port-client





## [0.4.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.4.0...ipfs-message-port-client@0.4.1) (2020-11-16)


### Bug Fixes

* make message-port-protocol non dev dependency ([#3393](https://github.com/ipfs/js-ipfs/issues/3393)) ([cea7317](https://github.com/ipfs/js-ipfs/commit/cea7317569ed899c6a4476c17f54795e49b6db4d))





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.3.0...ipfs-message-port-client@0.4.0) (2020-11-09)


### Bug Fixes

* typedef resolution & add examples that use types ([#3359](https://github.com/ipfs/js-ipfs/issues/3359)) ([dc2795a](https://github.com/ipfs/js-ipfs/commit/dc2795a4f3b515683d09967ce611bf87d5e67f86)), closes [#3356](https://github.com/ipfs/js-ipfs/issues/3356) [#3358](https://github.com/ipfs/js-ipfs/issues/3358)


### Features

* pass file name to add/addAll progress handler ([#3372](https://github.com/ipfs/js-ipfs/issues/3372)) ([69681a7](https://github.com/ipfs/js-ipfs/commit/69681a7d7a8434c11f6f10e370e324f5a3d31042)), closes [ipfs/js-ipfs-unixfs#87](https://github.com/ipfs/js-ipfs-unixfs/issues/87)





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.2.2...ipfs-message-port-client@0.3.0) (2020-10-28)


### Features

* implement message-port ipfs.ls ([#3322](https://github.com/ipfs/js-ipfs/issues/3322)) ([4b8021d](https://github.com/ipfs/js-ipfs/commit/4b8021d389ac01f191d4fe87beead10088e53297))
* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))





## [0.2.2](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.2.1...ipfs-message-port-client@0.2.2) (2020-09-09)

**Note:** Version bump only for package ipfs-message-port-client





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.2.0...ipfs-message-port-client@0.2.1) (2020-09-04)

**Note:** Version bump only for package ipfs-message-port-client





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.1.1...ipfs-message-port-client@0.2.0) (2020-09-03)


### Features

* store pins in datastore instead of a DAG ([#2771](https://github.com/ipfs/js-ipfs/issues/2771)) ([64b7fe4](https://github.com/ipfs/js-ipfs/commit/64b7fe41738cbe96d5a9075f0c01156c6f889c40))





## [0.1.1](https://github.com/ipfs/js-ipfs/compare/ipfs-message-port-client@0.1.0...ipfs-message-port-client@0.1.1) (2020-08-24)

**Note:** Version bump only for package ipfs-message-port-client





# 0.1.0 (2020-08-12)


### Features

* share IPFS node between browser tabs ([#3081](https://github.com/ipfs/js-ipfs/issues/3081)) ([1b8b1b8](https://github.com/ipfs/js-ipfs/commit/1b8b1b822a252498889c54972a1f57e1fedc39d0)), closes [#3022](https://github.com/ipfs/js-ipfs/issues/3022)
