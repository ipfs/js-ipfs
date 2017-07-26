<a name="0.30.1"></a>
## [0.30.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.30.0...v0.30.1) (2017-07-26)


### Bug Fixes

* remove use of readable-stream in Node.js ([d37a866](https://github.com/ipfs/interface-ipfs-core/commit/d37a866))



<a name="0.30.0"></a>
# [0.30.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.29.1...v0.30.0) (2017-07-23)



<a name="0.29.1"></a>
## [0.29.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.29.0...v0.29.1) (2017-06-21)



<a name="0.29.0"></a>
# [0.29.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.28.0...v0.29.0) (2017-05-29)


### Features

* add support for paths on get and cat ([4cae543](https://github.com/ipfs/interface-ipfs-core/commit/4cae543))



<a name="0.28.0"></a>
# [0.28.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.27.2...v0.28.0) (2017-05-29)


### Features

* add options to block.put API, now it works with specified mhtype, format and version, just like the CLI ([d62c6e2](https://github.com/ipfs/interface-ipfs-core/commit/d62c6e2))



<a name="0.27.2"></a>
## [0.27.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.27.1...v0.27.2) (2017-05-12)



<a name="0.27.1"></a>
## [0.27.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.27.0...v0.27.1) (2017-04-16)



<a name="0.27.0"></a>
# [0.27.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.26.2...v0.27.0) (2017-04-14)


### Bug Fixes

* linting, unused vars ([802612d](https://github.com/ipfs/interface-ipfs-core/commit/802612d))



<a name="0.26.2"></a>
## [0.26.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.26.1...v0.26.2) (2017-03-30)


### Features

* make tests go-ipfs friendly ([06261f1](https://github.com/ipfs/interface-ipfs-core/commit/06261f1))



<a name="0.26.1"></a>
## [0.26.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.26.0...v0.26.1) (2017-03-24)


### Bug Fixes

* ending the test only when we are sure we got the root dir out ([de10796](https://github.com/ipfs/interface-ipfs-core/commit/de10796))



<a name="0.26.0"></a>
# [0.26.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.25.1...v0.26.0) (2017-03-22)


### Bug Fixes

* make aegir happy-n ([d5b1c30](https://github.com/ipfs/interface-ipfs-core/commit/d5b1c30))



<a name="0.25.1"></a>
## [0.25.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.25.0...v0.25.1) (2017-03-20)



<a name="0.25.0"></a>
# [0.25.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.24.1...v0.25.0) (2017-03-13)


### Bug Fixes

* missing commit ([b0a87bd](https://github.com/ipfs/interface-ipfs-core/commit/b0a87bd))



<a name="0.24.1"></a>
## [0.24.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.24.0...v0.24.1) (2017-02-09)


### Features

* the dag resolve and dag get ([53ad3cf](https://github.com/ipfs/interface-ipfs-core/commit/53ad3cf))



<a name="0.24.0"></a>
# [0.24.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.8...v0.24.0) (2017-02-02)


### Features

* dag.resolve API ([1959e34](https://github.com/ipfs/interface-ipfs-core/commit/1959e34))



<a name="0.23.8"></a>
## [0.23.8](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.7...v0.23.8) (2017-02-01)


### Bug Fixes

* remove .only from dag ([66e93cd](https://github.com/ipfs/interface-ipfs-core/commit/66e93cd))



<a name="0.23.7"></a>
## [0.23.7](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.6...v0.23.7) (2017-02-01)


### Features

* dag API basics (get, put, rm) ([dd3396b](https://github.com/ipfs/interface-ipfs-core/commit/dd3396b))
* dag-api (WIP) ([44af576](https://github.com/ipfs/interface-ipfs-core/commit/44af576))
* dag-api (WIP) ([64a25b9](https://github.com/ipfs/interface-ipfs-core/commit/64a25b9))
* remove rm from dag api ([0a5d629](https://github.com/ipfs/interface-ipfs-core/commit/0a5d629))



<a name="0.23.6"></a>
## [0.23.6](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.5...v0.23.6) (2017-02-01)


### Features

* update block spec to support CID ([35e2353](https://github.com/ipfs/interface-ipfs-core/commit/35e2353))



<a name="0.23.5"></a>
## [0.23.5](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.4...v0.23.5) (2017-01-17)



<a name="0.23.4"></a>
## [0.23.4](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.3...v0.23.4) (2017-01-17)


### Bug Fixes

* **config:** make promise tests actually test the full promise chain ([416560e](https://github.com/ipfs/interface-ipfs-core/commit/416560e))



<a name="0.23.3"></a>
## [0.23.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.2...v0.23.3) (2017-01-16)


### Bug Fixes

* **test:** send/receive 10k messages test ([ad952e2](https://github.com/ipfs/interface-ipfs-core/commit/ad952e2))



<a name="0.23.2"></a>
## [0.23.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.1...v0.23.2) (2017-01-11)


### Bug Fixes

* be nodejs 4 compatible ([3e356f0](https://github.com/ipfs/interface-ipfs-core/commit/3e356f0))



<a name="0.23.1"></a>
## [0.23.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.23.0...v0.23.1) (2017-01-11)


### Bug Fixes

* identify needs time to finish ([b76993d](https://github.com/ipfs/interface-ipfs-core/commit/b76993d))



<a name="0.23.0"></a>
# [0.23.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.22.1...v0.23.0) (2016-12-21)


### Bug Fixes

* fix a bunch of issues (i.e: identify race condition) ([d004577](https://github.com/ipfs/interface-ipfs-core/commit/d004577))


### Features

* add first pass of pubsub tests (running in js-ipfs-api) ([74003a7](https://github.com/ipfs/interface-ipfs-core/commit/74003a7))
* new event based API ([1a82890](https://github.com/ipfs/interface-ipfs-core/commit/1a82890))



<a name="0.22.1"></a>
## [0.22.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.22.0...v0.22.1) (2016-12-10)


### Features

* **object:** add template option to object.new ([2f23617](https://github.com/ipfs/interface-ipfs-core/commit/2f23617))



<a name="0.22.0"></a>
# [0.22.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.21.0...v0.22.0) (2016-11-24)


### Bug Fixes

* **swarm:** swarm.peers test ([0a6a07d](https://github.com/ipfs/interface-ipfs-core/commit/0a6a07d))



<a name="0.21.0"></a>
# [0.21.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.20.1...v0.21.0) (2016-11-24)


### Features

* update to awesome dag-pb ([519c944](https://github.com/ipfs/interface-ipfs-core/commit/519c944))



<a name="0.20.1"></a>
## [0.20.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.20.0...v0.20.1) (2016-11-23)


### Bug Fixes

* disable directory tests because of go-ipfs + browser ([7e6884c](https://github.com/ipfs/interface-ipfs-core/commit/7e6884c))



<a name="0.20.0"></a>
# [0.20.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.19.0...v0.20.0) (2016-11-17)



<a name="0.19.0"></a>
# [0.19.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.18.4...v0.19.0) (2016-11-17)


### Features

* prepare for swarm.peers changes in 0.4.5 ([039eca7](https://github.com/ipfs/interface-ipfs-core/commit/039eca7))



<a name="0.18.4"></a>
## [0.18.4](https://github.com/ipfs/interface-ipfs-core/compare/v0.18.3...v0.18.4) (2016-11-10)


### Features

* disable nested array test until https://github.com/ipfs/js-ipfs-api/issues/339 is fixed ([6d07f92](https://github.com/ipfs/interface-ipfs-core/commit/6d07f92))



<a name="0.18.3"></a>
## [0.18.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.18.2...v0.18.3) (2016-11-08)


### Features

* **dht:** add dht.findpeer spec ([daf892d](https://github.com/ipfs/interface-ipfs-core/commit/daf892d))
* **dht:** add dht.findprovs spec ([9878a92](https://github.com/ipfs/interface-ipfs-core/commit/9878a92))
* **dht:** add dht.get spec ([9ec3064](https://github.com/ipfs/interface-ipfs-core/commit/9ec3064))
* **dht:** add dht.put + .query spec ([841c2c3](https://github.com/ipfs/interface-ipfs-core/commit/841c2c3))



<a name="0.18.2"></a>
## [0.18.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.18.1...v0.18.2) (2016-11-08)


### Bug Fixes

* **files:** remove duplicated expectations ([c8c5ee8](https://github.com/ipfs/interface-ipfs-core/commit/c8c5ee8))
* **get:** update tests to reflect the tar-stream behaviour ([6adb626](https://github.com/ipfs/interface-ipfs-core/commit/6adb626))



<a name="0.18.1"></a>
## [0.18.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.18.0...v0.18.1) (2016-11-03)


### Bug Fixes

* use new nested aegir fixtures ([#84](https://github.com/ipfs/interface-ipfs-core/issues/84)) ([ee6424f](https://github.com/ipfs/interface-ipfs-core/commit/ee6424f))



<a name="0.18.0"></a>
# [0.18.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.17.1...v0.18.0) (2016-11-03)


### Bug Fixes

* remove test from npmignore ([238d5f9](https://github.com/ipfs/interface-ipfs-core/commit/238d5f9))



<a name="0.17.1"></a>
## [0.17.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.17.0...v0.17.1) (2016-11-03)



<a name="0.17.0"></a>
# [0.17.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.16.6...v0.17.0) (2016-11-03)



<a name="0.16.6"></a>
## [0.16.6](https://github.com/ipfs/interface-ipfs-core/compare/v0.16.5...v0.16.6) (2016-10-29)



<a name="0.16.5"></a>
## [0.16.5](https://github.com/ipfs/interface-ipfs-core/compare/v0.16.4...v0.16.5) (2016-10-29)


### Bug Fixes

* object.stat test was not passing the encoding of the multihash ([8158667](https://github.com/ipfs/interface-ipfs-core/commit/8158667))



<a name="0.16.4"></a>
## [0.16.4](https://github.com/ipfs/interface-ipfs-core/compare/v0.16.3...v0.16.4) (2016-10-28)



<a name="0.16.3"></a>
## [0.16.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.16.2...v0.16.3) (2016-10-28)



<a name="0.16.2"></a>
## [0.16.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.16.1...v0.16.2) (2016-10-28)



<a name="0.16.1"></a>
## [0.16.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.16.0...v0.16.1) (2016-10-28)


### Bug Fixes

* remove: .only ([dcfe24c](https://github.com/ipfs/interface-ipfs-core/commit/dcfe24c))



<a name="0.16.0"></a>
# [0.16.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.15.0...v0.16.0) (2016-10-28)


### Bug Fixes

* **ci:** Run lint instead of test in CircleCI ([e68ca64](https://github.com/ipfs/interface-ipfs-core/commit/e68ca64))


### Features

* adjustments to the ipld-dag-pb format ([8dad522](https://github.com/ipfs/interface-ipfs-core/commit/8dad522))
* block API updated to use CID ([75f8899](https://github.com/ipfs/interface-ipfs-core/commit/75f8899))
* ensure backwards compatibility at the block API ([9850c4a](https://github.com/ipfs/interface-ipfs-core/commit/9850c4a))



<a name="0.15.0"></a>
# [0.15.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.14.6...v0.15.0) (2016-09-15)


### Features

* **swarm:** expose PeerInfo for addrs command ([077749c](https://github.com/ipfs/interface-ipfs-core/commit/077749c))



<a name="0.14.6"></a>
## [0.14.6](https://github.com/ipfs/interface-ipfs-core/compare/v0.14.5...v0.14.6) (2016-09-14)



<a name="0.14.5"></a>
## [0.14.5](https://github.com/ipfs/interface-ipfs-core/compare/v0.14.4...v0.14.5) (2016-09-09)



<a name="0.14.4"></a>
## [0.14.4](https://github.com/ipfs/interface-ipfs-core/compare/v0.14.3...v0.14.4) (2016-09-09)


### Bug Fixes

* **files:** don't expect a specific sorting of files ([ef98a93](https://github.com/ipfs/interface-ipfs-core/commit/ef98a93))



<a name="0.14.3"></a>
## [0.14.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.14.2...v0.14.3) (2016-08-28)


### Bug Fixes

* **build:** point to the transpiled version ([4ce4c21](https://github.com/ipfs/interface-ipfs-core/commit/4ce4c21))



<a name="0.14.2"></a>
## [0.14.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.14.1...v0.14.2) (2016-08-25)


### Bug Fixes

* **log:** remove console.log ([1fe46fd](https://github.com/ipfs/interface-ipfs-core/commit/1fe46fd))



<a name="0.14.1"></a>
## [0.14.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.14.0...v0.14.1) (2016-08-25)


### Features

* **config:** not pick a protected value for config test ([9f1aebf](https://github.com/ipfs/interface-ipfs-core/commit/9f1aebf))



<a name="0.14.0"></a>
# [0.14.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.13.0...v0.14.0) (2016-08-24)


### Bug Fixes

* **files:** fix typo ([dad7f81](https://github.com/ipfs/interface-ipfs-core/commit/dad7f81))


### Features

* **block:** correct tests, update interface ([235c02f](https://github.com/ipfs/interface-ipfs-core/commit/235c02f))



<a name="0.13.0"></a>
# [0.13.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.12.0...v0.13.0) (2016-08-17)


### Bug Fixes

* **block:** tests ([488f61b](https://github.com/ipfs/interface-ipfs-core/commit/488f61b))
* **block spec:** apply CR ([c371550](https://github.com/ipfs/interface-ipfs-core/commit/c371550))


### Features

* **block:** spec ([e32090e](https://github.com/ipfs/interface-ipfs-core/commit/e32090e))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.11.0...v0.12.0) (2016-08-17)


### Features

* **swarm:** add swarm.addrs ([0f24de2](https://github.com/ipfs/interface-ipfs-core/commit/0f24de2))
* **swarm:** add swarm.connect + .disconnect + .filters + .filters.add + filters.rm + .peers ([f62f648](https://github.com/ipfs/interface-ipfs-core/commit/f62f648))
* **swarm:** tests ([5c145c6](https://github.com/ipfs/interface-ipfs-core/commit/5c145c6))



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.9.0...v0.11.0) (2016-08-16)


### Features

* **generic:** add tests to generic ([85c8c02](https://github.com/ipfs/interface-ipfs-core/commit/85c8c02))
* **spec:** generic API spec ([b64d8e8](https://github.com/ipfs/interface-ipfs-core/commit/b64d8e8))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.8.0...v0.9.0) (2016-08-16)


### Features

* **pin:** tests ([eaabe8f](https://github.com/ipfs/interface-ipfs-core/commit/eaabe8f))
* **pinning:** add pin.add spec ([fa784b3](https://github.com/ipfs/interface-ipfs-core/commit/fa784b3))
* **pinning:** add pin.ls + rm spec ([59a45d0](https://github.com/ipfs/interface-ipfs-core/commit/59a45d0))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.7.2...v0.8.0) (2016-08-12)


### Features

* **files.add:** update files.add API ([a5ee5d2](https://github.com/ipfs/interface-ipfs-core/commit/a5ee5d2))
* **files.add:** update tests to new files add API ([dfa0094](https://github.com/ipfs/interface-ipfs-core/commit/dfa0094))



<a name="0.7.2"></a>
## [0.7.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.7.1...v0.7.2) (2016-08-11)


### Bug Fixes

* **tests:** arrow to function ([5c79387](https://github.com/ipfs/interface-ipfs-core/commit/5c79387))



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.7.0...v0.7.1) (2016-08-11)


### Bug Fixes

* **tests:** add a larger timeout to cope with CI slowness ([c23d558](https://github.com/ipfs/interface-ipfs-core/commit/c23d558))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.6.0...v0.7.0) (2016-08-10)


### Features

* **factory:** use factory instead, also make files tests to not assume that some files exist in the test repo ([d12c8d5](https://github.com/ipfs/interface-ipfs-core/commit/d12c8d5))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.5.1...v0.6.0) (2016-08-10)


### Bug Fixes

* **files:** remove .only used for testing ([aea7585](https://github.com/ipfs/interface-ipfs-core/commit/aea7585))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.5.0...v0.5.1) (2016-08-05)


### Bug Fixes

* **dep:** update aegir ([92a109f](https://github.com/ipfs/interface-ipfs-core/commit/92a109f))
* **style:** avoid es-scrutinyhell ([1a958aa](https://github.com/ipfs/interface-ipfs-core/commit/1a958aa))


### Features

* **ci:** add travis ([d0b49eb](https://github.com/ipfs/interface-ipfs-core/commit/d0b49eb))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.4.3...v0.5.0) (2016-08-03)


### Bug Fixes

* ensure promise tests are correct ([f017350](https://github.com/ipfs/interface-ipfs-core/commit/f017350))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.4.2...v0.4.3) (2016-07-02)



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.4.1...v0.4.2) (2016-07-02)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.4.0...v0.4.1) (2016-07-02)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.3.0...v0.4.0) (2016-07-02)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.2.2...v0.3.0) (2016-06-06)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.2.1...v0.2.2) (2016-06-06)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.2.0...v0.2.1) (2016-06-05)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/interface-ipfs-core/compare/v0.1.5...v0.2.0) (2016-06-05)



<a name="0.1.5"></a>
## [0.1.5](https://github.com/ipfs/interface-ipfs-core/compare/v0.1.3...v0.1.5) (2016-05-13)


### Features

* **object:** object.put protobuf encoding test ([a8bc46d](https://github.com/ipfs/interface-ipfs-core/commit/a8bc46d)), closes [#3](https://github.com/ipfs/interface-ipfs-core/issues/3)



<a name="0.1.3"></a>
## [0.1.3](https://github.com/ipfs/interface-ipfs-core/compare/v0.1.2...v0.1.3) (2016-05-13)


### Bug Fixes

* before and after clauses need to be nested in a describe block ([f25b677](https://github.com/ipfs/interface-ipfs-core/commit/f25b677))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/ipfs/interface-ipfs-core/compare/v0.1.1...v0.1.2) (2016-05-13)



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipfs/interface-ipfs-core/compare/v0.1.0...v0.1.1) (2016-05-13)



<a name="0.1.0"></a>
# 0.1.0 (2016-05-13)



