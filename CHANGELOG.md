<a name="22.2.3"></a>
## [22.2.3](https://github.com/ipfs/js-ipfs-api/compare/v22.2.2...v22.2.3) (2018-07-10)


### Bug Fixes

* Request logging broken in Electron ([#808](https://github.com/ipfs/js-ipfs-api/issues/808)) ([52298ae](https://github.com/ipfs/js-ipfs-api/commit/52298ae))



<a name="22.2.2"></a>
## [22.2.2](https://github.com/ipfs/js-ipfs-api/compare/v22.2.1...v22.2.2) (2018-07-05)


### Bug Fixes

* ignore response body for some mfs commands ([#805](https://github.com/ipfs/js-ipfs-api/issues/805)) ([b604a64](https://github.com/ipfs/js-ipfs-api/commit/b604a64))


### Features

* modular interface tests ([#785](https://github.com/ipfs/js-ipfs-api/issues/785)) ([2426072](https://github.com/ipfs/js-ipfs-api/commit/2426072)), closes [#339](https://github.com/ipfs/js-ipfs-api/issues/339) [#802](https://github.com/ipfs/js-ipfs-api/issues/802) [#801](https://github.com/ipfs/js-ipfs-api/issues/801)



<a name="22.2.1"></a>
## [22.2.1](https://github.com/ipfs/js-ipfs-api/compare/v22.2.0...v22.2.1) (2018-06-29)


### Bug Fixes

* res.req only in Node.js, in browser use res.url instead ([#798](https://github.com/ipfs/js-ipfs-api/issues/798)) ([e8a5ab9](https://github.com/ipfs/js-ipfs-api/commit/e8a5ab9))



<a name="22.2.0"></a>
# [22.2.0](https://github.com/ipfs/js-ipfs-api/compare/v22.1.1...v22.2.0) (2018-06-29)


### Features

* logs path & querystring for requests ([#796](https://github.com/ipfs/js-ipfs-api/issues/796)) ([4e55d19](https://github.com/ipfs/js-ipfs-api/commit/4e55d19))



<a name="22.1.1"></a>
## [22.1.1](https://github.com/ipfs/js-ipfs-api/compare/v22.1.0...v22.1.1) (2018-06-25)


### Bug Fixes

* get block with empty data ([#789](https://github.com/ipfs/js-ipfs-api/issues/789)) ([88edd83](https://github.com/ipfs/js-ipfs-api/commit/88edd83))



<a name="22.1.0"></a>
# [22.1.0](https://github.com/ipfs/js-ipfs-api/compare/v22.0.2...v22.1.0) (2018-06-18)


### Features

* add support for custom headers to send-request ([#741](https://github.com/ipfs/js-ipfs-api/issues/741)) ([7fb2e07](https://github.com/ipfs/js-ipfs-api/commit/7fb2e07))
* implement bitswap wantlist peer ID param and bitswap unwant ([#761](https://github.com/ipfs/js-ipfs-api/issues/761)) ([73a153e](https://github.com/ipfs/js-ipfs-api/commit/73a153e))



<a name="22.0.2"></a>
## [22.0.2](https://github.com/ipfs/js-ipfs-api/compare/v22.0.1...v22.0.2) (2018-06-14)


### Bug Fixes

* json-loader error in upload-file-via-browser example ([#784](https://github.com/ipfs/js-ipfs-api/issues/784)) ([5e7b7c4](https://github.com/ipfs/js-ipfs-api/commit/5e7b7c4))



<a name="22.0.1"></a>
## [22.0.1](https://github.com/ipfs/js-ipfs-api/compare/v22.0.0...v22.0.1) (2018-05-30)


### Bug Fixes

* configure webpack to not use esmodules in dependencies ([dc14333](https://github.com/ipfs/js-ipfs-api/commit/dc14333))
* correctly differentiate pong responses ([4ad25a3](https://github.com/ipfs/js-ipfs-api/commit/4ad25a3))
* util.addFromURL with URL-escaped file ([a3bd811](https://github.com/ipfs/js-ipfs-api/commit/a3bd811))



<a name="22.0.0"></a>
# [22.0.0](https://github.com/ipfs/js-ipfs-api/compare/v21.0.0...v22.0.0) (2018-05-20)


### Bug Fixes

* callback from unsub after stream ends ([51a80f2](https://github.com/ipfs/js-ipfs-api/commit/51a80f2))
* do not fail stop node if failed start node ([533760f](https://github.com/ipfs/js-ipfs-api/commit/533760f))
* **ping:** convert the ping messages to lowercase ([632af40](https://github.com/ipfs/js-ipfs-api/commit/632af40))
* more robust ping tests ([fc6d301](https://github.com/ipfs/js-ipfs-api/commit/fc6d301))
* remove .only ([0e21c8a](https://github.com/ipfs/js-ipfs-api/commit/0e21c8a))
* result.Peers can be null, ensure callback is called ([f5f2e83](https://github.com/ipfs/js-ipfs-api/commit/f5f2e83))
* update asserted error message ([17c1f1c](https://github.com/ipfs/js-ipfs-api/commit/17c1f1c))
* use async/setImmediate vs process.nextTick ([faa51b4](https://github.com/ipfs/js-ipfs-api/commit/faa51b4))



<a name="21.0.0"></a>
# [21.0.0](https://github.com/ipfs/js-ipfs-api/compare/v20.2.1...v21.0.0) (2018-05-12)


### Bug Fixes

* make pubsub.unsubscribe async and alter pubsub.subscribe signature ([b98f8f3](https://github.com/ipfs/js-ipfs-api/commit/b98f8f3))


### BREAKING CHANGES

* pubsub.unsubscribe is now async and argument order for pubsub.subscribe has changed

License: MIT
Signed-off-by: Alan Shaw <alan@tableflip.io>



<a name="20.2.1"></a>
## [20.2.1](https://github.com/ipfs/js-ipfs-api/compare/v20.2.0...v20.2.1) (2018-05-06)



<a name="20.2.0"></a>
# [20.2.0](https://github.com/ipfs/js-ipfs-api/compare/v20.0.1...v20.2.0) (2018-04-30)


### Bug Fixes

* adding files by pull stream ([2fa16c5](https://github.com/ipfs/js-ipfs-api/commit/2fa16c5))
* handle request errors in addFromURL ([7c5cea5](https://github.com/ipfs/js-ipfs-api/commit/7c5cea5))
* increase timeout for name.publish and fix setup code ([ceb1106](https://github.com/ipfs/js-ipfs-api/commit/ceb1106))
* ipfs add url wrap doesn't work ([#750](https://github.com/ipfs/js-ipfs-api/issues/750)) ([f6f1bf0](https://github.com/ipfs/js-ipfs-api/commit/f6f1bf0))


### Features

* Add offset/length arguments to files.cat ([17967c1](https://github.com/ipfs/js-ipfs-api/commit/17967c1))
* get it ready for release ([#751](https://github.com/ipfs/js-ipfs-api/issues/751)) ([1885af4](https://github.com/ipfs/js-ipfs-api/commit/1885af4))



<a name="20.1.0"></a>
# [20.1.0](https://github.com/ipfs/js-ipfs-api/compare/v20.0.1...v20.1.0) (2018-04-30)


### Bug Fixes

* adding files by pull stream ([2fa16c5](https://github.com/ipfs/js-ipfs-api/commit/2fa16c5))
* handle request errors in addFromURL ([7c5cea5](https://github.com/ipfs/js-ipfs-api/commit/7c5cea5))
* increase timeout for name.publish and fix setup code ([ceb1106](https://github.com/ipfs/js-ipfs-api/commit/ceb1106))
* ipfs add url wrap doesn't work ([#750](https://github.com/ipfs/js-ipfs-api/issues/750)) ([f6f1bf0](https://github.com/ipfs/js-ipfs-api/commit/f6f1bf0))


### Features

* Add offset/length arguments to files.cat ([17967c1](https://github.com/ipfs/js-ipfs-api/commit/17967c1))
* get it ready for release ([#751](https://github.com/ipfs/js-ipfs-api/issues/751)) ([1885af4](https://github.com/ipfs/js-ipfs-api/commit/1885af4))



<a name="20.0.1"></a>
## [20.0.1](https://github.com/ipfs/js-ipfs-api/compare/v20.0.0...v20.0.1) (2018-04-12)



<a name="20.0.0"></a>
# [20.0.0](https://github.com/ipfs/js-ipfs-api/compare/v19.0.0...v20.0.0) (2018-04-05)


### Bug Fixes

* **dag:** js-ipld format resolver take the raw block ([2683c7e](https://github.com/ipfs/js-ipfs-api/commit/2683c7e))
* **dag:** path logic for DAG get was wrong ([d2b203b](https://github.com/ipfs/js-ipfs-api/commit/d2b203b))
* **dag:** use SendOneFile for dag put ([9c37213](https://github.com/ipfs/js-ipfs-api/commit/9c37213))


### Features

* dag.put ([9463d3a](https://github.com/ipfs/js-ipfs-api/commit/9463d3a))
* **dag:** proper get implementation ([7ba0343](https://github.com/ipfs/js-ipfs-api/commit/7ba0343))
* **dag:** rebase, use waterfall for put ([ad9eab8](https://github.com/ipfs/js-ipfs-api/commit/ad9eab8))
* **dag:** update option names to reflect go-ipfs API ([9bf1c6c](https://github.com/ipfs/js-ipfs-api/commit/9bf1c6c))
* Provide access to bundled libraries when in browser ([#732](https://github.com/ipfs/js-ipfs-api/issues/732)) ([994bdad](https://github.com/ipfs/js-ipfs-api/commit/994bdad)), closes [#406](https://github.com/ipfs/js-ipfs-api/issues/406)
* public-readonly-method-for-getting-host-and-port ([41d32e3](https://github.com/ipfs/js-ipfs-api/commit/41d32e3)), closes [#580](https://github.com/ipfs/js-ipfs-api/issues/580)
* Wrap with dir ([#730](https://github.com/ipfs/js-ipfs-api/issues/730)) ([160860e](https://github.com/ipfs/js-ipfs-api/commit/160860e))



<a name="19.0.0"></a>
# [19.0.0](https://github.com/ipfs/js-ipfs-api/compare/v18.2.1...v19.0.0) (2018-03-28)


### Bug Fixes

* **bitswap:** 0.4.14 returns empty array instead of null ([5e37a54](https://github.com/ipfs/js-ipfs-api/commit/5e37a54))
* **ping:** tests were failing and there it was missing to catch when count and n are used at the same time ([2181568](https://github.com/ipfs/js-ipfs-api/commit/2181568))


### Features

* streamable ping and optional packet number ([#723](https://github.com/ipfs/js-ipfs-api/issues/723)) ([3f3ce8a](https://github.com/ipfs/js-ipfs-api/commit/3f3ce8a))



<a name="18.2.1"></a>
## [18.2.1](https://github.com/ipfs/js-ipfs-api/compare/v18.2.0...v18.2.1) (2018-03-22)


### Features

* add ability to files.cat with a cid instance ([aeeb94e](https://github.com/ipfs/js-ipfs-api/commit/aeeb94e))



<a name="18.2.0"></a>
# [18.2.0](https://github.com/ipfs/js-ipfs-api/compare/v18.1.2...v18.2.0) (2018-03-16)


### Bug Fixes

* disable Browser test on Windows ([385a6c3](https://github.com/ipfs/js-ipfs-api/commit/385a6c3))
* don't create one webpack bundle for every test file ([3967e96](https://github.com/ipfs/js-ipfs-api/commit/3967e96))
* last fixes for green ([#719](https://github.com/ipfs/js-ipfs-api/issues/719)) ([658bad2](https://github.com/ipfs/js-ipfs-api/commit/658bad2))
* set the FileResultStreamConverter explicitly ([dfad55e](https://github.com/ipfs/js-ipfs-api/commit/dfad55e)), closes [#696](https://github.com/ipfs/js-ipfs-api/issues/696)
* use a different remote server for test ([1fc15a5](https://github.com/ipfs/js-ipfs-api/commit/1fc15a5))


### Features

* --only-hash ([#717](https://github.com/ipfs/js-ipfs-api/issues/717)) ([1137401](https://github.com/ipfs/js-ipfs-api/commit/1137401)), closes [#700](https://github.com/ipfs/js-ipfs-api/issues/700)
* add support for ipfs files stat --with-local ([#695](https://github.com/ipfs/js-ipfs-api/issues/695)) ([b08f21a](https://github.com/ipfs/js-ipfs-api/commit/b08f21a))



<a name="18.1.2"></a>
## [18.1.2](https://github.com/ipfs/js-ipfs-api/compare/v18.1.1...v18.1.2) (2018-03-09)


### Bug Fixes

* regression on files.add and update deps ([#709](https://github.com/ipfs/js-ipfs-api/issues/709)) ([85cc2a8](https://github.com/ipfs/js-ipfs-api/commit/85cc2a8))
* remove argument from .stats.bw* ([#699](https://github.com/ipfs/js-ipfs-api/issues/699)) ([f81dce5](https://github.com/ipfs/js-ipfs-api/commit/f81dce5))



<a name="18.1.1"></a>
## [18.1.1](https://github.com/ipfs/js-ipfs-api/compare/v18.0.0...v18.1.1) (2018-02-20)


### Features

* support recursive ipfs ls  ([cfe95f6](https://github.com/ipfs/js-ipfs-api/commit/cfe95f6))



<a name="18.1.0"></a>
# [18.1.0](https://github.com/ipfs/js-ipfs-api/compare/v18.0.0...v18.1.0) (2018-02-20)


### Features

* support recursive ipfs ls  ([cfe95f6](https://github.com/ipfs/js-ipfs-api/commit/cfe95f6))



<a name="18.0.0"></a>
# [18.0.0](https://github.com/ipfs/js-ipfs-api/compare/v17.5.0...v18.0.0) (2018-02-14)


### Bug Fixes

* exception when dir is empty ([#680](https://github.com/ipfs/js-ipfs-api/issues/680)) ([ec04f6e](https://github.com/ipfs/js-ipfs-api/commit/ec04f6e))
* support all the Buffer shims and load fixtures correctly ([066988f](https://github.com/ipfs/js-ipfs-api/commit/066988f))
* update stats API ([#684](https://github.com/ipfs/js-ipfs-api/issues/684)) ([4f7999d](https://github.com/ipfs/js-ipfs-api/commit/4f7999d))


### Features

* (breaking change) stats spec, spec repo, stream to value on files read ([#679](https://github.com/ipfs/js-ipfs-api/issues/679)) ([118456e](https://github.com/ipfs/js-ipfs-api/commit/118456e))
* **breaking change:** use stream on stats.bw ([#686](https://github.com/ipfs/js-ipfs-api/issues/686)) ([895760e](https://github.com/ipfs/js-ipfs-api/commit/895760e))
* ipfs.stop ([5091115](https://github.com/ipfs/js-ipfs-api/commit/5091115))



<a name="17.5.0"></a>
# [17.5.0](https://github.com/ipfs/js-ipfs-api/compare/v17.3.0...v17.5.0) (2018-01-24)


### Bug Fixes

* normalize stats fields ([#669](https://github.com/ipfs/js-ipfs-api/issues/669)) ([5803d39](https://github.com/ipfs/js-ipfs-api/commit/5803d39))


### Features

* /api/v0/repo/version ([#676](https://github.com/ipfs/js-ipfs-api/issues/676)) ([ecf70b9](https://github.com/ipfs/js-ipfs-api/commit/ecf70b9))
* integrate new ipfsd-ctl ([2b1820b](https://github.com/ipfs/js-ipfs-api/commit/2b1820b))



<a name="17.4.0"></a>
# [17.4.0](https://github.com/ipfs/js-ipfs-api/compare/v17.3.0...v17.4.0) (2018-01-24)


### Bug Fixes

* normalize stats fields ([#669](https://github.com/ipfs/js-ipfs-api/issues/669)) ([5803d39](https://github.com/ipfs/js-ipfs-api/commit/5803d39))


### Features

* integrate new ipfsd-ctl ([2b1820b](https://github.com/ipfs/js-ipfs-api/commit/2b1820b))



<a name="17.3.0"></a>
# [17.3.0](https://github.com/ipfs/js-ipfs-api/compare/v17.2.7...v17.3.0) (2018-01-12)


### Features

* /api/v0/dns ([#665](https://github.com/ipfs/js-ipfs-api/issues/665)) ([81016bb](https://github.com/ipfs/js-ipfs-api/commit/81016bb))



<a name="17.2.7"></a>
## [17.2.7](https://github.com/ipfs/js-ipfs-api/compare/v17.2.6...v17.2.7) (2018-01-11)


### Bug Fixes

* name and key tests ([#661](https://github.com/ipfs/js-ipfs-api/issues/661)) ([5ab1d02](https://github.com/ipfs/js-ipfs-api/commit/5ab1d02))


### Features

* normalize KEY API ([#659](https://github.com/ipfs/js-ipfs-api/issues/659)) ([1b10821](https://github.com/ipfs/js-ipfs-api/commit/1b10821))
* normalize NAME API ([#658](https://github.com/ipfs/js-ipfs-api/issues/658)) ([9b8ef48](https://github.com/ipfs/js-ipfs-api/commit/9b8ef48))



<a name="17.2.6"></a>
## [17.2.6](https://github.com/ipfs/js-ipfs-api/compare/v17.2.5...v17.2.6) (2017-12-28)


### Features

* support key/export and key/import ([#653](https://github.com/ipfs/js-ipfs-api/issues/653)) ([496f08e](https://github.com/ipfs/js-ipfs-api/commit/496f08e))



<a name="17.2.5"></a>
## [17.2.5](https://github.com/ipfs/js-ipfs-api/compare/v17.2.4...v17.2.5) (2017-12-20)


### Bug Fixes

* **files.add:** handle weird directory names ([#646](https://github.com/ipfs/js-ipfs-api/issues/646)) ([012b86c](https://github.com/ipfs/js-ipfs-api/commit/012b86c))


### Features

* add files/flush ([#643](https://github.com/ipfs/js-ipfs-api/issues/643)) ([5c254eb](https://github.com/ipfs/js-ipfs-api/commit/5c254eb))
* support key/rm and key/rename ([#641](https://github.com/ipfs/js-ipfs-api/issues/641)) ([113030a](https://github.com/ipfs/js-ipfs-api/commit/113030a))



<a name="17.2.4"></a>
## [17.2.4](https://github.com/ipfs/js-ipfs-api/compare/v17.2.3...v17.2.4) (2017-12-06)


### Bug Fixes

* stats/bw uses stream ([#640](https://github.com/ipfs/js-ipfs-api/issues/640)) ([c4e922e](https://github.com/ipfs/js-ipfs-api/commit/c4e922e))



<a name="17.2.3"></a>
## [17.2.3](https://github.com/ipfs/js-ipfs-api/compare/v17.2.2...v17.2.3) (2017-12-05)



<a name="17.2.2"></a>
## [17.2.2](https://github.com/ipfs/js-ipfs-api/compare/v17.2.1...v17.2.2) (2017-12-05)



<a name="17.2.1"></a>
## [17.2.1](https://github.com/ipfs/js-ipfs-api/compare/v17.2.0...v17.2.1) (2017-12-05)


### Features

* add the stat commands ([#639](https://github.com/ipfs/js-ipfs-api/issues/639)) ([76c3068](https://github.com/ipfs/js-ipfs-api/commit/76c3068))



<a name="17.2.0"></a>
# [17.2.0](https://github.com/ipfs/js-ipfs-api/compare/v17.1.3...v17.2.0) (2017-12-01)


### Bug Fixes

* propagate trailer errors correctly ([#636](https://github.com/ipfs/js-ipfs-api/issues/636)) ([62d733e](https://github.com/ipfs/js-ipfs-api/commit/62d733e))



<a name="17.1.3"></a>
## [17.1.3](https://github.com/ipfs/js-ipfs-api/compare/v17.1.2...v17.1.3) (2017-11-23)



<a name="17.1.2"></a>
## [17.1.2](https://github.com/ipfs/js-ipfs-api/compare/v17.1.1...v17.1.2) (2017-11-22)


### Bug Fixes

* config.replace ([#634](https://github.com/ipfs/js-ipfs-api/issues/634)) ([79d79c5](https://github.com/ipfs/js-ipfs-api/commit/79d79c5)), closes [#633](https://github.com/ipfs/js-ipfs-api/issues/633)



<a name="17.1.1"></a>
## [17.1.1](https://github.com/ipfs/js-ipfs-api/compare/v17.1.0...v17.1.1) (2017-11-22)


### Bug Fixes

* pubsub do not eat error messages ([#632](https://github.com/ipfs/js-ipfs-api/issues/632)) ([5a1bf9b](https://github.com/ipfs/js-ipfs-api/commit/5a1bf9b))



<a name="17.1.0"></a>
# [17.1.0](https://github.com/ipfs/js-ipfs-api/compare/v17.0.1...v17.1.0) (2017-11-20)


### Features

* send files HTTP request should stream ([#629](https://github.com/ipfs/js-ipfs-api/issues/629)) ([dae62cb](https://github.com/ipfs/js-ipfs-api/commit/dae62cb))



<a name="17.0.1"></a>
## [17.0.1](https://github.com/ipfs/js-ipfs-api/compare/v17.0.0...v17.0.1) (2017-11-20)


### Bug Fixes

* allow topicCIDs from older peers ([#631](https://github.com/ipfs/js-ipfs-api/issues/631)) ([fe7cc22](https://github.com/ipfs/js-ipfs-api/commit/fe7cc22))



<a name="17.0.0"></a>
# [17.0.0](https://github.com/ipfs/js-ipfs-api/compare/v16.0.0...v17.0.0) (2017-11-17)


### Features

* Implementing the new interfaces ([#619](https://github.com/ipfs/js-ipfs-api/issues/619)) ([e1b38bf](https://github.com/ipfs/js-ipfs-api/commit/e1b38bf))



<a name="16.0.0"></a>
# [16.0.0](https://github.com/ipfs/js-ipfs-api/compare/v15.1.0...v16.0.0) (2017-11-16)


### Bug Fixes

* pubsub message fields ([#627](https://github.com/ipfs/js-ipfs-api/issues/627)) ([470777d](https://github.com/ipfs/js-ipfs-api/commit/470777d))



<a name="15.1.0"></a>
# [15.1.0](https://github.com/ipfs/js-ipfs-api/compare/v15.0.2...v15.1.0) (2017-11-14)


### Bug Fixes

* adapting HTTP API to the interface-ipfs-core spec ([#625](https://github.com/ipfs/js-ipfs-api/issues/625)) ([8e58225](https://github.com/ipfs/js-ipfs-api/commit/8e58225))


### Features

* windows interop ([#624](https://github.com/ipfs/js-ipfs-api/issues/624)) ([40557d0](https://github.com/ipfs/js-ipfs-api/commit/40557d0))



<a name="15.0.2"></a>
## [15.0.2](https://github.com/ipfs/js-ipfs-api/compare/v15.0.1...v15.0.2) (2017-11-13)



<a name="15.0.1"></a>
## [15.0.1](https://github.com/ipfs/js-ipfs-api/compare/v15.0.0...v15.0.1) (2017-10-22)



<a name="15.0.0"></a>
# [15.0.0](https://github.com/ipfs/js-ipfs-api/compare/v14.3.7...v15.0.0) (2017-10-22)


### Features

* update pin API to match interface-ipfs-core ([9102643](https://github.com/ipfs/js-ipfs-api/commit/9102643))



<a name="14.3.7"></a>
## [14.3.7](https://github.com/ipfs/js-ipfs-api/compare/v14.3.6...v14.3.7) (2017-10-18)



<a name="14.3.6"></a>
## [14.3.6](https://github.com/ipfs/js-ipfs-api/compare/v14.3.5...v14.3.6) (2017-10-18)


### Bug Fixes

* pass the config protocol to http requests ([#609](https://github.com/ipfs/js-ipfs-api/issues/609)) ([38d7289](https://github.com/ipfs/js-ipfs-api/commit/38d7289))


### Features

* avoid doing multiple RPC requests for files.add, fixes [#522](https://github.com/ipfs/js-ipfs-api/issues/522) ([#595](https://github.com/ipfs/js-ipfs-api/issues/595)) ([0ea5f57](https://github.com/ipfs/js-ipfs-api/commit/0ea5f57))
* report progress on ipfs add  ([e2d894c](https://github.com/ipfs/js-ipfs-api/commit/e2d894c))



<a name="14.3.5"></a>
## [14.3.5](https://github.com/ipfs/js-ipfs-api/compare/v14.3.4...v14.3.5) (2017-09-08)


### Features

* Support specify hash algorithm in files.add ([#597](https://github.com/ipfs/js-ipfs-api/issues/597)) ([ed68657](https://github.com/ipfs/js-ipfs-api/commit/ed68657))



<a name="14.3.4"></a>
## [14.3.4](https://github.com/ipfs/js-ipfs-api/compare/v14.3.3...v14.3.4) (2017-09-07)



<a name="14.3.3"></a>
## [14.3.3](https://github.com/ipfs/js-ipfs-api/compare/v14.3.2...v14.3.3) (2017-09-07)


### Features

* support options for .add / files.add  ([8c717b2](https://github.com/ipfs/js-ipfs-api/commit/8c717b2))



<a name="14.3.2"></a>
## [14.3.2](https://github.com/ipfs/js-ipfs-api/compare/v14.3.1...v14.3.2) (2017-09-04)


### Bug Fixes

* new fixed aegir ([93ac472](https://github.com/ipfs/js-ipfs-api/commit/93ac472))



