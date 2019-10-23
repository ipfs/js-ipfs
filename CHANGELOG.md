<a name="39.0.2"></a>
## [39.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v39.0.1...v39.0.2) (2019-10-23)


### Bug Fixes

* use non-strict equivalence for options.preload ([#1134](https://github.com/ipfs/js-ipfs-http-client/issues/1134)) ([432e1e8](https://github.com/ipfs/js-ipfs-http-client/commit/432e1e8))



<a name="39.0.1"></a>
## [39.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v39.0.0...v39.0.1) (2019-10-21)


### Bug Fixes

* expose preload argument ([#1129](https://github.com/ipfs/js-ipfs-http-client/issues/1129)) ([c82b031](https://github.com/ipfs/js-ipfs-http-client/commit/c82b031))
* increase default timeout and respect value passed to `ky.extend` ([#1130](https://github.com/ipfs/js-ipfs-http-client/issues/1130)) ([25b6043](https://github.com/ipfs/js-ipfs-http-client/commit/25b6043))



<a name="39.0.0"></a>
# [39.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v38.2.0...v39.0.0) (2019-10-15)



<a name="38.2.0"></a>
# [38.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v38.1.0...v38.2.0) (2019-10-06)


### Features

* adds ipfs.block.rm method ([#1123](https://github.com/ipfs/js-ipfs-http-client/issues/1123)) ([2f0eff7](https://github.com/ipfs/js-ipfs-http-client/commit/2f0eff7))



<a name="38.1.0"></a>
# [38.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v38.0.1...v38.1.0) (2019-10-04)


### Bug Fixes

* get correct remote node config ([5b53e22](https://github.com/ipfs/js-ipfs-http-client/commit/5b53e22))
* pull in preconfigured chai from interface tests ([93765c1](https://github.com/ipfs/js-ipfs-http-client/commit/93765c1))


### Features

* add methods for listing config profiles ([1c3d92a](https://github.com/ipfs/js-ipfs-http-client/commit/1c3d92a))


### BREAKING CHANGES

* ```javascript
Promise<{oldCfg, newCfg}> ipfs.config.profile(name, opts)

// is now
Promise<{old, new}> ipfs.config.profiles.apply(name, opts)
```

Possibly contentious;

Adds `callbackify` as a dependency, see https://github.com/ipfs/js-ipfs/issues/2506
for discussion.



<a name="38.0.1"></a>
## [38.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v38.0.0...v38.0.1) (2019-10-04)


### Bug Fixes

* pull in preconfigured chai from interface tests ([6a7eb8a](https://github.com/ipfs/js-ipfs-http-client/commit/6a7eb8a))



<a name="38.0.0"></a>
# [38.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v37.0.3...v38.0.0) (2019-09-25)



<a name="37.0.3"></a>
## [37.0.3](https://github.com/ipfs/js-ipfs-http-client/compare/v37.0.2...v37.0.3) (2019-09-25)



<a name="37.0.2"></a>
## [37.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v37.0.1...v37.0.2) (2019-09-20)


### Bug Fixes

* only do the big file workaround in node and electron main ([077c997](https://github.com/ipfs/js-ipfs-http-client/commit/077c997))



<a name="37.0.1"></a>
## [37.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v37.0.0...v37.0.1) (2019-09-17)



<a name="37.0.0"></a>
# [37.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v36.1.0...v37.0.0) (2019-09-17)


### Bug Fixes

* big downloads in electron ([9c9aac8](https://github.com/ipfs/js-ipfs-http-client/commit/9c9aac8))



<a name="36.1.0"></a>
# [36.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v36.0.0...v36.1.0) (2019-09-17)


### Bug Fixes

* fix electron renderer tests and a couple more bugs ([#1105](https://github.com/ipfs/js-ipfs-http-client/issues/1105)) ([a631a21](https://github.com/ipfs/js-ipfs-http-client/commit/a631a21))



<a name="36.0.0"></a>
# [36.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v35.1.0...v36.0.0) (2019-09-11)



<a name="35.1.0"></a>
# [35.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v35.0.0...v35.1.0) (2019-09-04)


### Features

* add config profile endpoint ([#1030](https://github.com/ipfs/js-ipfs-http-client/issues/1030)) ([3aaa3ee](https://github.com/ipfs/js-ipfs-http-client/commit/3aaa3ee))



<a name="35.0.0"></a>
# [35.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v34.0.0...v35.0.0) (2019-09-04)



<a name="34.0.0"></a>
# [34.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v33.1.1...v34.0.0) (2019-08-29)


### Bug Fixes

* **package:** update err-code to version 2.0.0 ([#1053](https://github.com/ipfs/js-ipfs-http-client/issues/1053)) ([3515070](https://github.com/ipfs/js-ipfs-http-client/commit/3515070))


### Features

* browser pubsub ([#1059](https://github.com/ipfs/js-ipfs-http-client/issues/1059)) ([3764d06](https://github.com/ipfs/js-ipfs-http-client/commit/3764d06))
* expose pin and preload arguments ([#1079](https://github.com/ipfs/js-ipfs-http-client/issues/1079)) ([e3ed6e9](https://github.com/ipfs/js-ipfs-http-client/commit/e3ed6e9))
* support adding files via async iterator ([#1078](https://github.com/ipfs/js-ipfs-http-client/issues/1078)) ([377042b](https://github.com/ipfs/js-ipfs-http-client/commit/377042b))



<a name="33.1.1"></a>
## [33.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v33.1.0...v33.1.1) (2019-07-26)


### Bug Fixes

* allow passing timeout option to object stat ([#1055](https://github.com/ipfs/js-ipfs-http-client/issues/1055)) ([92b0594](https://github.com/ipfs/js-ipfs-http-client/commit/92b0594))



<a name="33.1.0"></a>
# [33.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v33.0.2...v33.1.0) (2019-07-11)


### Bug Fixes

* changelog for 33.x does not include breaking change ([cd41a16](https://github.com/ipfs/js-ipfs-http-client/commit/cd41a16))
* invalid multipart/form-data ([#948](https://github.com/ipfs/js-ipfs-http-client/issues/948)) ([9e6dfe7](https://github.com/ipfs/js-ipfs-http-client/commit/9e6dfe7)), closes [/tools.ietf.org/html/rfc7578#section-4](https://github.com//tools.ietf.org/html/rfc7578/issues/section-4)


### Features

* add support for js-ipfs dag api and also some tests ([#957](https://github.com/ipfs/js-ipfs-http-client/issues/957)) ([8f378a3](https://github.com/ipfs/js-ipfs-http-client/commit/8f378a3))



<a name="33.0.2"></a>
## [33.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v33.0.1...v33.0.2) (2019-07-11)


### Bug Fixes

* make findprovs return all responses ([#1041](https://github.com/ipfs/js-ipfs-http-client/issues/1041)) ([63103bd](https://github.com/ipfs/js-ipfs-http-client/commit/63103bd))



<a name="33.0.1"></a>
## [33.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v33.0.0...v33.0.1) (2019-07-10)


### Bug Fixes

* response for findpeer and findprovs ([#1039](https://github.com/ipfs/js-ipfs-http-client/issues/1039)) ([5252f50](https://github.com/ipfs/js-ipfs-http-client/commit/5252f50))



<a name="33.0.0"></a>
# [33.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v32.0.1...v33.0.0) (2019-07-10)


### Bug Fixes

* link to ipfs.io ([70cdf25](https://github.com/ipfs/js-ipfs-http-client/commit/70cdf25))
* prepare for aegir release ([#1021](https://github.com/ipfs/js-ipfs-http-client/issues/1021)) ([806b206](https://github.com/ipfs/js-ipfs-http-client/commit/806b206))
* sometimes no Addrs element is present in the response ([#1037](https://github.com/ipfs/js-ipfs-http-client/issues/1037)) ([a74b8f7](https://github.com/ipfs/js-ipfs-http-client/commit/a74b8f7))
* **package:** update bignumber.js to version 9.0.0 ([#1024](https://github.com/ipfs/js-ipfs-http-client/issues/1024)) ([a04edac](https://github.com/ipfs/js-ipfs-http-client/commit/a04edac))

### BREAKING CHANGES

`repo.gc` response objects have changed to `{ err, cid }`, where `err` is an `Error` instance and `cid` is a [`CID`](https://github.com/multiformats/js-cid) instance.



<a name="32.0.1"></a>
## [32.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v32.0.0...v32.0.1) (2019-05-21)


### Bug Fixes

* error reporting for non-JSON responses ([#1016](https://github.com/ipfs/js-ipfs-http-client/issues/1016)) ([4251c88](https://github.com/ipfs/js-ipfs-http-client/commit/4251c88)), closes [#912](https://github.com/ipfs/js-ipfs-http-client/issues/912) [#1000](https://github.com/ipfs/js-ipfs-http-client/issues/1000) [#1001](https://github.com/ipfs/js-ipfs-http-client/issues/1001)
* send trickle param to trigger trickle dag builder ([#1015](https://github.com/ipfs/js-ipfs-http-client/issues/1015)) ([a28b009](https://github.com/ipfs/js-ipfs-http-client/commit/a28b009))



<a name="32.0.0"></a>
# [32.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v31.1.0...v32.0.0) (2019-05-21)


### Bug Fixes

* handle empty array return value in dht.findProvs ([#1003](https://github.com/ipfs/js-ipfs-http-client/issues/1003)) ([15ab7c5](https://github.com/ipfs/js-ipfs-http-client/commit/15ab7c5))


### Chores

* update ipld formats ([#1010](https://github.com/ipfs/js-ipfs-http-client/issues/1010)) ([a423d7f](https://github.com/ipfs/js-ipfs-http-client/commit/a423d7f))


### BREAKING CHANGES

* The default string encoding for version 1 CIDs has changed to `base32`.

IPLD formats have been updated to the latest versions. IPLD nodes returned by `ipfs.dag` and `ipfs.object` commands have significant breaking changes. If you are using these commands in your application you are likely to encounter the following changes to `dag-pb` nodes (the default node type that IPFS creates):

* `DAGNode` properties have been renamed as follows:
    * `data` => `Data`
    * `links` => `Links`
    * `size` => `size` (Note: no change)
* `DAGLink` properties have been renamed as follows:
    * `cid` => `Hash`
    * `name` => `Name`
    * `size` => `Tsize`

See CHANGELOGs for each IPLD format for it's respective changes, you can read more about the [`dag-pb` changes in the CHANGELOG](https://github.com/ipld/js-ipld-dag-pb/blob/master)

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>



<a name="31.1.0"></a>
# [31.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v31.0.2...v31.1.0) (2019-05-16)


### Features

* add support for File DOM API to files-regular ([#986](https://github.com/ipfs/js-ipfs-http-client/issues/986)) ([7b49f7e](https://github.com/ipfs/js-ipfs-http-client/commit/7b49f7e))



<a name="31.0.2"></a>
## [31.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v31.0.1...v31.0.2) (2019-05-16)


### Bug Fixes

* error handling for refs/refs local ([#997](https://github.com/ipfs/js-ipfs-http-client/issues/997)) ([391351d](https://github.com/ipfs/js-ipfs-http-client/commit/391351d))



<a name="31.0.1"></a>
## [31.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v31.0.0...v31.0.1) (2019-05-15)


### Bug Fixes

* config set with number ([#998](https://github.com/ipfs/js-ipfs-http-client/issues/998)) ([4f21bef](https://github.com/ipfs/js-ipfs-http-client/commit/4f21bef)), closes [#881](https://github.com/ipfs/js-ipfs-http-client/issues/881)



<a name="31.0.0"></a>
# [31.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v30.1.4...v31.0.0) (2019-05-13)


### Features

* refs endpoint ([#978](https://github.com/ipfs/js-ipfs-http-client/issues/978)) ([a741e10](https://github.com/ipfs/js-ipfs-http-client/commit/a741e10))


### BREAKING CHANGES

* ipfs.refs now returns objects with camelCase properties not PascalCase properties. i.e. `{ ref, err }` not `{ Ref, Err }`



<a name="30.1.4"></a>
## [30.1.4](https://github.com/ipfs/js-ipfs-http-client/compare/v30.1.3...v30.1.4) (2019-04-29)


### Bug Fixes

* uncaught error: stream.push() after EOF ([#980](https://github.com/ipfs/js-ipfs-http-client/issues/980)) ([cc677f0](https://github.com/ipfs/js-ipfs-http-client/commit/cc677f0)), closes [#967](https://github.com/ipfs/js-ipfs-http-client/issues/967)
* update Babel in upload-file-via-browser example ([#968](https://github.com/ipfs/js-ipfs-http-client/issues/968)) ([#970](https://github.com/ipfs/js-ipfs-http-client/issues/970)) ([17d49de](https://github.com/ipfs/js-ipfs-http-client/commit/17d49de))



<a name="30.1.3"></a>
## [30.1.3](https://github.com/ipfs/js-ipfs-http-client/compare/v30.1.2...v30.1.3) (2019-04-11)


### Bug Fixes

* fix missing buffer bundling with browserify ([#966](https://github.com/ipfs/js-ipfs-http-client/issues/966)) ([944a64b](https://github.com/ipfs/js-ipfs-http-client/commit/944a64b)), closes [#964](https://github.com/ipfs/js-ipfs-http-client/issues/964)



<a name="30.1.2"></a>
## [30.1.2](https://github.com/ipfs/js-ipfs-http-client/compare/v30.1.1...v30.1.2) (2019-04-09)


### Bug Fixes

* https multiaddr support in constructor ([#965](https://github.com/ipfs/js-ipfs-http-client/issues/965)) ([5da0bcd](https://github.com/ipfs/js-ipfs-http-client/commit/5da0bcd))



<a name="30.1.1"></a>
## [30.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v30.1.0...v30.1.1) (2019-03-28)



<a name="30.1.0"></a>
# [30.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v30.0.0...v30.1.0) (2019-03-15)


### Bug Fixes

* dht.findProvs.js handle valid hash but no providers ([#950](https://github.com/ipfs/js-ipfs-http-client/issues/950)) ([c3cde76](https://github.com/ipfs/js-ipfs-http-client/commit/c3cde76))


### Features

* provide access to multicodec ([#954](https://github.com/ipfs/js-ipfs-http-client/issues/954)) ([0c109ab](https://github.com/ipfs/js-ipfs-http-client/commit/0c109ab))


### Performance Improvements

* reduce bundle size ([#915](https://github.com/ipfs/js-ipfs-http-client/issues/915)) ([87dff04](https://github.com/ipfs/js-ipfs-http-client/commit/87dff04))



<a name="30.0.0"></a>
# [30.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v29.1.1...v30.0.0) (2019-03-13)


### Bug Fixes

* windows travis build ([#952](https://github.com/ipfs/js-ipfs-http-client/issues/952)) ([05f2f6c](https://github.com/ipfs/js-ipfs-http-client/commit/05f2f6c))


### Code Refactoring

* export types and utilities statically ([#951](https://github.com/ipfs/js-ipfs-http-client/issues/951)) ([d1e99e7](https://github.com/ipfs/js-ipfs-http-client/commit/d1e99e7)), closes [#902](https://github.com/ipfs/js-ipfs-http-client/issues/902)


### Features

* pubsub unsubscribe all ([#956](https://github.com/ipfs/js-ipfs-http-client/issues/956)) ([a57a411](https://github.com/ipfs/js-ipfs-http-client/commit/a57a411))


### BREAKING CHANGES

* `ipfs.util.isIPFS` has moved to a static export and should be accessed via `const { isIPFS } = require('ipfs-http-client')`.

The modules available under `ipfs.types.*` have also become static exports.

`ipfs.util.crypto` has been removed as it is not a dependency of `ipfs-http-client` so reduces the bundle size. If you need to use libp2p crypto primitives then please see the [js-libp2p-crypto](https://github.com/libp2p/js-libp2p-crypto) project for info on how to use it in your project.

Finally `ipfs.util.getEndpointConfig` is now a direct instance method, `ipfs.getEndpointConfig`

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>



<a name="29.1.1"></a>
## [29.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v29.1.0...v29.1.1) (2019-02-13)


### Performance Improvements

* use test profile ([#942](https://github.com/ipfs/js-ipfs-http-client/issues/942)) ([2c90620](https://github.com/ipfs/js-ipfs-http-client/commit/2c90620))



<a name="29.1.0"></a>
# [29.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v29.0.1...v29.1.0) (2019-01-29)


### Bug Fixes

* throw on invalid multiaddr to constructor ([#934](https://github.com/ipfs/js-ipfs-http-client/issues/934)) ([bcbf0d2](https://github.com/ipfs/js-ipfs-http-client/commit/bcbf0d2))


### Features

* return protocol from getEndpointConfig ([#935](https://github.com/ipfs/js-ipfs-http-client/issues/935)) ([12ddaa3](https://github.com/ipfs/js-ipfs-http-client/commit/12ddaa3))



<a name="29.0.1"></a>
## [29.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v29.0.0...v29.0.1) (2019-01-24)


### Bug Fixes

* bundle in meteor ([#931](https://github.com/ipfs/js-ipfs-http-client/issues/931)) ([431c442](https://github.com/ipfs/js-ipfs-http-client/commit/431c442)), closes [#10411](https://github.com/ipfs/js-ipfs-http-client/issues/10411)



<a name="29.0.0"></a>
# [29.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v28.1.2...v29.0.0) (2019-01-15)


### Code Refactoring

* switch to bignumber.js ([#927](https://github.com/ipfs/js-ipfs-http-client/issues/927)) ([1a54ae5](https://github.com/ipfs/js-ipfs-http-client/commit/1a54ae5))


### BREAKING CHANGES

* All API methods that returned [`big.js`](https://github.com/MikeMcl/big.js/) instances now return [`bignumber.js`](https://github.com/MikeMcl/bignumber.js/) instances.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>



<a name="28.1.2"></a>
## [28.1.2](https://github.com/ipfs/js-ipfs-http-client/compare/v28.1.1...v28.1.2) (2019-01-14)



<a name="28.1.1"></a>
## [28.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v28.1.0...v28.1.1) (2019-01-04)



<a name="28.1.0"></a>
# [28.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v28.0.3...v28.1.0) (2018-12-16)


### Features

* add cidBase option to resolve ([#893](https://github.com/ipfs/js-ipfs-http-client/issues/893)) ([ec6285d](https://github.com/ipfs/js-ipfs-http-client/commit/ec6285d))



<a name="28.0.3"></a>
## [28.0.3](https://github.com/ipfs/js-ipfs-http-client/compare/v28.0.2...v28.0.3) (2018-12-15)


### Bug Fixes

* re-allow passing path to ls ([#914](https://github.com/ipfs/js-ipfs-http-client/issues/914)) ([442bcdd](https://github.com/ipfs/js-ipfs-http-client/commit/442bcdd))



<a name="28.0.2"></a>
## [28.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v28.0.1...v28.0.2) (2018-12-14)



<a name="28.0.1"></a>
## [28.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v28.0.0...v28.0.1) (2018-12-13)


### Bug Fixes

* disable just the rule we're breaking ([bed2687](https://github.com/ipfs/js-ipfs-http-client/commit/bed2687))
* properly serialize CID instances ([45b344c](https://github.com/ipfs/js-ipfs-http-client/commit/45b344c))
* skip test that go-ipfs cannot pass ([0e15761](https://github.com/ipfs/js-ipfs-http-client/commit/0e15761))



<a name="28.0.0"></a>
# [28.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v27.1.0...v28.0.0) (2018-12-11)


### Bug Fixes

* case for addFromURL ([#907](https://github.com/ipfs/js-ipfs-http-client/issues/907)) ([99ac7be](https://github.com/ipfs/js-ipfs-http-client/commit/99ac7be))


### Code Refactoring

* dht api ([#890](https://github.com/ipfs/js-ipfs-http-client/issues/890)) ([05a84a4](https://github.com/ipfs/js-ipfs-http-client/commit/05a84a4))


### BREAKING CHANGES

* DHT API methods renamed and return types changed

* `ipfs.dht.findprovs` renamed to `ipfs.dht.findProvs` and returns an array of [PeerInfo](https://github.com/libp2p/js-peer-info)
* `ipfs.dht.findpeer` renamed to `ipfs.dht.findPeer` and returns a [PeerInfo](https://github.com/libp2p/js-peer-info)
* `ipfs.dht.query` now returns an array of [PeerId](https://github.com/libp2p/js-peer-id)
* [More info](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/DHT.md)



<a name="27.1.0"></a>
# [27.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v27.0.0...v27.1.0) (2018-12-05)


### Bug Fixes

* add docs for breaking change ([#898](https://github.com/ipfs/js-ipfs-http-client/issues/898)) ([3e794ac](https://github.com/ipfs/js-ipfs-http-client/commit/3e794ac))


### Features

* add files.ls*Stream methods ([#903](https://github.com/ipfs/js-ipfs-http-client/issues/903)) ([705855e](https://github.com/ipfs/js-ipfs-http-client/commit/705855e))



<a name="27.0.0"></a>
# [27.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v26.1.2...v27.0.0) (2018-11-28)


### Bug Fixes

* also retry with misnemed format "dag-cbor" as "cbor" ([#888](https://github.com/ipfs/js-ipfs-http-client/issues/888)) ([348a144](https://github.com/ipfs/js-ipfs-http-client/commit/348a144))
* better input validation for add ([#876](https://github.com/ipfs/js-ipfs-http-client/issues/876)) ([315b7f7](https://github.com/ipfs/js-ipfs-http-client/commit/315b7f7))
* fix log.tail by calling add after listening for events ([#882](https://github.com/ipfs/js-ipfs-http-client/issues/882)) ([da35b0f](https://github.com/ipfs/js-ipfs-http-client/commit/da35b0f))
* handle peer-info validation errors ([#887](https://github.com/ipfs/js-ipfs-http-client/issues/887)) ([6e6d7a2](https://github.com/ipfs/js-ipfs-http-client/commit/6e6d7a2)), closes [#885](https://github.com/ipfs/js-ipfs-http-client/issues/885)
* updates ipld-dag-pb dep to version without .cid properties ([#889](https://github.com/ipfs/js-ipfs-http-client/issues/889)) ([ac30a82](https://github.com/ipfs/js-ipfs-http-client/commit/ac30a82))


### Code Refactoring

* object API write methods now return CIDs ([#896](https://github.com/ipfs/js-ipfs-http-client/issues/896)) ([38bed14](https://github.com/ipfs/js-ipfs-http-client/commit/38bed14))
* rename library to ipfs-http-client ([#897](https://github.com/ipfs/js-ipfs-http-client/issues/897)) ([d40cb6c](https://github.com/ipfs/js-ipfs-http-client/commit/d40cb6c))
* updated files API ([#878](https://github.com/ipfs/js-ipfs-http-client/issues/878)) ([39f4733](https://github.com/ipfs/js-ipfs-http-client/commit/39f4733))


### BREAKING CHANGES

* the `ipfs-api` library has been renamed to `ipfs-http-client`.

Now install via `npm install ipfs-http-client`.

Note that in the browser build the object attached to `window` is now `window.IpfsHttpClient`.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>

* Object API refactor.

Object API methods that write DAG nodes now return a CID instead of a DAG node. Affected methods:

* `ipfs.object.new`
* `ipfs.object.patch.addLink`
* `ipfs.object.patch.appendData`
* `ipfs.object.patch.rmLink`
* `ipfs.object.patch.setData`
* `ipfs.object.put`

Example:

```js
// Before
const dagNode = await ipfs.object.new()
```

```js
// After
const cid = await ipfs.object.new() // now returns a CID
const dagNode = await ipfs.object.get(cid) // fetch the DAG node that was created
```

IMPORTANT: `DAGNode` instances, which are part of the IPLD dag-pb format have been refactored.

These instances no longer have `multihash`, `cid` or `serialized` properties.

This effects the following API methods that return these types of objects:

* `ipfs.object.get`
* `ipfs.dag.get`

See https://github.com/ipld/js-ipld-dag-pb/pull/99 for more information.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>

* Files API methods `add*`, `cat*`, `get*` have moved from `files` to the root namespace.

Specifically, the following changes have been made:

* `ipfs.files.add` => `ipfs.add`
* `ipfs.files.addPullStream` => `ipfs.addPullStream`
* `ipfs.files.addReadableStream` => `ipfs.addReadableStream`
* `ipfs.files.cat` => `ipfs.cat`
* `ipfs.files.catPullStream` => `ipfs.catPullStream`
* `ipfs.files.catReadableStream` => `ipfs.catReadableStream`
* `ipfs.files.get` => `ipfs.get`
* `ipfs.files.getPullStream` => `ipfs.getPullStream`
* `ipfs.files.getReadableStream` => `ipfs.getReadableStream`

Additionally, `addFromFs`, `addFromURL`, `addFromStream` have moved from `util` to the root namespace:

* `ipfs.util.addFromFs` => `ipfs.addFromFs`
* `ipfs.util.addFromURL` => `ipfs.addFromURL`
* `ipfs.util.addFromStream` => `ipfs.addFromStream`

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>

* Previously `swarm.peers` would throw an uncaught error if any peer in the response could not have its peerId or multiaddr validated.

This change catches errors that occur while validating the peer info. The returned array will contain an entry for every peer in the ipfs response. peer-info objects that couldn't be validated, now have an `error` property and a `rawPeerInfo` property. This at least means the count of peers in the response will be accurate, and there the info is available to the caller.

This means that callers now have to deal with peer-info objects that may
not have a `peer` or `addr` property.

Adds `nock` tests to exercice the code under different error conditions. Doing so uncovered a bug in our legacy go-ipfs <= 0.4.4 peer info parsing, which is also fixed. The code was trying to decapusalate the peerId from the multiaddr, but doing so trims the peerId rather than returning it.

License: MIT
Signed-off-by: Oli Evans <oli@tableflip.io>


<a name="26.1.2"></a>
## [26.1.2](https://github.com/ipfs/js-ipfs-http-client/compare/v26.1.0...v26.1.2) (2018-11-03)


### Features

* go-ipfs 0.4.18 ([e3e4d6c](https://github.com/ipfs/js-ipfs-http-client/commit/e3e4d6c))
* upload example works with big files ([62b844f](https://github.com/ipfs/js-ipfs-http-client/commit/62b844f))



<a name="26.1.1"></a>
## [26.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v26.1.0...v26.1.1) (2018-11-03)


### Features

* go-ipfs 0.4.18 ([9178e7d](https://github.com/ipfs/js-ipfs-http-client/commit/9178e7d))



<a name="26.1.0"></a>
# [26.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v26.0.3...v26.1.0) (2018-10-31)


### Bug Fixes

* make ping not mix errors with responses ([#883](https://github.com/ipfs/js-ipfs-http-client/issues/883)) ([80725f2](https://github.com/ipfs/js-ipfs-http-client/commit/80725f2))



<a name="26.0.3"></a>
## [26.0.3](https://github.com/ipfs/js-ipfs-http-client/compare/v26.0.2...v26.0.3) (2018-10-31)



<a name="26.0.2"></a>
## [26.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v26.0.0...v26.0.2) (2018-10-31)


### Bug Fixes

* pin.ls ignored opts when hash was present ([#875](https://github.com/ipfs/js-ipfs-http-client/issues/875)) ([0b46750](https://github.com/ipfs/js-ipfs-http-client/commit/0b46750)), closes [/github.com/ipfs-shipyard/ipfs-companion/issues/360#issuecomment-427525801](https://github.com//github.com/ipfs-shipyard/ipfs-companion/issues/360/issues/issuecomment-427525801)



<a name="26.0.1"></a>
## [26.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v26.0.0...v26.0.1) (2018-10-30)



<a name="26.0.0"></a>
# [26.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v25.0.0...v26.0.0) (2018-10-30)


### Bug Fixes

* add missing and remove unused dependencies ([#879](https://github.com/ipfs/js-ipfs-http-client/issues/879)) ([979d8b5](https://github.com/ipfs/js-ipfs-http-client/commit/979d8b5))


### Chores

* remove ipld formats re-export ([#872](https://github.com/ipfs/js-ipfs-http-client/issues/872)) ([c534375](https://github.com/ipfs/js-ipfs-http-client/commit/c534375))
* update to ipld-dag-cbor 0.13 ([0652ac0](https://github.com/ipfs/js-ipfs-http-client/commit/0652ac0))


### Features

* ipns over pubsub ([#846](https://github.com/ipfs/js-ipfs-http-client/issues/846)) ([ef49e95](https://github.com/ipfs/js-ipfs-http-client/commit/ef49e95))


### BREAKING CHANGES

* dag-cbor nodes now represent links as CID objects

The API for [dag-cbor](https://github.com/ipld/js-ipld-dag-cbor) changed.
Links are no longer represented as JSON objects (`{"/": "base-encoded-cid"}`,
but as [CID objects](https://github.com/ipld/js-cid). `ipfs.dag.get()` and
now always return links as CID objects. `ipfs.dag.put()` also expects links
to be represented as CID objects. The old-style JSON objects representation
is still supported, but deprecated.

Prior to this change:

```js
const cid = new CID('QmXed8RihWcWFXRRmfSRG9yFjEbXNxu1bDwgCFAN8Dxcq5')
// Link as JSON object representation
const putCid = await ipfs.dag.put({link: {'/': cid.toBaseEncodedString()}})
const result = await ipfs.dag.get(putCid)
console.log(result.value)

```

Output:

```js
{ link:
   { '/':
      <Buffer 12 20 8a…> } }
```

Now:

```js
const cid = new CID('QmXed8RihWcWFXRRmfSRG9yFjEbXNxu1bDwgCFAN8Dxcq5')
// Link as CID object
const putCid = await ipfs.dag.put({link: cid})
const result = await ipfs.dag.get(putCid)
console.log(result.value)
```

Output:

```js
{ link:
   CID {
     codec: 'dag-pb',
     version: 0,
     multihash:
      <Buffer 12 20 8a…> } }
```

See https://github.com/ipld/ipld/issues/44 for more information on why this
change was made.
* remove `types.dagCBOR` and `types.dagPB` from public API

If you need the `ipld-dag-cbor` or `ipld-dag-pb` module in the Browser,
you need to bundle them yourself.



<a name="25.0.0"></a>
# [25.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v24.0.2...v25.0.0) (2018-10-15)


### Bug Fixes

* >150mb bodies no longer crashing Chromium ([#868](https://github.com/ipfs/js-ipfs-http-client/issues/868)) ([180da77](https://github.com/ipfs/js-ipfs-http-client/commit/180da77)), closes [#654](https://github.com/ipfs/js-ipfs-http-client/issues/654)
* add bl module to package dependencies ([#853](https://github.com/ipfs/js-ipfs-http-client/issues/853)) ([#854](https://github.com/ipfs/js-ipfs-http-client/issues/854)) ([834934f](https://github.com/ipfs/js-ipfs-http-client/commit/834934f))
* add lodash dependency ([#873](https://github.com/ipfs/js-ipfs-http-client/issues/873)) ([c510cb7](https://github.com/ipfs/js-ipfs-http-client/commit/c510cb7)), closes [#870](https://github.com/ipfs/js-ipfs-http-client/issues/870)



<a name="24.0.2"></a>
## [24.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v24.0.1...v24.0.2) (2018-09-21)


### Bug Fixes

* block.put options ([#844](https://github.com/ipfs/js-ipfs-http-client/issues/844)) ([e290a38](https://github.com/ipfs/js-ipfs-http-client/commit/e290a38))



<a name="24.0.1"></a>
## [24.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v24.0.0...v24.0.1) (2018-08-21)



<a name="24.0.0"></a>
# [24.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v23.0.0...v24.0.0) (2018-08-15)


### Bug Fixes

* add test data to IPFS before fetching it ([#832](https://github.com/ipfs/js-ipfs-http-client/issues/832)) ([b2a77d6](https://github.com/ipfs/js-ipfs-http-client/commit/b2a77d6))
* BREAKING CHANGE use data-encoding arg so data is not corrupted ([#806](https://github.com/ipfs/js-ipfs-http-client/issues/806)) ([553c3fb](https://github.com/ipfs/js-ipfs-http-client/commit/553c3fb))
* dag.get return error on missing multicodec ([#831](https://github.com/ipfs/js-ipfs-http-client/issues/831)) ([ff7c7e5](https://github.com/ipfs/js-ipfs-http-client/commit/ff7c7e5))
* remove external urls from addFromURL tests ([#834](https://github.com/ipfs/js-ipfs-http-client/issues/834)) ([7cf7998](https://github.com/ipfs/js-ipfs-http-client/commit/7cf7998)), closes [#803](https://github.com/ipfs/js-ipfs-http-client/issues/803)


### BREAKING CHANGES

* Requires go-ipfs 0.4.17 as it allows for specifying the data encoding format when requesting object data.



<a name="23.0.0"></a>
# [23.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v22.3.0...v23.0.0) (2018-08-06)


### Bug Fixes

* config get ([#825](https://github.com/ipfs/js-ipfs-http-client/issues/825)) ([ef5a4a3](https://github.com/ipfs/js-ipfs-http-client/commit/ef5a4a3))


### Features

* add resolve cmd ([#826](https://github.com/ipfs/js-ipfs-http-client/issues/826)) ([c7ad0e4](https://github.com/ipfs/js-ipfs-http-client/commit/c7ad0e4))



<a name="22.3.0"></a>
# [22.3.0](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.4...v22.3.0) (2018-08-02)


### Bug Fixes

* config.set rejects buffer values ([#800](https://github.com/ipfs/js-ipfs-http-client/issues/800)) ([f3e6bf1](https://github.com/ipfs/js-ipfs-http-client/commit/f3e6bf1))


### Features

* compatible with go-ipfs 0.4.16 ([8536ee4](https://github.com/ipfs/js-ipfs-http-client/commit/8536ee4))
* expose mfs files.read*Stream methods ([#823](https://github.com/ipfs/js-ipfs-http-client/issues/823)) ([70c9df1](https://github.com/ipfs/js-ipfs-http-client/commit/70c9df1))



<a name="22.2.4"></a>
## [22.2.4](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.3...v22.2.4) (2018-07-17)


### Bug Fixes

* increase browserNoActivityTimeout to account for before ([328e338](https://github.com/ipfs/js-ipfs-http-client/commit/328e338))
* increase timeout for .name after all ([3dc4313](https://github.com/ipfs/js-ipfs-http-client/commit/3dc4313))
* missing debug dependency fixes [#809](https://github.com/ipfs/js-ipfs-http-client/issues/809) ([#810](https://github.com/ipfs/js-ipfs-http-client/issues/810)) ([0f1fe95](https://github.com/ipfs/js-ipfs-http-client/commit/0f1fe95))



<a name="22.2.3"></a>
## [22.2.3](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.2...v22.2.3) (2018-07-10)


### Bug Fixes

* Request logging broken in Electron ([#808](https://github.com/ipfs/js-ipfs-http-client/issues/808)) ([52298ae](https://github.com/ipfs/js-ipfs-http-client/commit/52298ae))



<a name="22.2.2"></a>
## [22.2.2](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.1...v22.2.2) (2018-07-05)


### Bug Fixes

* ignore response body for some mfs commands ([#805](https://github.com/ipfs/js-ipfs-http-client/issues/805)) ([b604a64](https://github.com/ipfs/js-ipfs-http-client/commit/b604a64))


### Features

* modular interface tests ([#785](https://github.com/ipfs/js-ipfs-http-client/issues/785)) ([2426072](https://github.com/ipfs/js-ipfs-http-client/commit/2426072)), closes [#339](https://github.com/ipfs/js-ipfs-http-client/issues/339) [#802](https://github.com/ipfs/js-ipfs-http-client/issues/802) [#801](https://github.com/ipfs/js-ipfs-http-client/issues/801)



<a name="22.2.1"></a>
## [22.2.1](https://github.com/ipfs/js-ipfs-http-client/compare/v22.2.0...v22.2.1) (2018-06-29)


### Bug Fixes

* res.req only in Node.js, in browser use res.url instead ([#798](https://github.com/ipfs/js-ipfs-http-client/issues/798)) ([e8a5ab9](https://github.com/ipfs/js-ipfs-http-client/commit/e8a5ab9))



<a name="22.2.0"></a>
# [22.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v22.1.1...v22.2.0) (2018-06-29)


### Features

* logs path & querystring for requests ([#796](https://github.com/ipfs/js-ipfs-http-client/issues/796)) ([4e55d19](https://github.com/ipfs/js-ipfs-http-client/commit/4e55d19))



<a name="22.1.1"></a>
## [22.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v22.1.0...v22.1.1) (2018-06-25)


### Bug Fixes

* get block with empty data ([#789](https://github.com/ipfs/js-ipfs-http-client/issues/789)) ([88edd83](https://github.com/ipfs/js-ipfs-http-client/commit/88edd83))



<a name="22.1.0"></a>
# [22.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v22.0.2...v22.1.0) (2018-06-18)


### Features

* add support for custom headers to send-request ([#741](https://github.com/ipfs/js-ipfs-http-client/issues/741)) ([7fb2e07](https://github.com/ipfs/js-ipfs-http-client/commit/7fb2e07))
* implement bitswap wantlist peer ID param and bitswap unwant ([#761](https://github.com/ipfs/js-ipfs-http-client/issues/761)) ([73a153e](https://github.com/ipfs/js-ipfs-http-client/commit/73a153e))



<a name="22.0.2"></a>
## [22.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v22.0.1...v22.0.2) (2018-06-14)


### Bug Fixes

* json-loader error in upload-file-via-browser example ([#784](https://github.com/ipfs/js-ipfs-http-client/issues/784)) ([5e7b7c4](https://github.com/ipfs/js-ipfs-http-client/commit/5e7b7c4))



<a name="22.0.1"></a>
## [22.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v22.0.0...v22.0.1) (2018-05-30)


### Bug Fixes

* configure webpack to not use esmodules in dependencies ([dc14333](https://github.com/ipfs/js-ipfs-http-client/commit/dc14333))
* correctly differentiate pong responses ([4ad25a3](https://github.com/ipfs/js-ipfs-http-client/commit/4ad25a3))
* util.addFromURL with URL-escaped file ([a3bd811](https://github.com/ipfs/js-ipfs-http-client/commit/a3bd811))



<a name="22.0.0"></a>
# [22.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v21.0.0...v22.0.0) (2018-05-20)


### Bug Fixes

* callback from unsub after stream ends ([51a80f2](https://github.com/ipfs/js-ipfs-http-client/commit/51a80f2))
* do not fail stop node if failed start node ([533760f](https://github.com/ipfs/js-ipfs-http-client/commit/533760f))
* **ping:** convert the ping messages to lowercase ([632af40](https://github.com/ipfs/js-ipfs-http-client/commit/632af40))
* more robust ping tests ([fc6d301](https://github.com/ipfs/js-ipfs-http-client/commit/fc6d301))
* remove .only ([0e21c8a](https://github.com/ipfs/js-ipfs-http-client/commit/0e21c8a))
* result.Peers can be null, ensure callback is called ([f5f2e83](https://github.com/ipfs/js-ipfs-http-client/commit/f5f2e83))
* update asserted error message ([17c1f1c](https://github.com/ipfs/js-ipfs-http-client/commit/17c1f1c))
* use async/setImmediate vs process.nextTick ([faa51b4](https://github.com/ipfs/js-ipfs-http-client/commit/faa51b4))



<a name="21.0.0"></a>
# [21.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v20.2.1...v21.0.0) (2018-05-12)


### Bug Fixes

* make pubsub.unsubscribe async and alter pubsub.subscribe signature ([b98f8f3](https://github.com/ipfs/js-ipfs-http-client/commit/b98f8f3))


### BREAKING CHANGES

* pubsub.unsubscribe is now async and argument order for pubsub.subscribe has changed

License: MIT
Signed-off-by: Alan Shaw <alan@tableflip.io>



<a name="20.2.1"></a>
## [20.2.1](https://github.com/ipfs/js-ipfs-http-client/compare/v20.2.0...v20.2.1) (2018-05-06)



<a name="20.2.0"></a>
# [20.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v20.0.1...v20.2.0) (2018-04-30)


### Bug Fixes

* adding files by pull stream ([2fa16c5](https://github.com/ipfs/js-ipfs-http-client/commit/2fa16c5))
* handle request errors in addFromURL ([7c5cea5](https://github.com/ipfs/js-ipfs-http-client/commit/7c5cea5))
* increase timeout for name.publish and fix setup code ([ceb1106](https://github.com/ipfs/js-ipfs-http-client/commit/ceb1106))
* ipfs add url wrap doesn't work ([#750](https://github.com/ipfs/js-ipfs-http-client/issues/750)) ([f6f1bf0](https://github.com/ipfs/js-ipfs-http-client/commit/f6f1bf0))


### Features

* Add offset/length arguments to files.cat ([17967c1](https://github.com/ipfs/js-ipfs-http-client/commit/17967c1))
* get it ready for release ([#751](https://github.com/ipfs/js-ipfs-http-client/issues/751)) ([1885af4](https://github.com/ipfs/js-ipfs-http-client/commit/1885af4))



<a name="20.1.0"></a>
# [20.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v20.0.1...v20.1.0) (2018-04-30)


### Bug Fixes

* adding files by pull stream ([2fa16c5](https://github.com/ipfs/js-ipfs-http-client/commit/2fa16c5))
* handle request errors in addFromURL ([7c5cea5](https://github.com/ipfs/js-ipfs-http-client/commit/7c5cea5))
* increase timeout for name.publish and fix setup code ([ceb1106](https://github.com/ipfs/js-ipfs-http-client/commit/ceb1106))
* ipfs add url wrap doesn't work ([#750](https://github.com/ipfs/js-ipfs-http-client/issues/750)) ([f6f1bf0](https://github.com/ipfs/js-ipfs-http-client/commit/f6f1bf0))


### Features

* Add offset/length arguments to files.cat ([17967c1](https://github.com/ipfs/js-ipfs-http-client/commit/17967c1))
* get it ready for release ([#751](https://github.com/ipfs/js-ipfs-http-client/issues/751)) ([1885af4](https://github.com/ipfs/js-ipfs-http-client/commit/1885af4))



<a name="20.0.1"></a>
## [20.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v20.0.0...v20.0.1) (2018-04-12)



<a name="20.0.0"></a>
# [20.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v19.0.0...v20.0.0) (2018-04-05)


### Bug Fixes

* **dag:** js-ipld format resolver take the raw block ([2683c7e](https://github.com/ipfs/js-ipfs-http-client/commit/2683c7e))
* **dag:** path logic for DAG get was wrong ([d2b203b](https://github.com/ipfs/js-ipfs-http-client/commit/d2b203b))
* **dag:** use SendOneFile for dag put ([9c37213](https://github.com/ipfs/js-ipfs-http-client/commit/9c37213))


### Features

* dag.put ([9463d3a](https://github.com/ipfs/js-ipfs-http-client/commit/9463d3a))
* **dag:** proper get implementation ([7ba0343](https://github.com/ipfs/js-ipfs-http-client/commit/7ba0343))
* **dag:** rebase, use waterfall for put ([ad9eab8](https://github.com/ipfs/js-ipfs-http-client/commit/ad9eab8))
* **dag:** update option names to reflect go-ipfs API ([9bf1c6c](https://github.com/ipfs/js-ipfs-http-client/commit/9bf1c6c))
* Provide access to bundled libraries when in browser ([#732](https://github.com/ipfs/js-ipfs-http-client/issues/732)) ([994bdad](https://github.com/ipfs/js-ipfs-http-client/commit/994bdad)), closes [#406](https://github.com/ipfs/js-ipfs-http-client/issues/406)
* public-readonly-method-for-getting-host-and-port ([41d32e3](https://github.com/ipfs/js-ipfs-http-client/commit/41d32e3)), closes [#580](https://github.com/ipfs/js-ipfs-http-client/issues/580)
* Wrap with dir ([#730](https://github.com/ipfs/js-ipfs-http-client/issues/730)) ([160860e](https://github.com/ipfs/js-ipfs-http-client/commit/160860e))



<a name="19.0.0"></a>
# [19.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v18.2.1...v19.0.0) (2018-03-28)


### Bug Fixes

* **bitswap:** 0.4.14 returns empty array instead of null ([5e37a54](https://github.com/ipfs/js-ipfs-http-client/commit/5e37a54))
* **ping:** tests were failing and there it was missing to catch when count and n are used at the same time ([2181568](https://github.com/ipfs/js-ipfs-http-client/commit/2181568))


### Features

* streamable ping and optional packet number ([#723](https://github.com/ipfs/js-ipfs-http-client/issues/723)) ([3f3ce8a](https://github.com/ipfs/js-ipfs-http-client/commit/3f3ce8a))



<a name="18.2.1"></a>
## [18.2.1](https://github.com/ipfs/js-ipfs-http-client/compare/v18.2.0...v18.2.1) (2018-03-22)


### Features

* add ability to files.cat with a cid instance ([aeeb94e](https://github.com/ipfs/js-ipfs-http-client/commit/aeeb94e))



<a name="18.2.0"></a>
# [18.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v18.1.2...v18.2.0) (2018-03-16)


### Bug Fixes

* disable Browser test on Windows ([385a6c3](https://github.com/ipfs/js-ipfs-http-client/commit/385a6c3))
* don't create one webpack bundle for every test file ([3967e96](https://github.com/ipfs/js-ipfs-http-client/commit/3967e96))
* last fixes for green ([#719](https://github.com/ipfs/js-ipfs-http-client/issues/719)) ([658bad2](https://github.com/ipfs/js-ipfs-http-client/commit/658bad2))
* set the FileResultStreamConverter explicitly ([dfad55e](https://github.com/ipfs/js-ipfs-http-client/commit/dfad55e)), closes [#696](https://github.com/ipfs/js-ipfs-http-client/issues/696)
* use a different remote server for test ([1fc15a5](https://github.com/ipfs/js-ipfs-http-client/commit/1fc15a5))


### Features

* --only-hash ([#717](https://github.com/ipfs/js-ipfs-http-client/issues/717)) ([1137401](https://github.com/ipfs/js-ipfs-http-client/commit/1137401)), closes [#700](https://github.com/ipfs/js-ipfs-http-client/issues/700)
* add support for ipfs files stat --with-local ([#695](https://github.com/ipfs/js-ipfs-http-client/issues/695)) ([b08f21a](https://github.com/ipfs/js-ipfs-http-client/commit/b08f21a))



<a name="18.1.2"></a>
## [18.1.2](https://github.com/ipfs/js-ipfs-http-client/compare/v18.1.1...v18.1.2) (2018-03-09)


### Bug Fixes

* regression on files.add and update deps ([#709](https://github.com/ipfs/js-ipfs-http-client/issues/709)) ([85cc2a8](https://github.com/ipfs/js-ipfs-http-client/commit/85cc2a8))
* remove argument from .stats.bw* ([#699](https://github.com/ipfs/js-ipfs-http-client/issues/699)) ([f81dce5](https://github.com/ipfs/js-ipfs-http-client/commit/f81dce5))



<a name="18.1.1"></a>
## [18.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v18.0.0...v18.1.1) (2018-02-20)


### Features

* support recursive ipfs ls  ([cfe95f6](https://github.com/ipfs/js-ipfs-http-client/commit/cfe95f6))



<a name="18.1.0"></a>
# [18.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v18.0.0...v18.1.0) (2018-02-20)


### Features

* support recursive ipfs ls  ([cfe95f6](https://github.com/ipfs/js-ipfs-http-client/commit/cfe95f6))



<a name="18.0.0"></a>
# [18.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.5.0...v18.0.0) (2018-02-14)


### Bug Fixes

* exception when dir is empty ([#680](https://github.com/ipfs/js-ipfs-http-client/issues/680)) ([ec04f6e](https://github.com/ipfs/js-ipfs-http-client/commit/ec04f6e))
* support all the Buffer shims and load fixtures correctly ([066988f](https://github.com/ipfs/js-ipfs-http-client/commit/066988f))
* update stats API ([#684](https://github.com/ipfs/js-ipfs-http-client/issues/684)) ([4f7999d](https://github.com/ipfs/js-ipfs-http-client/commit/4f7999d))


### Features

* (breaking change) stats spec, spec repo, stream to value on files read ([#679](https://github.com/ipfs/js-ipfs-http-client/issues/679)) ([118456e](https://github.com/ipfs/js-ipfs-http-client/commit/118456e))
* **breaking change:** use stream on stats.bw ([#686](https://github.com/ipfs/js-ipfs-http-client/issues/686)) ([895760e](https://github.com/ipfs/js-ipfs-http-client/commit/895760e))
* ipfs.stop ([5091115](https://github.com/ipfs/js-ipfs-http-client/commit/5091115))



<a name="17.5.0"></a>
# [17.5.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.3.0...v17.5.0) (2018-01-24)


### Bug Fixes

* normalize stats fields ([#669](https://github.com/ipfs/js-ipfs-http-client/issues/669)) ([5803d39](https://github.com/ipfs/js-ipfs-http-client/commit/5803d39))


### Features

* /api/v0/repo/version ([#676](https://github.com/ipfs/js-ipfs-http-client/issues/676)) ([ecf70b9](https://github.com/ipfs/js-ipfs-http-client/commit/ecf70b9))
* integrate new ipfsd-ctl ([2b1820b](https://github.com/ipfs/js-ipfs-http-client/commit/2b1820b))



<a name="17.4.0"></a>
# [17.4.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.3.0...v17.4.0) (2018-01-24)


### Bug Fixes

* normalize stats fields ([#669](https://github.com/ipfs/js-ipfs-http-client/issues/669)) ([5803d39](https://github.com/ipfs/js-ipfs-http-client/commit/5803d39))


### Features

* integrate new ipfsd-ctl ([2b1820b](https://github.com/ipfs/js-ipfs-http-client/commit/2b1820b))



<a name="17.3.0"></a>
# [17.3.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.7...v17.3.0) (2018-01-12)


### Features

* /api/v0/dns ([#665](https://github.com/ipfs/js-ipfs-http-client/issues/665)) ([81016bb](https://github.com/ipfs/js-ipfs-http-client/commit/81016bb))



<a name="17.2.7"></a>
## [17.2.7](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.6...v17.2.7) (2018-01-11)


### Bug Fixes

* name and key tests ([#661](https://github.com/ipfs/js-ipfs-http-client/issues/661)) ([5ab1d02](https://github.com/ipfs/js-ipfs-http-client/commit/5ab1d02))


### Features

* normalize KEY API ([#659](https://github.com/ipfs/js-ipfs-http-client/issues/659)) ([1b10821](https://github.com/ipfs/js-ipfs-http-client/commit/1b10821))
* normalize NAME API ([#658](https://github.com/ipfs/js-ipfs-http-client/issues/658)) ([9b8ef48](https://github.com/ipfs/js-ipfs-http-client/commit/9b8ef48))



<a name="17.2.6"></a>
## [17.2.6](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.5...v17.2.6) (2017-12-28)


### Features

* support key/export and key/import ([#653](https://github.com/ipfs/js-ipfs-http-client/issues/653)) ([496f08e](https://github.com/ipfs/js-ipfs-http-client/commit/496f08e))



<a name="17.2.5"></a>
## [17.2.5](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.4...v17.2.5) (2017-12-20)


### Bug Fixes

* **files.add:** handle weird directory names ([#646](https://github.com/ipfs/js-ipfs-http-client/issues/646)) ([012b86c](https://github.com/ipfs/js-ipfs-http-client/commit/012b86c))


### Features

* add files/flush ([#643](https://github.com/ipfs/js-ipfs-http-client/issues/643)) ([5c254eb](https://github.com/ipfs/js-ipfs-http-client/commit/5c254eb))
* support key/rm and key/rename ([#641](https://github.com/ipfs/js-ipfs-http-client/issues/641)) ([113030a](https://github.com/ipfs/js-ipfs-http-client/commit/113030a))



<a name="17.2.4"></a>
## [17.2.4](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.3...v17.2.4) (2017-12-06)


### Bug Fixes

* stats/bw uses stream ([#640](https://github.com/ipfs/js-ipfs-http-client/issues/640)) ([c4e922e](https://github.com/ipfs/js-ipfs-http-client/commit/c4e922e))



<a name="17.2.3"></a>
## [17.2.3](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.2...v17.2.3) (2017-12-05)



<a name="17.2.2"></a>
## [17.2.2](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.1...v17.2.2) (2017-12-05)



<a name="17.2.1"></a>
## [17.2.1](https://github.com/ipfs/js-ipfs-http-client/compare/v17.2.0...v17.2.1) (2017-12-05)


### Features

* add the stat commands ([#639](https://github.com/ipfs/js-ipfs-http-client/issues/639)) ([76c3068](https://github.com/ipfs/js-ipfs-http-client/commit/76c3068))



<a name="17.2.0"></a>
# [17.2.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.1.3...v17.2.0) (2017-12-01)


### Bug Fixes

* propagate trailer errors correctly ([#636](https://github.com/ipfs/js-ipfs-http-client/issues/636)) ([62d733e](https://github.com/ipfs/js-ipfs-http-client/commit/62d733e))



<a name="17.1.3"></a>
## [17.1.3](https://github.com/ipfs/js-ipfs-http-client/compare/v17.1.2...v17.1.3) (2017-11-23)



<a name="17.1.2"></a>
## [17.1.2](https://github.com/ipfs/js-ipfs-http-client/compare/v17.1.1...v17.1.2) (2017-11-22)


### Bug Fixes

* config.replace ([#634](https://github.com/ipfs/js-ipfs-http-client/issues/634)) ([79d79c5](https://github.com/ipfs/js-ipfs-http-client/commit/79d79c5)), closes [#633](https://github.com/ipfs/js-ipfs-http-client/issues/633)



<a name="17.1.1"></a>
## [17.1.1](https://github.com/ipfs/js-ipfs-http-client/compare/v17.1.0...v17.1.1) (2017-11-22)


### Bug Fixes

* pubsub do not eat error messages ([#632](https://github.com/ipfs/js-ipfs-http-client/issues/632)) ([5a1bf9b](https://github.com/ipfs/js-ipfs-http-client/commit/5a1bf9b))



<a name="17.1.0"></a>
# [17.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v17.0.1...v17.1.0) (2017-11-20)


### Features

* send files HTTP request should stream ([#629](https://github.com/ipfs/js-ipfs-http-client/issues/629)) ([dae62cb](https://github.com/ipfs/js-ipfs-http-client/commit/dae62cb))



<a name="17.0.1"></a>
## [17.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v17.0.0...v17.0.1) (2017-11-20)


### Bug Fixes

* allow topicCIDs from older peers ([#631](https://github.com/ipfs/js-ipfs-http-client/issues/631)) ([fe7cc22](https://github.com/ipfs/js-ipfs-http-client/commit/fe7cc22))



<a name="17.0.0"></a>
# [17.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v16.0.0...v17.0.0) (2017-11-17)


### Features

* Implementing the new interfaces ([#619](https://github.com/ipfs/js-ipfs-http-client/issues/619)) ([e1b38bf](https://github.com/ipfs/js-ipfs-http-client/commit/e1b38bf))



<a name="16.0.0"></a>
# [16.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v15.1.0...v16.0.0) (2017-11-16)


### Bug Fixes

* pubsub message fields ([#627](https://github.com/ipfs/js-ipfs-http-client/issues/627)) ([470777d](https://github.com/ipfs/js-ipfs-http-client/commit/470777d))



<a name="15.1.0"></a>
# [15.1.0](https://github.com/ipfs/js-ipfs-http-client/compare/v15.0.2...v15.1.0) (2017-11-14)


### Bug Fixes

* adapting HTTP API to the interface-ipfs-core spec ([#625](https://github.com/ipfs/js-ipfs-http-client/issues/625)) ([8e58225](https://github.com/ipfs/js-ipfs-http-client/commit/8e58225))


### Features

* windows interop ([#624](https://github.com/ipfs/js-ipfs-http-client/issues/624)) ([40557d0](https://github.com/ipfs/js-ipfs-http-client/commit/40557d0))



<a name="15.0.2"></a>
## [15.0.2](https://github.com/ipfs/js-ipfs-http-client/compare/v15.0.1...v15.0.2) (2017-11-13)



<a name="15.0.1"></a>
## [15.0.1](https://github.com/ipfs/js-ipfs-http-client/compare/v15.0.0...v15.0.1) (2017-10-22)



<a name="15.0.0"></a>
# [15.0.0](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.7...v15.0.0) (2017-10-22)


### Features

* update pin API to match interface-ipfs-core ([9102643](https://github.com/ipfs/js-ipfs-http-client/commit/9102643))



<a name="14.3.7"></a>
## [14.3.7](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.6...v14.3.7) (2017-10-18)



<a name="14.3.6"></a>
## [14.3.6](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.5...v14.3.6) (2017-10-18)


### Bug Fixes

* pass the config protocol to http requests ([#609](https://github.com/ipfs/js-ipfs-http-client/issues/609)) ([38d7289](https://github.com/ipfs/js-ipfs-http-client/commit/38d7289))


### Features

* avoid doing multiple RPC requests for files.add, fixes [#522](https://github.com/ipfs/js-ipfs-http-client/issues/522) ([#595](https://github.com/ipfs/js-ipfs-http-client/issues/595)) ([0ea5f57](https://github.com/ipfs/js-ipfs-http-client/commit/0ea5f57))
* report progress on ipfs add  ([e2d894c](https://github.com/ipfs/js-ipfs-http-client/commit/e2d894c))



<a name="14.3.5"></a>
## [14.3.5](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.4...v14.3.5) (2017-09-08)


### Features

* Support specify hash algorithm in files.add ([#597](https://github.com/ipfs/js-ipfs-http-client/issues/597)) ([ed68657](https://github.com/ipfs/js-ipfs-http-client/commit/ed68657))



<a name="14.3.4"></a>
## [14.3.4](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.3...v14.3.4) (2017-09-07)



<a name="14.3.3"></a>
## [14.3.3](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.2...v14.3.3) (2017-09-07)


### Features

* support options for .add / files.add  ([8c717b2](https://github.com/ipfs/js-ipfs-http-client/commit/8c717b2))



<a name="14.3.2"></a>
## [14.3.2](https://github.com/ipfs/js-ipfs-http-client/compare/v14.3.1...v14.3.2) (2017-09-04)


### Bug Fixes

* new fixed aegir ([93ac472](https://github.com/ipfs/js-ipfs-http-client/commit/93ac472))
