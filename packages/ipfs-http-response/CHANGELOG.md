# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

### [2.0.2](https://www.github.com/ipfs/js-ipfs/compare/ipfs-http-response-v2.0.1...ipfs-http-response-v2.0.2) (2022-03-01)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * ipfs-core bumped from ^0.14.1 to ^0.14.2

### [2.0.1](https://www.github.com/ipfs/js-ipfs/compare/ipfs-http-response-v2.0.0...ipfs-http-response-v2.0.1) (2022-02-06)


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * ipfs-core bumped from ^0.14.0 to ^0.14.1

## [2.0.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-http-response-v1.0.6...ipfs-http-response-v2.0.0) (2022-01-27)


### ⚠ BREAKING CHANGES

* peerstore methods are now all async, the repo is migrated to v12

### Features

* libp2p async peerstore ([#4018](https://www.github.com/ipfs/js-ipfs/issues/4018)) ([a6b201a](https://www.github.com/ipfs/js-ipfs/commit/a6b201af2c3697430ab0ebe002dd573d185f1ac0))


### Dependencies

* The following workspace dependencies were updated
  * devDependencies
    * ipfs-core bumped from ^0.13.0 to ^0.14.0

## [1.0.6](https://github.com/ipfs/js-ipfs-http-response/compare/ipfs-http-response@1.0.5...ipfs-http-response@1.0.6) (2021-12-15)

**Note:** Version bump only for package ipfs-http-response





## [1.0.5](https://github.com/ipfs/js-ipfs-http-response/compare/ipfs-http-response@1.0.4...ipfs-http-response@1.0.5) (2021-11-24)

**Note:** Version bump only for package ipfs-http-response





## [1.0.4](https://github.com/ipfs/js-ipfs-http-response/compare/ipfs-http-response@1.0.3...ipfs-http-response@1.0.4) (2021-11-19)

**Note:** Version bump only for package ipfs-http-response





## [1.0.3](https://github.com/ipfs/js-ipfs-http-response/compare/ipfs-http-response@1.0.2...ipfs-http-response@1.0.3) (2021-11-12)

**Note:** Version bump only for package ipfs-http-response





## 1.0.2 (2021-09-28)


### Bug Fixes

* add types versions to http-response ([f8cc058](https://github.com/ipfs/js-ipfs-http-response/commit/f8cc058b1d7fa1f116b58ad7a7ebd332c3150714))





## [1.0.1](https://github.com/ipfs/js-ipfs-http-response/compare/v1.0.0...v1.0.1) (2021-09-08)



# [1.0.0](https://github.com/ipfs/js-ipfs-http-response/compare/v0.7.0...v1.0.0) (2021-09-07)


### Bug Fixes

* update module ([#104](https://github.com/ipfs/js-ipfs-http-response/issues/104)) ([319e2b4](https://github.com/ipfs/js-ipfs-http-response/commit/319e2b416bb6283e0f0e67c7dc9f609851e16909))



# [0.7.0](https://github.com/ipfs/js-ipfs-http-response/compare/v0.6.4...v0.7.0) (2021-07-12)


### chore

* update to new multiformats ([#98](https://github.com/ipfs/js-ipfs-http-response/issues/98)) ([1641cef](https://github.com/ipfs/js-ipfs-http-response/commit/1641cefaa2cc965ddd7fdaa2d9be8dd7b0150665))


### BREAKING CHANGES

* pulls in new multiformats modules



## [0.6.4](https://github.com/ipfs/js-ipfs-http-response/compare/v0.6.3...v0.6.4) (2021-04-16)



## [0.6.3](https://github.com/ipfs/js-ipfs-http-response/compare/v0.6.2...v0.6.3) (2021-04-12)



## [0.6.2](https://github.com/ipfs/js-ipfs-http-response/compare/v0.6.1...v0.6.2) (2021-03-17)


### Bug Fixes

* add node dev deps ([#81](https://github.com/ipfs/js-ipfs-http-response/issues/81)) ([9fcc821](https://github.com/ipfs/js-ipfs-http-response/commit/9fcc8215d511e6e9071f0fb9fd927d9005a72670))



## [0.6.1](https://github.com/ipfs/js-ipfs-http-response/compare/v0.6.0...v0.6.1) (2020-12-22)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-ipfs-http-response/compare/v0.5.1...v0.6.0) (2020-08-14)


### Bug Fixes

* replace node buffers with uint8arrays ([#55](https://github.com/ipfs/js-ipfs-http-response/issues/55)) ([710a96d](https://github.com/ipfs/js-ipfs-http-response/commit/710a96d))
* webpack build ([#56](https://github.com/ipfs/js-ipfs-http-response/issues/56)) ([0c61a36](https://github.com/ipfs/js-ipfs-http-response/commit/0c61a36))


### BREAKING CHANGES

* - All deps of this module use Uint8Arrays instead of node Buffers

* chore: remove browser build steps



<a name="0.5.1"></a>
## [0.5.1](https://github.com/ipfs/js-ipfs-http-response/compare/v0.5.0...v0.5.1) (2020-06-30)


### Bug Fixes

* **ci:** add empty commit to fix lint checks on master ([1db03b0](https://github.com/ipfs/js-ipfs-http-response/commit/1db03b0))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-ipfs-http-response/compare/v0.4.0...v0.5.0) (2020-01-07)


### Code Refactoring

* use new IPFS async/await APIs ([#30](https://github.com/ipfs/js-ipfs-http-response/issues/30)) ([68f1204](https://github.com/ipfs/js-ipfs-http-response/commit/68f1204))


### BREAKING CHANGES

* Switch to using async/await and async iterators.



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipfs-http-response/compare/v0.3.1...v0.4.0) (2019-10-14)


### Chores

* convert to async await syntax ([#28](https://github.com/ipfs/js-ipfs-http-response/issues/28)) ([a22900a](https://github.com/ipfs/js-ipfs-http-response/commit/a22900a))


### BREAKING CHANGES

* All places in the API that used callbacks are now replaced with async/await

Co-authored-by: PedroMiguelSS <pedro.santos@moxy.studio>



<a name="0.3.1"></a>
## [0.3.1](https://github.com/ipfs/js-ipfs-http-response/compare/v0.2.2...v0.3.1) (2019-06-06)


### Bug Fixes

* create .npmignore to include dist on npm ([#16](https://github.com/ipfs/js-ipfs-http-response/issues/16)) ([7746dab](https://github.com/ipfs/js-ipfs-http-response/commit/7746dab))


### Chores

* update ipld formats ([#25](https://github.com/ipfs/js-ipfs-http-response/issues/25)) ([529613a](https://github.com/ipfs/js-ipfs-http-response/commit/529613a))


### Features

* load files/dirs from hamt shards ([#19](https://github.com/ipfs/js-ipfs-http-response/issues/19)) ([25edfbc](https://github.com/ipfs/js-ipfs-http-response/commit/25edfbc))


### BREAKING CHANGES

* v1 CIDs created by this module now default to base32 encoding when stringified

Not a direct dependency of this module but ipld-dag-pb changed the
case of some property names that are used by this module.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>



<a name="0.3.0"></a>
## [0.3.0](https://github.com/ipfs/js-ipfs-http-response/compare/v0.2.2...v0.3.0) (2019-05-21)

BREAKING CHANGE: v1 CIDs created by this module now default to base32 encoding when stringified

Not a direct dependency of this module but ipld-dag-pb changed the
case of some property names that are used by this module.

<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipfs/js-ipfs-http-response/compare/v0.2.1...v0.2.2) (2019-01-19)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipfs/js-ipfs-http-response/compare/v0.1.4...v0.2.1) (2018-11-09)


### Bug Fixes

* use .cid property before falling back to .multihash ([#12](https://github.com/ipfs/js-ipfs-http-response/issues/12)) ([1c1a478](https://github.com/ipfs/js-ipfs-http-response/commit/1c1a478))



<a name="0.2.0"></a>
## [0.2.0](https://github.com/ipfs/js-ipfs-http-response/compare/v0.1.4...v0.2.0) (2018-09-28)



<a name="0.1.4"></a>
## [0.1.4](https://github.com/ipfs/js-ipfs-http-response/compare/v0.1.3...v0.1.4) (2018-08-02)


### Bug Fixes

* fix content-type by doing a fall-back using extensions ([#5](https://github.com/ipfs/js-ipfs-http-response/issues/5)) ([19acbae](https://github.com/ipfs/js-ipfs-http-response/commit/19acbae))



<a name="0.1.3"></a>
## [0.1.3](https://github.com/ipfs/js-ipfs-http-response/compare/v0.1.2...v0.1.3) (2018-07-28)


### Bug Fixes

* firefox using readable stream ([#3](https://github.com/ipfs/js-ipfs-http-response/issues/3)) ([0bff82d](https://github.com/ipfs/js-ipfs-http-response/commit/0bff82d))



<a name="0.1.2"></a>
## 0.1.2 (2018-06-01)


### Bug Fixes

* update package name ([91b99b3](https://github.com/ipfs/js-ipfs-http-response/commit/91b99b3))


### Features

* export resolver ([d9e56b8](https://github.com/ipfs/js-ipfs-http-response/commit/d9e56b8))
* initial implementation ([d9d0c08](https://github.com/ipfs/js-ipfs-http-response/commit/d9d0c08))
