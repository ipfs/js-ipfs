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



