<a name="0.39.1"></a>
## [0.39.1](https://github.com/ipfs/js-ipfs/compare/v0.39.0...v0.39.1) (2019-12-02)


### Bug Fixes

* requires the ipfs-repo version with a fix for [#2629](https://github.com/ipfs/js-ipfs/issues/2629) at a minimum ([#2643](https://github.com/ipfs/js-ipfs/issues/2643)) ([d754abe](https://github.com/ipfs/js-ipfs/commit/d754abe))



<a name="0.39.0"></a>
# [0.39.0](https://github.com/ipfs/js-ipfs/compare/v0.39.0-rc.2...v0.39.0) (2019-10-23)



<a name="0.39.0-rc.2"></a>
# [0.39.0-rc.2](https://github.com/ipfs/js-ipfs/compare/v0.39.0-rc.1...v0.39.0-rc.2) (2019-10-17)


### Bug Fixes

* add profiles docs, support in validation and tests ([#2545](https://github.com/ipfs/js-ipfs/issues/2545)) ([e081e16](https://github.com/ipfs/js-ipfs/commit/e081e16))
* choose import strategy in ipfs.add ([#2541](https://github.com/ipfs/js-ipfs/issues/2541)) ([e2e6701](https://github.com/ipfs/js-ipfs/commit/e2e6701))
* fix ls crash ([#2546](https://github.com/ipfs/js-ipfs/issues/2546)) ([83eb99b](https://github.com/ipfs/js-ipfs/commit/83eb99b)), closes [ipfs/js-ipfs-unixfs-exporter#24](https://github.com/ipfs/js-ipfs-unixfs-exporter/issues/24)
* make init options look like go-ipfs ([#2544](https://github.com/ipfs/js-ipfs/issues/2544)) ([d4d6dfe](https://github.com/ipfs/js-ipfs/commit/d4d6dfe))



<a name="0.39.0-rc.1"></a>
# [0.39.0-rc.1](https://github.com/ipfs/js-ipfs/compare/v0.39.0-rc.0...v0.39.0-rc.1) (2019-10-15)



<a name="0.39.0-rc.0"></a>
# [0.39.0-rc.0](https://github.com/ipfs/js-ipfs/compare/v0.38.0...v0.39.0-rc.0) (2019-10-08)


### Bug Fixes

* limit concurrent HTTP requests in browser ([#2304](https://github.com/ipfs/js-ipfs/issues/2304)) ([cf38aea](https://github.com/ipfs/js-ipfs/commit/cf38aea))
* only try to get ipfs if argv is present ([#2504](https://github.com/ipfs/js-ipfs/issues/2504)) ([1281b9f](https://github.com/ipfs/js-ipfs/commit/1281b9f))
* pull in preconfigured chai from interface tests ([#2510](https://github.com/ipfs/js-ipfs/issues/2510)) ([8c01259](https://github.com/ipfs/js-ipfs/commit/8c01259))


### Features

* Add config profile endpoint and CLI ([#2165](https://github.com/ipfs/js-ipfs/issues/2165)) ([7314f0d](https://github.com/ipfs/js-ipfs/commit/7314f0d))
* allow daemon to init and start in a single cmd ([#2428](https://github.com/ipfs/js-ipfs/issues/2428)) ([16d5e7b](https://github.com/ipfs/js-ipfs/commit/16d5e7b))
* support block.rm over http api ([#2514](https://github.com/ipfs/js-ipfs/issues/2514)) ([c9be79e](https://github.com/ipfs/js-ipfs/commit/c9be79e))
* web ui 2.5.3 ([4f398fc](https://github.com/ipfs/js-ipfs/commit/4f398fc))
* web ui 2.5.4 ([#2478](https://github.com/ipfs/js-ipfs/issues/2478)) ([bff402c](https://github.com/ipfs/js-ipfs/commit/bff402c))


### Reverts

* e ([55c4446](https://github.com/ipfs/js-ipfs/commit/55c4446))



<a name="0.38.0"></a>
# [0.38.0](https://github.com/ipfs/js-ipfs/compare/v0.38.0-rc.6...v0.38.0) (2019-09-30)



<a name="0.38.0-rc.6"></a>
# [0.38.0-rc.6](https://github.com/ipfs/js-ipfs/compare/v0.38.0-rc.5...v0.38.0-rc.6) (2019-09-25)



<a name="0.38.0-rc.5"></a>
# [0.38.0-rc.5](https://github.com/ipfs/js-ipfs/compare/v0.38.0-rc.4...v0.38.0-rc.5) (2019-09-18)



<a name="0.38.0-rc.4"></a>
# [0.38.0-rc.4](https://github.com/ipfs/js-ipfs/compare/v0.38.0-rc.3...v0.38.0-rc.4) (2019-09-17)



<a name="0.38.0-rc.3"></a>
# [0.38.0-rc.3](https://github.com/ipfs/js-ipfs/compare/v0.38.0-rc.2...v0.38.0-rc.3) (2019-09-17)



<a name="0.38.0-rc.2"></a>
# [0.38.0-rc.2](https://github.com/ipfs/js-ipfs/compare/v0.38.0-rc.1...v0.38.0-rc.2) (2019-09-16)



# [0.38.0-rc.1](https://github.com/ipfs/js-ipfs/compare/v0.38.0-rc.0...v0.38.0-rc.1) (2019-09-13)



<a name="0.38.0-rc.0"></a>
# [0.38.0-rc.0](https://github.com/ipfs/js-ipfs/compare/v0.38.0-pre.1...v0.38.0-rc.0) (2019-09-09)


### Bug Fixes

* **tests:** remove Math.random from  tests ([#2431](https://github.com/ipfs/js-ipfs/issues/2431)) ([60bf020](https://github.com/ipfs/js-ipfs/commit/60bf020))


### Features

* add support for ipns and recursive to ipfs resolve ([#2297](https://github.com/ipfs/js-ipfs/issues/2297)) ([039675e](https://github.com/ipfs/js-ipfs/commit/039675e))
* enable pubsub via config file and enabled by default ([#2427](https://github.com/ipfs/js-ipfs/issues/2427)) ([27751cf](https://github.com/ipfs/js-ipfs/commit/27751cf)), closes [ipfs/js-ipfsd-ctl#366](https://github.com/ipfs/js-ipfsd-ctl/issues/366) [ipfs/go-ipfs#6621](https://github.com/ipfs/go-ipfs/issues/6621)
* support adding async iterators ([#2379](https://github.com/ipfs/js-ipfs/issues/2379)) ([3878f0f](https://github.com/ipfs/js-ipfs/commit/3878f0f))
* web ui 2.5.1 ([#2434](https://github.com/ipfs/js-ipfs/issues/2434)) ([39ef553](https://github.com/ipfs/js-ipfs/commit/39ef553))


### BREAKING CHANGES

* pubsub is now enabled by default and the experimental flag was removed
* `recursive` is now `true` by default in `ipfs resolve`



<a name="0.38.0-pre.1"></a>
# [0.38.0-pre.1](https://github.com/ipfs/js-ipfs/compare/v0.38.0-pre.0...v0.38.0-pre.1) (2019-09-02)


### Bug Fixes

* **package:** update ipfs-http-client to version 34.0.0 ([#2407](https://github.com/ipfs/js-ipfs/issues/2407)) ([f7e5094](https://github.com/ipfs/js-ipfs/commit/f7e5094))


### Features

* gossipsub as default pubsub ([#2298](https://github.com/ipfs/js-ipfs/issues/2298)) ([902e045](https://github.com/ipfs/js-ipfs/commit/902e045))


### Reverts

* update of ipfs-http-client ([#2412](https://github.com/ipfs/js-ipfs/issues/2412)) ([f6cf876](https://github.com/ipfs/js-ipfs/commit/f6cf876))


### BREAKING CHANGES

* The default pubsub implementation has changed from floodsub to [gossipsub](https://github.com/ChainSafe/gossipsub-js). Additionally, to enable pubsub programmatically set `pubsub.enabled: true` instead of `EXPERIMENTAL.pubsub: true` or via the CLI pass `--enable-pubsub` instead of `--enable-pubsub-experiment` to `jsipfs daemon`.



<a name="0.38.0-pre.0"></a>
# [0.38.0-pre.0](https://github.com/ipfs/js-ipfs/compare/v0.37.1...v0.38.0-pre.0) (2019-08-27)


### Bug Fixes

* make progress bar work again when adding files ([#2386](https://github.com/ipfs/js-ipfs/issues/2386)) ([f6dcb0f](https://github.com/ipfs/js-ipfs/commit/f6dcb0f)), closes [#2379](https://github.com/ipfs/js-ipfs/issues/2379)
* really allow logo to appear on npm ([02e521e](https://github.com/ipfs/js-ipfs/commit/02e521e))


### Features

* garbage collection ([#2022](https://github.com/ipfs/js-ipfs/issues/2022)) ([44045b0](https://github.com/ipfs/js-ipfs/commit/44045b0))


### BREAKING CHANGES

* Order of output from the CLI command `ipfs add` may change between invocations given the same files since it is not longer buffered and sorted.

Previously, js-ipfs buffered all hashes of added files and sorted them before outputting to the terminal, this might be because the `glob` module does not return stable results.  This gives a poor user experience as you see nothing then everything, compared to `go-ipfs` which prints out the hashes as they become available.  The tradeoff is the order might be slightly different between invocations, though the hashes are always the same as we sort DAGNode links before serializing so it doesn't matter what order you import them in.



<a name="0.37.1"></a>
## [0.37.1](https://github.com/ipfs/js-ipfs/compare/v0.37.0...v0.37.1) (2019-08-23)


### Bug Fixes

* create HTTP servers in series ([#2388](https://github.com/ipfs/js-ipfs/issues/2388)) ([970a269](https://github.com/ipfs/js-ipfs/commit/970a269))
* enable preload on MFS commands that accept IPFS paths ([#2355](https://github.com/ipfs/js-ipfs/issues/2355)) ([0e0d1dd](https://github.com/ipfs/js-ipfs/commit/0e0d1dd))
* **package:** update yargs to version 14.0.0 ([#2371](https://github.com/ipfs/js-ipfs/issues/2371)) ([5aadb2d](https://github.com/ipfs/js-ipfs/commit/5aadb2d))
* do not load all of a DAG into memory when pinning ([#2372](https://github.com/ipfs/js-ipfs/issues/2372)) ([f357c28](https://github.com/ipfs/js-ipfs/commit/f357c28)), closes [#2310](https://github.com/ipfs/js-ipfs/issues/2310)
* preload addreses with trailing slash ([#2377](https://github.com/ipfs/js-ipfs/issues/2377)) ([c607971](https://github.com/ipfs/js-ipfs/commit/c607971)), closes [#2333](https://github.com/ipfs/js-ipfs/issues/2333)


### Features

* allow controlling preload from cli and http api ([#2384](https://github.com/ipfs/js-ipfs/issues/2384)) ([5878a0a](https://github.com/ipfs/js-ipfs/commit/5878a0a))
* resolution of .eth names via .eth.link ([#2373](https://github.com/ipfs/js-ipfs/issues/2373)) ([7e02140](https://github.com/ipfs/js-ipfs/commit/7e02140))



<a name="0.37.0"></a>
# [0.37.0](https://github.com/ipfs/js-ipfs/compare/v0.37.0-rc.1...v0.37.0) (2019-08-06)



<a name="0.37.0-rc.1"></a>
# [0.37.0-rc.1](https://github.com/ipfs/js-ipfs/compare/v0.37.0-rc.0...v0.37.0-rc.1) (2019-08-06)


### Bug Fixes

* add CORS headers to gateway responses ([#2254](https://github.com/ipfs/js-ipfs/issues/2254)) ([5156a47](https://github.com/ipfs/js-ipfs/commit/5156a47))
* disable socket timeout for pubsub subscriptions ([#2303](https://github.com/ipfs/js-ipfs/issues/2303)) ([3583cc2](https://github.com/ipfs/js-ipfs/commit/3583cc2))
* move mfs cmds and safer exit ([#1981](https://github.com/ipfs/js-ipfs/issues/1981)) ([fee0141](https://github.com/ipfs/js-ipfs/commit/fee0141))
* swarm.peers latency value when unknown ([#2336](https://github.com/ipfs/js-ipfs/issues/2336)) ([6248ec1](https://github.com/ipfs/js-ipfs/commit/6248ec1))
* use ephemeral ports in API/Gateway bind test ([#2305](https://github.com/ipfs/js-ipfs/issues/2305)) ([24679af](https://github.com/ipfs/js-ipfs/commit/24679af))
* **package:** update ipfs-mfs to version 0.12.0 ([#2275](https://github.com/ipfs/js-ipfs/issues/2275)) ([c15f146](https://github.com/ipfs/js-ipfs/commit/c15f146))



<a name="0.37.0-rc.0"></a>
# [0.37.0-rc.0](https://github.com/ipfs/js-ipfs/compare/v0.36.4...v0.37.0-rc.0) (2019-07-17)


### Bug Fixes

* allow setting Addresses.Delegates ([#2253](https://github.com/ipfs/js-ipfs/issues/2253)) ([58a9bc4](https://github.com/ipfs/js-ipfs/commit/58a9bc4))
* browser video streaming example ([#2267](https://github.com/ipfs/js-ipfs/issues/2267)) ([f5cf216](https://github.com/ipfs/js-ipfs/commit/f5cf216))
* clean repo func on windows ([#2243](https://github.com/ipfs/js-ipfs/issues/2243)) ([26b92a1](https://github.com/ipfs/js-ipfs/commit/26b92a1))
* failing test on config ([#2205](https://github.com/ipfs/js-ipfs/issues/2205)) ([5ed9532](https://github.com/ipfs/js-ipfs/commit/5ed9532))
* ipns reference to libp2p dht config ([#2182](https://github.com/ipfs/js-ipfs/issues/2182)) ([e46e6ad](https://github.com/ipfs/js-ipfs/commit/e46e6ad))
* passed config validation ([#2270](https://github.com/ipfs/js-ipfs/issues/2270)) ([80e7d81](https://github.com/ipfs/js-ipfs/commit/80e7d81))
* pin type filtering in pin.ls ([#2228](https://github.com/ipfs/js-ipfs/issues/2228)) ([afdfe7f](https://github.com/ipfs/js-ipfs/commit/afdfe7f))
* **gateway:** disable compression ([#2245](https://github.com/ipfs/js-ipfs/issues/2245)) ([4ee28e0](https://github.com/ipfs/js-ipfs/commit/4ee28e0))
* **package:** update file-type to version 12.0.0 ([#2176](https://github.com/ipfs/js-ipfs/issues/2176)) ([3e63ef2](https://github.com/ipfs/js-ipfs/commit/3e63ef2))


### Code Refactoring

* **gateway:** return implicit index.html ([#2217](https://github.com/ipfs/js-ipfs/issues/2217)) ([8519886](https://github.com/ipfs/js-ipfs/commit/8519886))


### Features

* add delegate routers to libp2p config ([#2195](https://github.com/ipfs/js-ipfs/issues/2195)) ([1aaaab9](https://github.com/ipfs/js-ipfs/commit/1aaaab9))
* add HTTP Gateway support for /ipns/ paths  ([#2020](https://github.com/ipfs/js-ipfs/issues/2020)) ([43ac305](https://github.com/ipfs/js-ipfs/commit/43ac305)), closes [#1989](https://github.com/ipfs/js-ipfs/issues/1989)
* add support for ipns name resolve /ipns/<fqdn> ([#2002](https://github.com/ipfs/js-ipfs/issues/2002)) ([5044a30](https://github.com/ipfs/js-ipfs/commit/5044a30)), closes [#1918](https://github.com/ipfs/js-ipfs/issues/1918)
* randomly pick preload node ([#2194](https://github.com/ipfs/js-ipfs/issues/2194)) ([f596b01](https://github.com/ipfs/js-ipfs/commit/f596b01))
* ready promise ([#2094](https://github.com/ipfs/js-ipfs/issues/2094)) ([e0994f2](https://github.com/ipfs/js-ipfs/commit/e0994f2))
* update Web UI to v2.4.6 ([#2147](https://github.com/ipfs/js-ipfs/issues/2147)) ([a1a9fe3](https://github.com/ipfs/js-ipfs/commit/a1a9fe3))


### BREAKING CHANGES

* **gateway:** Gateway now implicitly responds with the contents of `/index.html` when accessing a directory `/` instead of redirecting to `/index.html`.

This changes current logic (redirect to index.html) to match what
go-ipfs does (return index.html without changing URL)

We also ensure directory URLs always end with '/'

License: MIT
Signed-off-by: Marcin Rataj <lidel@lidel.org>



<a name="0.36.4"></a>
## [0.36.4](https://github.com/ipfs/js-ipfs/compare/v0.36.3...v0.36.4) (2019-06-18)



<a name="0.36.3"></a>
## [0.36.3](https://github.com/ipfs/js-ipfs/compare/v0.36.2...v0.36.3) (2019-05-30)


### Bug Fixes

* double callback in object.links for cbor data ([#2111](https://github.com/ipfs/js-ipfs/issues/2111)) ([5d080c0](https://github.com/ipfs/js-ipfs/commit/5d080c0))
* fixes rabin chunker truncating files ([#2114](https://github.com/ipfs/js-ipfs/issues/2114)) ([76689ff](https://github.com/ipfs/js-ipfs/commit/76689ff))
* **package:** update bignumber.js to version 9.0.0 ([#2123](https://github.com/ipfs/js-ipfs/issues/2123)) ([37903ad](https://github.com/ipfs/js-ipfs/commit/37903ad))



<a name="0.36.2"></a>
## [0.36.2](https://github.com/ipfs/js-ipfs/compare/v0.36.1...v0.36.2) (2019-05-24)


### Bug Fixes

* file support when added as object ([#2105](https://github.com/ipfs/js-ipfs/issues/2105)) ([ba80e40](https://github.com/ipfs/js-ipfs/commit/ba80e40))
* upgrade electron examples ([#2104](https://github.com/ipfs/js-ipfs/issues/2104)) ([67e1b59](https://github.com/ipfs/js-ipfs/commit/67e1b59))



<a name="0.36.1"></a>
## [0.36.1](https://github.com/ipfs/js-ipfs/compare/v0.36.0...v0.36.1) (2019-05-22)


### Bug Fixes

* **cli:** make swarm addrs more resilient ([#2083](https://github.com/ipfs/js-ipfs/issues/2083)) ([3792b68](https://github.com/ipfs/js-ipfs/commit/3792b68))



<a name="0.36.0"></a>
# [0.36.0](https://github.com/ipfs/js-ipfs/compare/v0.36.0-rc.0...v0.36.0) (2019-05-22)


### Bug Fixes

* use trickle builder in daemon mode too ([#2085](https://github.com/ipfs/js-ipfs/issues/2085)) ([62b873f](https://github.com/ipfs/js-ipfs/commit/62b873f))
* **package:** update libp2p-kad-dht to version 0.15.0 ([#2049](https://github.com/ipfs/js-ipfs/issues/2049)) ([5905760](https://github.com/ipfs/js-ipfs/commit/5905760))
* browser-mfs example ([#2089](https://github.com/ipfs/js-ipfs/issues/2089)) ([e7d6d3a](https://github.com/ipfs/js-ipfs/commit/e7d6d3a))
* error when preloding is disabled in the browser ([#2086](https://github.com/ipfs/js-ipfs/issues/2086)) ([a56bcbf](https://github.com/ipfs/js-ipfs/commit/a56bcbf))
* traverse-ipld-graphs (tree) example ([#2088](https://github.com/ipfs/js-ipfs/issues/2088)) ([b5c652f](https://github.com/ipfs/js-ipfs/commit/b5c652f))
* update option in exchange files in browser example ([#2087](https://github.com/ipfs/js-ipfs/issues/2087)) ([63469ed](https://github.com/ipfs/js-ipfs/commit/63469ed))



<a name="0.36.0-rc.0"></a>
# [0.36.0-rc.0](https://github.com/ipfs/js-ipfs/compare/v0.36.0-pre.0...v0.36.0-rc.0) (2019-05-21)


### Code Refactoring

* update ipld formats, async/await mfs/unixfs & base32 cids ([#2068](https://github.com/ipfs/js-ipfs/issues/2068)) ([813048f](https://github.com/ipfs/js-ipfs/commit/813048f)), closes [ipld/js-ipld-dag-pb#137](https://github.com/ipld/js-ipld-dag-pb/issues/137) [ipfs/interface-js-ipfs-core#473](https://github.com/ipfs/interface-js-ipfs-core/issues/473) [ipfs/js-ipfs-http-client#1010](https://github.com/ipfs/js-ipfs-http-client/issues/1010) [ipfs/js-ipfs-http-response#25](https://github.com/ipfs/js-ipfs-http-response/issues/25) [#1995](https://github.com/ipfs/js-ipfs/issues/1995)


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



<a name="0.36.0-pre.0"></a>
# [0.36.0-pre.0](https://github.com/ipfs/js-ipfs/compare/v0.35.0...v0.36.0-pre.0) (2019-05-17)


### Bug Fixes

* **package:** update ipfs-http-client to version 31.0.0 ([#2052](https://github.com/ipfs/js-ipfs/issues/2052)) ([906f8d0](https://github.com/ipfs/js-ipfs/commit/906f8d0))
* correctly validate ipld config ([#2033](https://github.com/ipfs/js-ipfs/issues/2033)) ([eebc17a](https://github.com/ipfs/js-ipfs/commit/eebc17a))
* **package:** update hapi-pino to version 6.0.0 ([#2043](https://github.com/ipfs/js-ipfs/issues/2043)) ([f4e3bd0](https://github.com/ipfs/js-ipfs/commit/f4e3bd0))


### Features

* add support for File DOM API to files-regular ([#2013](https://github.com/ipfs/js-ipfs/issues/2013)) ([0a08192](https://github.com/ipfs/js-ipfs/commit/0a08192))
* implement ipfs refs and refs local ([#2004](https://github.com/ipfs/js-ipfs/issues/2004)) ([6dc9075](https://github.com/ipfs/js-ipfs/commit/6dc9075))
* **gateway:** add streaming, conditional and range requests ([#1989](https://github.com/ipfs/js-ipfs/issues/1989)) ([48a8e75](https://github.com/ipfs/js-ipfs/commit/48a8e75))



<a name="0.35.0"></a>
# [0.35.0](https://github.com/ipfs/js-ipfs/compare/v0.35.0-rc.7...v0.35.0) (2019-04-12)



<a name="0.35.0-rc.7"></a>
# [0.35.0-rc.7](https://github.com/ipfs/js-ipfs/compare/v0.35.0-rc.6...v0.35.0-rc.7) (2019-04-12)


### Bug Fixes

* flakey windows test ([#1987](https://github.com/ipfs/js-ipfs/issues/1987)) ([9708c0a](https://github.com/ipfs/js-ipfs/commit/9708c0a))
* really disable DHT ([#1991](https://github.com/ipfs/js-ipfs/issues/1991)) ([2470be8](https://github.com/ipfs/js-ipfs/commit/2470be8))
* remove non default ipld formats in the browser ([#1980](https://github.com/ipfs/js-ipfs/issues/1980)) ([4376121](https://github.com/ipfs/js-ipfs/commit/4376121))


### BREAKING CHANGES

* Browser application bundles now include only `ipld-dag-pb`, `ipld-dag-cbor` and `ipld-raw` IPLD codecs. Other codecs should be added manually, see https://github.com/ipfs/js-ipfs/blob/master/README.md#optionsipld for details.

* In Node.js `require('ipfs')`
    * all IPLD formats included
* In browser application bundle `require('ipfs')` bundled with webpack/browserify/etc.
    * only `ipld-dag-pb`, `ipld-dag-cbor` and `ipld-raw` included
* CDN bundle `<script src="https://unpkg.com/ipfs/dist/index.min.js"></script>`
    * all IPLD formats included

Co-Authored-By: hugomrdias <mail@hugodias.me>



<a name="0.35.0-rc.6"></a>
# [0.35.0-rc.6](https://github.com/ipfs/js-ipfs/compare/v0.35.0-rc.5...v0.35.0-rc.6) (2019-04-11)


### Bug Fixes

* avoid logging http errors when its logger is not on ([#1977](https://github.com/ipfs/js-ipfs/issues/1977)) ([20beea2](https://github.com/ipfs/js-ipfs/commit/20beea2))


### Features

* recursive dnslink lookups ([#1935](https://github.com/ipfs/js-ipfs/issues/1935)) ([d5a1b89](https://github.com/ipfs/js-ipfs/commit/d5a1b89))
* use libp2p auto dial ([#1983](https://github.com/ipfs/js-ipfs/issues/1983)) ([7f1fb26](https://github.com/ipfs/js-ipfs/commit/7f1fb26))



<a name="0.35.0-rc.5"></a>
# [0.35.0-rc.5](https://github.com/ipfs/js-ipfs/compare/v0.35.0-rc.4...v0.35.0-rc.5) (2019-04-04)


### Bug Fixes

* force browserify to load Buffer module ([#1969](https://github.com/ipfs/js-ipfs/issues/1969)) ([3654e50](https://github.com/ipfs/js-ipfs/commit/3654e50))
* stop IPNS republisher ASAP ([#1976](https://github.com/ipfs/js-ipfs/issues/1976)) ([68561c8](https://github.com/ipfs/js-ipfs/commit/68561c8))
* update link for multihashes ([#1975](https://github.com/ipfs/js-ipfs/issues/1975)) ([4a01bf6](https://github.com/ipfs/js-ipfs/commit/4a01bf6))


### Features

* expose multihashing-async along with other deps ([#1974](https://github.com/ipfs/js-ipfs/issues/1974)) ([6667966](https://github.com/ipfs/js-ipfs/commit/6667966)), closes [#1973](https://github.com/ipfs/js-ipfs/issues/1973)



<a name="0.35.0-rc.4"></a>
# [0.35.0-rc.4](https://github.com/ipfs/js-ipfs/compare/v0.35.0-rc.3...v0.35.0-rc.4) (2019-03-28)


### Bug Fixes

* CLI parsing of --silent arg ([#1955](https://github.com/ipfs/js-ipfs/issues/1955)) ([1c07779](https://github.com/ipfs/js-ipfs/commit/1c07779)), closes [#1947](https://github.com/ipfs/js-ipfs/issues/1947)


### Code Refactoring

* swap joi-browser with superstruct ([#1961](https://github.com/ipfs/js-ipfs/issues/1961)) ([8fb5825](https://github.com/ipfs/js-ipfs/commit/8fb5825))


### Performance Improvements

* reduce bundle size ([#1959](https://github.com/ipfs/js-ipfs/issues/1959)) ([a3b6235](https://github.com/ipfs/js-ipfs/commit/a3b6235))


### BREAKING CHANGES

* Constructor config validation is now a bit more strict - it does not allow `null` values or unknown properties.



<a name="0.35.0-rc.3"></a>
# [0.35.0-rc.3](https://github.com/ipfs/js-ipfs/compare/v0.35.0-rc.2...v0.35.0-rc.3) (2019-03-21)


### Bug Fixes

* name resolve arg parsing ([#1958](https://github.com/ipfs/js-ipfs/issues/1958)) ([924690e](https://github.com/ipfs/js-ipfs/commit/924690e))



<a name="0.35.0-rc.2"></a>
# [0.35.0-rc.2](https://github.com/ipfs/js-ipfs/compare/v0.35.0-rc.1...v0.35.0-rc.2) (2019-03-21)



<a name="0.35.0-rc.1"></a>
# [0.35.0-rc.1](https://github.com/ipfs/js-ipfs/compare/v0.35.0-rc.0...v0.35.0-rc.1) (2019-03-20)


### Bug Fixes

* cat deeply nested file ([#1920](https://github.com/ipfs/js-ipfs/issues/1920)) ([dcb453a](https://github.com/ipfs/js-ipfs/commit/dcb453a))
* handle subdomains for ipfs.dns ([#1933](https://github.com/ipfs/js-ipfs/issues/1933)) ([29072a5](https://github.com/ipfs/js-ipfs/commit/29072a5))
* only dial to unconnected peers ([#1914](https://github.com/ipfs/js-ipfs/issues/1914)) ([1478652](https://github.com/ipfs/js-ipfs/commit/1478652))


### Features

* add HTTP DAG API ([#1930](https://github.com/ipfs/js-ipfs/issues/1930)) ([a033e8b](https://github.com/ipfs/js-ipfs/commit/a033e8b))
* display version info when starting daemon ([#1915](https://github.com/ipfs/js-ipfs/issues/1915)) ([6b789ee](https://github.com/ipfs/js-ipfs/commit/6b789ee))
* provide access to multicodec ([#1921](https://github.com/ipfs/js-ipfs/issues/1921)) ([ceec0bc](https://github.com/ipfs/js-ipfs/commit/ceec0bc)), closes [#1913](https://github.com/ipfs/js-ipfs/issues/1913)
* **issue-1852:** support multiple API and Gateway addresses ([#1903](https://github.com/ipfs/js-ipfs/issues/1903)) ([4ad104d](https://github.com/ipfs/js-ipfs/commit/4ad104d)), closes [#1852](https://github.com/ipfs/js-ipfs/issues/1852)


### Performance Improvements

* lower connection manager limits ([#1926](https://github.com/ipfs/js-ipfs/issues/1926)) ([7926349](https://github.com/ipfs/js-ipfs/commit/7926349))



<a name="0.35.0-rc.0"></a>
# [0.35.0-rc.0](https://github.com/ipfs/js-ipfs/compare/v0.35.0-pre.0...v0.35.0-rc.0) (2019-03-06)


### Bug Fixes

* add support for resolving to the middle of an IPLD block ([#1841](https://github.com/ipfs/js-ipfs/issues/1841)) ([fc08243](https://github.com/ipfs/js-ipfs/commit/fc08243))
* dht browser disabled ([#1879](https://github.com/ipfs/js-ipfs/issues/1879)) ([7c5a843](https://github.com/ipfs/js-ipfs/commit/7c5a843))
* ipv6 multiaddr in stdout ([#1854](https://github.com/ipfs/js-ipfs/issues/1854)) ([35fd541](https://github.com/ipfs/js-ipfs/commit/35fd541)), closes [#1853](https://github.com/ipfs/js-ipfs/issues/1853)
* make clear pins function in tests serial ([#1910](https://github.com/ipfs/js-ipfs/issues/1910)) ([503e5ac](https://github.com/ipfs/js-ipfs/commit/503e5ac)), closes [#1890](https://github.com/ipfs/js-ipfs/issues/1890)
* pin.rm test EPERM rename ([#1889](https://github.com/ipfs/js-ipfs/issues/1889)) ([c60de74](https://github.com/ipfs/js-ipfs/commit/c60de74))
* temporarily disable random walk dht discovery ([#1907](https://github.com/ipfs/js-ipfs/issues/1907)) ([3fff46a](https://github.com/ipfs/js-ipfs/commit/3fff46a))


### Code Refactoring

* export types and utilities statically ([#1908](https://github.com/ipfs/js-ipfs/issues/1908)) ([79d7fef](https://github.com/ipfs/js-ipfs/commit/79d7fef))


### Features

* add `--enable-preload` to enable/disable preloading for daemons ([#1909](https://github.com/ipfs/js-ipfs/issues/1909)) ([9470900](https://github.com/ipfs/js-ipfs/commit/9470900))
* limit connections number ([#1872](https://github.com/ipfs/js-ipfs/issues/1872)) ([bebce7f](https://github.com/ipfs/js-ipfs/commit/bebce7f))


### BREAKING CHANGES

* `ipfs.util.isIPFS` and `ipfs.util.crypto` have moved to static exports and should be accessed via `const { isIPFS, crypto } = require('ipfs')`.

The modules available under `ipfs.types.*` have also become static exports.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>
* `ipfs.resolve` now supports resolving to the middle of an IPLD block instead of erroring.

Given:

```js
b = {"c": "some value"}
a = {"b": {"/": cidOf(b) }}
```

`ipfs resolve /ipld/cidOf(a)/b/c` should return `/ipld/cidOf(b)/c`. That is, it resolves the path as much as it can.

Previously it would simply fail with an error.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>



<a name="0.35.0-pre.0"></a>
# [0.35.0-pre.0](https://github.com/ipfs/js-ipfs/compare/v0.34.4...v0.35.0-pre.0) (2019-02-11)


### Bug Fixes

* add missing libp2p-websocket-star dep ([#1869](https://github.com/ipfs/js-ipfs/issues/1869)) ([7cba3dd](https://github.com/ipfs/js-ipfs/commit/7cba3dd))
* path to cid-tool commands ([#1866](https://github.com/ipfs/js-ipfs/issues/1866)) ([506f5be](https://github.com/ipfs/js-ipfs/commit/506f5be))
* swallowed errors ([#1860](https://github.com/ipfs/js-ipfs/issues/1860)) ([47e2b9e](https://github.com/ipfs/js-ipfs/commit/47e2b9e)), closes [#1835](https://github.com/ipfs/js-ipfs/issues/1835) [#1858](https://github.com/ipfs/js-ipfs/issues/1858)


### Chores

* rename local option to offline ([#1850](https://github.com/ipfs/js-ipfs/issues/1850)) ([bbe561b](https://github.com/ipfs/js-ipfs/commit/bbe561b))


### Features

* interoperable DHT ([#856](https://github.com/ipfs/js-ipfs/issues/856)) ([77a0957](https://github.com/ipfs/js-ipfs/commit/77a0957))


### BREAKING CHANGES

* `--local` option has been renamed to `--offline`



<a name="0.34.4"></a>
## [0.34.4](https://github.com/ipfs/js-ipfs/compare/v0.34.3...v0.34.4) (2019-01-24)


### Features

* support _dnslink subdomain specified dnslinks ([#1843](https://github.com/ipfs/js-ipfs/issues/1843)) ([a17253e](https://github.com/ipfs/js-ipfs/commit/a17253e))



<a name="0.34.3"></a>
## [0.34.3](https://github.com/ipfs/js-ipfs/compare/v0.34.2...v0.34.3) (2019-01-24)


### Bug Fixes

* add cors support for preload-mock-server and update aegir ([#1839](https://github.com/ipfs/js-ipfs/issues/1839)) ([2d45c9d](https://github.com/ipfs/js-ipfs/commit/2d45c9d))



<a name="0.34.2"></a>
## [0.34.2](https://github.com/ipfs/js-ipfs/compare/v0.34.1...v0.34.2) (2019-01-21)


### Bug Fixes

* race condition causing Database is not open error ([#1834](https://github.com/ipfs/js-ipfs/issues/1834)) ([6066c97](https://github.com/ipfs/js-ipfs/commit/6066c97))


### Features

* use ws-star-multi instead of ws-star ([#1793](https://github.com/ipfs/js-ipfs/issues/1793)) ([21fd4d1](https://github.com/ipfs/js-ipfs/commit/21fd4d1))



<a name="0.34.1"></a>
## [0.34.1](https://github.com/ipfs/js-ipfs/compare/v0.34.0...v0.34.1) (2019-01-21)


### Features

* pipe to add ([#1833](https://github.com/ipfs/js-ipfs/issues/1833)) ([ea53071](https://github.com/ipfs/js-ipfs/commit/ea53071))



<a name="0.34.0"></a>
# [0.34.0](https://github.com/ipfs/js-ipfs/compare/v0.34.0-rc.1...v0.34.0) (2019-01-17)



<a name="0.34.0-rc.1"></a>
# [0.34.0-rc.1](https://github.com/ipfs/js-ipfs/compare/v0.34.0-rc.0...v0.34.0-rc.1) (2019-01-15)


### Bug Fixes

* sharness tests ([#1787](https://github.com/ipfs/js-ipfs/issues/1787)) ([48d3e2b](https://github.com/ipfs/js-ipfs/commit/48d3e2b))


### Code Refactoring

* switch to bignumber.js ([#1803](https://github.com/ipfs/js-ipfs/issues/1803)) ([6de6adf](https://github.com/ipfs/js-ipfs/commit/6de6adf))


### Features

* update to Web UI v2.3.2 ([#1807](https://github.com/ipfs/js-ipfs/issues/1807)) ([8ca6471](https://github.com/ipfs/js-ipfs/commit/8ca6471))
* update Web UI to v2.3.0 ([#1786](https://github.com/ipfs/js-ipfs/issues/1786)) ([7bcc496](https://github.com/ipfs/js-ipfs/commit/7bcc496))


### BREAKING CHANGES

* All API methods that returned [`big.js`](https://github.com/MikeMcl/big.js/) instances now return [`bignumber.js`](https://github.com/MikeMcl/bignumber.js/) instances.

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>



<a name="0.34.0-rc.0"></a>
# [0.34.0-rc.0](https://github.com/ipfs/js-ipfs/compare/v0.34.0-pre.0...v0.34.0-rc.0) (2018-12-18)


### Bug Fixes

* link to Github profile for David Dias ([3659d7e](https://github.com/ipfs/js-ipfs/commit/3659d7e))
* streaming cat over http api ([#1760](https://github.com/ipfs/js-ipfs/issues/1760)) ([3ded576](https://github.com/ipfs/js-ipfs/commit/3ded576))


### Features

* add `addFromFs` method ([#1777](https://github.com/ipfs/js-ipfs/issues/1777)) ([7315aa1](https://github.com/ipfs/js-ipfs/commit/7315aa1))
* add from url/stream ([#1773](https://github.com/ipfs/js-ipfs/issues/1773)) ([b6a7ab6](https://github.com/ipfs/js-ipfs/commit/b6a7ab6))
* add slient option ([#1712](https://github.com/ipfs/js-ipfs/issues/1712)) ([593334b](https://github.com/ipfs/js-ipfs/commit/593334b))
* cid base option ([#1552](https://github.com/ipfs/js-ipfs/issues/1552)) ([6d46e2e](https://github.com/ipfs/js-ipfs/commit/6d46e2e)), closes [/github.com/ipfs/go-ipfs/issues/5349#issuecomment-445104823](https://github.com//github.com/ipfs/go-ipfs/issues/5349/issues/issuecomment-445104823)



<a name="0.34.0-pre.0"></a>
# [0.34.0-pre.0](https://github.com/ipfs/js-ipfs/compare/v0.33.1...v0.34.0-pre.0) (2018-12-07)


### Bug Fixes

* add dash case to pin cli ([#1719](https://github.com/ipfs/js-ipfs/issues/1719)) ([eacd580](https://github.com/ipfs/js-ipfs/commit/eacd580))
* add missing dependencies ([#1663](https://github.com/ipfs/js-ipfs/issues/1663)) ([4bcf4a7](https://github.com/ipfs/js-ipfs/commit/4bcf4a7))
* allow disabling mfs preload from config ([#1733](https://github.com/ipfs/js-ipfs/issues/1733)) ([5f66538](https://github.com/ipfs/js-ipfs/commit/5f66538))
* better error message when pubsub is not enabled ([#1729](https://github.com/ipfs/js-ipfs/issues/1729)) ([5237dd9](https://github.com/ipfs/js-ipfs/commit/5237dd9))
* examples after files API refactor ([#1740](https://github.com/ipfs/js-ipfs/issues/1740)) ([34ec036](https://github.com/ipfs/js-ipfs/commit/34ec036))
* ipns datastore key ([#1741](https://github.com/ipfs/js-ipfs/issues/1741)) ([a39770e](https://github.com/ipfs/js-ipfs/commit/a39770e))
* make circuit relay test ([#1710](https://github.com/ipfs/js-ipfs/issues/1710)) ([345ce91](https://github.com/ipfs/js-ipfs/commit/345ce91))
* remove electron-webrtc and wrtc for now ([#1718](https://github.com/ipfs/js-ipfs/issues/1718)) ([b6b50d5](https://github.com/ipfs/js-ipfs/commit/b6b50d5))


### Code Refactoring

* files API ([#1720](https://github.com/ipfs/js-ipfs/issues/1720)) ([a82a5dc](https://github.com/ipfs/js-ipfs/commit/a82a5dc))
* object APIs write methods now return CIDs ([#1730](https://github.com/ipfs/js-ipfs/issues/1730)) ([ac5fa8e](https://github.com/ipfs/js-ipfs/commit/ac5fa8e)), closes [/github.com/ipfs/interface-ipfs-core/pull/388#pullrequestreview-173866270](https://github.com//github.com/ipfs/interface-ipfs-core/pull/388/issues/pullrequestreview-173866270)


### Features

* ipns over dht ([#1725](https://github.com/ipfs/js-ipfs/issues/1725)) ([1a943f8](https://github.com/ipfs/js-ipfs/commit/1a943f8))
* ipns over pubsub ([#1559](https://github.com/ipfs/js-ipfs/issues/1559)) ([8712542](https://github.com/ipfs/js-ipfs/commit/8712542))
* Web UI updated to v2.2.0 ([#1711](https://github.com/ipfs/js-ipfs/issues/1711)) ([b2158bc](https://github.com/ipfs/js-ipfs/commit/b2158bc))


### Performance Improvements

* lazy load IPLD formats ([#1704](https://github.com/ipfs/js-ipfs/issues/1704)) ([aefb261](https://github.com/ipfs/js-ipfs/commit/aefb261))


### BREAKING CHANGES

* Object API refactor.

Object API methods that write DAG nodes now return a [CID](https://www.npmjs.com/package/cids) instead of a DAG node. Affected methods:

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

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>



<a name="0.33.1"></a>
## [0.33.1](https://github.com/ipfs/js-ipfs/compare/v0.33.0...v0.33.1) (2018-11-05)


### Bug Fixes

* over eager preload ([#1693](https://github.com/ipfs/js-ipfs/issues/1693)) ([f14c20d](https://github.com/ipfs/js-ipfs/commit/f14c20d))



<a name="0.33.0"></a>
# [0.33.0](https://github.com/ipfs/js-ipfs/compare/v0.33.0-rc.4...v0.33.0) (2018-11-01)



<a name="0.33.0-rc.4"></a>
# [0.33.0-rc.4](https://github.com/ipfs/js-ipfs/compare/v0.33.0-rc.3...v0.33.0-rc.4) (2018-11-01)


### Bug Fixes

* remove accidentally committed code ([66fa8ef](https://github.com/ipfs/js-ipfs/commit/66fa8ef))
* remove local option from global commands ([#1648](https://github.com/ipfs/js-ipfs/issues/1648)) ([8e963f9](https://github.com/ipfs/js-ipfs/commit/8e963f9))
* remove npm script ([df32ac4](https://github.com/ipfs/js-ipfs/commit/df32ac4))
* remove unused deps ([f7189fb](https://github.com/ipfs/js-ipfs/commit/f7189fb))
* use class is function on ipns ([#1617](https://github.com/ipfs/js-ipfs/issues/1617)) ([c240d49](https://github.com/ipfs/js-ipfs/commit/c240d49)), closes [js-peer-id#84](https://github.com/js-peer-id/issues/84) [interface-datastore#24](https://github.com/interface-datastore/issues/24) [#1615](https://github.com/ipfs/js-ipfs/issues/1615)


### Chores

* remove ipld formats re-export ([#1626](https://github.com/ipfs/js-ipfs/issues/1626)) ([3ee7b5e](https://github.com/ipfs/js-ipfs/commit/3ee7b5e))
* update to js-ipld 0.19 ([#1668](https://github.com/ipfs/js-ipfs/issues/1668)) ([74edafd](https://github.com/ipfs/js-ipfs/commit/74edafd))


### Features

* add support to pass config in the init cmd ([#1662](https://github.com/ipfs/js-ipfs/issues/1662)) ([588891c](https://github.com/ipfs/js-ipfs/commit/588891c))
* get Ping to work properly ([27d5a57](https://github.com/ipfs/js-ipfs/commit/27d5a57))


### BREAKING CHANGES

* dag-cbor nodes now represent links as CID objects

The API for [dag-cbor](https://github.com/ipld/js-ipld-dag-cbor) changed.
Links are no longer represented as JSON objects (`{"/": "base-encoded-cid"}`,
but as [CID objects](https://github.com/ipld/js-cid). `ipfs.dag.get()` and now always return links as CID objects. `ipfs.dag.put()` also expects links to be represented as CID objects. The old-style JSON objects representation is still
supported, but deprecated.

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



<a name="0.33.0-rc.3"></a>
# [0.33.0-rc.3](https://github.com/ipfs/js-ipfs/compare/v0.33.0-rc.2...v0.33.0-rc.3) (2018-10-24)



<a name="0.33.0-rc.2"></a>
# [0.33.0-rc.2](https://github.com/ipfs/js-ipfs/compare/v0.33.0-rc.1...v0.33.0-rc.2) (2018-10-23)



<a name="0.33.0-rc.1"></a>
# [0.33.0-rc.1](https://github.com/ipfs/js-ipfs/compare/v0.32.3...v0.33.0-rc.1) (2018-10-19)


### Bug Fixes

* make ipfs.ping() options optional ([#1627](https://github.com/ipfs/js-ipfs/issues/1627)) ([08f06b6](https://github.com/ipfs/js-ipfs/commit/08f06b6)), closes [#1616](https://github.com/ipfs/js-ipfs/issues/1616)


### Features

* **gateway:** X-Ipfs-Path, Etag, Cache-Control, Suborigin ([#1537](https://github.com/ipfs/js-ipfs/issues/1537)) ([fc5bef7](https://github.com/ipfs/js-ipfs/commit/fc5bef7))
* add cid command ([#1560](https://github.com/ipfs/js-ipfs/issues/1560)) ([a22c791](https://github.com/ipfs/js-ipfs/commit/a22c791))
* show Web UI url in daemon output ([#1595](https://github.com/ipfs/js-ipfs/issues/1595)) ([9a82b05](https://github.com/ipfs/js-ipfs/commit/9a82b05))
* update to Web UI 2.0 ([#1647](https://github.com/ipfs/js-ipfs/issues/1647)) ([aea85aa](https://github.com/ipfs/js-ipfs/commit/aea85aa))



<a name="0.32.3"></a>
## [0.32.3](https://github.com/ipfs/js-ipfs/compare/v0.32.2...v0.32.3) (2018-09-28)


### Bug Fixes

* allow null/undefined options ([#1581](https://github.com/ipfs/js-ipfs/issues/1581)) ([c73bd2f](https://github.com/ipfs/js-ipfs/commit/c73bd2f)), closes [#1574](https://github.com/ipfs/js-ipfs/issues/1574)
* block.put with non default options ([#1600](https://github.com/ipfs/js-ipfs/issues/1600)) ([4ba0a24](https://github.com/ipfs/js-ipfs/commit/4ba0a24))
* ipns datastore get not found ([#1558](https://github.com/ipfs/js-ipfs/issues/1558)) ([4e99cf5](https://github.com/ipfs/js-ipfs/commit/4e99cf5))
* report correct size for raw dag nodes ([#1591](https://github.com/ipfs/js-ipfs/issues/1591)) ([549f2f6](https://github.com/ipfs/js-ipfs/commit/549f2f6)), closes [#1585](https://github.com/ipfs/js-ipfs/issues/1585)
* revert libp2p records being signed for ipns ([#1570](https://github.com/ipfs/js-ipfs/issues/1570)) ([855b3bd](https://github.com/ipfs/js-ipfs/commit/855b3bd))



<a name="0.32.2"></a>
## [0.32.2](https://github.com/ipfs/js-ipfs/compare/v0.32.1...v0.32.2) (2018-09-19)


### Bug Fixes

* coerce key gen size to number ([#1582](https://github.com/ipfs/js-ipfs/issues/1582)) ([25d820d](https://github.com/ipfs/js-ipfs/commit/25d820d))



<a name="0.32.1"></a>
## [0.32.1](https://github.com/ipfs/js-ipfs/compare/v0.32.0...v0.32.1) (2018-09-18)


### Bug Fixes

* add libp2p-crypto to deps list ([#1572](https://github.com/ipfs/js-ipfs/issues/1572)) ([7eaf571](https://github.com/ipfs/js-ipfs/commit/7eaf571)), closes [#1571](https://github.com/ipfs/js-ipfs/issues/1571)
* enable tests in node that were not being included ([#1499](https://github.com/ipfs/js-ipfs/issues/1499)) ([2585431](https://github.com/ipfs/js-ipfs/commit/2585431))
* fix `block rm` command ([#1576](https://github.com/ipfs/js-ipfs/issues/1576)) ([af30ea5](https://github.com/ipfs/js-ipfs/commit/af30ea5))
* mfs preload test ([#1551](https://github.com/ipfs/js-ipfs/issues/1551)) ([7c7a5a6](https://github.com/ipfs/js-ipfs/commit/7c7a5a6))


### Performance Improvements

* faster startup time ([#1542](https://github.com/ipfs/js-ipfs/issues/1542)) ([2790e6d](https://github.com/ipfs/js-ipfs/commit/2790e6d))



<a name="0.32.0"></a>
# [0.32.0](https://github.com/ipfs/js-ipfs/compare/v0.32.0-rc.2...v0.32.0) (2018-09-11)


### Bug Fixes

* ipns publish resolve option overwritten ([#1556](https://github.com/ipfs/js-ipfs/issues/1556)) ([ef7d2c8](https://github.com/ipfs/js-ipfs/commit/ef7d2c8))


### Features

* Added `ipfs.name.publish` and `ipfs.name.resolve`. This only works on your local node for the moment until the DHT lands. [API docs can be found here](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/NAME.md).
* Added `ipfs.resolve` API. Note that this is a partial implementation allowing you to resolve IPFS paths like `/ipfs/QmRootHash/path/to/file` to `/ipfs/QmFileHash`. It does not support IPNS yet.
* `ipfs.files.add*` now supports a `chunker` option, see [the API docs](https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#filesadd) for details


<a name="0.31.7"></a>
## [0.31.7](https://github.com/ipfs/js-ipfs/compare/v0.31.6...v0.31.7) (2018-08-20)


### Bug Fixes

* fails to start when preload disabled ([#1516](https://github.com/ipfs/js-ipfs/issues/1516)) ([511ab47](https://github.com/ipfs/js-ipfs/commit/511ab47)), closes [#1514](https://github.com/ipfs/js-ipfs/issues/1514)
* npm publishes examples folder ([#1513](https://github.com/ipfs/js-ipfs/issues/1513)) ([4a68ac1](https://github.com/ipfs/js-ipfs/commit/4a68ac1))



<a name="0.31.6"></a>
## [0.31.6](https://github.com/ipfs/js-ipfs/compare/v0.31.5...v0.31.6) (2018-08-17)


### Features

* adds data-encoding argument to control data encoding ([#1420](https://github.com/ipfs/js-ipfs/issues/1420)) ([1eb8485](https://github.com/ipfs/js-ipfs/commit/1eb8485))



<a name="0.31.5"></a>
## [0.31.5](https://github.com/ipfs/js-ipfs/compare/v0.31.4...v0.31.5) (2018-08-17)


### Bug Fixes

* add missing space after emoji ([5cde7c1](https://github.com/ipfs/js-ipfs/commit/5cde7c1))
* improper input validation ([#1506](https://github.com/ipfs/js-ipfs/issues/1506)) ([91a482b](https://github.com/ipfs/js-ipfs/commit/91a482b))
* object.patch.rmLink not working ([#1508](https://github.com/ipfs/js-ipfs/issues/1508)) ([afd3255](https://github.com/ipfs/js-ipfs/commit/afd3255))
* stub out call to fetch for ipfs.dns test in browser ([#1512](https://github.com/ipfs/js-ipfs/issues/1512)) ([86c3d81](https://github.com/ipfs/js-ipfs/commit/86c3d81))



<a name="0.31.4"></a>
## [0.31.4](https://github.com/ipfs/js-ipfs/compare/v0.31.3...v0.31.4) (2018-08-09)


### Bug Fixes

* consistent badge style in docs ([#1494](https://github.com/ipfs/js-ipfs/issues/1494)) ([4a72e23](https://github.com/ipfs/js-ipfs/commit/4a72e23))
* files.ls and files.read*Stream tests ([#1493](https://github.com/ipfs/js-ipfs/issues/1493)) ([a0bc79b](https://github.com/ipfs/js-ipfs/commit/a0bc79b))



<a name="0.31.3"></a>
## [0.31.3](https://github.com/ipfs/js-ipfs/compare/v0.31.2...v0.31.3) (2018-08-09)


### Bug Fixes

* failing tests in master ([#1488](https://github.com/ipfs/js-ipfs/issues/1488)) ([e607560](https://github.com/ipfs/js-ipfs/commit/e607560))
* **dag:** check dag.put options for plain object ([#1480](https://github.com/ipfs/js-ipfs/issues/1480)) ([d0b671b](https://github.com/ipfs/js-ipfs/commit/d0b671b)), closes [#1479](https://github.com/ipfs/js-ipfs/issues/1479)
* **dht:** allow for options object in `findProvs()` API ([#1457](https://github.com/ipfs/js-ipfs/issues/1457)) ([99911b1](https://github.com/ipfs/js-ipfs/commit/99911b1)), closes [#1322](https://github.com/ipfs/js-ipfs/issues/1322)



<a name="0.31.2"></a>
## [0.31.2](https://github.com/ipfs/js-ipfs/compare/v0.31.1...v0.31.2) (2018-08-02)


### Bug Fixes

* fix content-type by doing a fall-back using extensions ([#1482](https://github.com/ipfs/js-ipfs/issues/1482)) ([d528b3f](https://github.com/ipfs/js-ipfs/commit/d528b3f))



<a name="0.31.1"></a>
## [0.31.1](https://github.com/ipfs/js-ipfs/compare/v0.31.0...v0.31.1) (2018-07-29)


### Bug Fixes

* logo link ([a9219ad](https://github.com/ipfs/js-ipfs/commit/a9219ad))
* XMLHTTPRequest is deprecated and unavailable in service workers ([#1478](https://github.com/ipfs/js-ipfs/issues/1478)) ([7d6f0ca](https://github.com/ipfs/js-ipfs/commit/7d6f0ca))



<a name="0.31.0"></a>
# [0.31.0](https://github.com/ipfs/js-ipfs/compare/v0.30.1...v0.31.0) (2018-07-29)


### Bug Fixes

* emit boot error only once ([#1472](https://github.com/ipfs/js-ipfs/issues/1472)) ([45b80a0](https://github.com/ipfs/js-ipfs/commit/45b80a0))


### Features

* preload content ([#1464](https://github.com/ipfs/js-ipfs/issues/1464)) ([bffe080](https://github.com/ipfs/js-ipfs/commit/bffe080)), closes [#1459](https://github.com/ipfs/js-ipfs/issues/1459)
* preload on content fetch requests ([#1475](https://github.com/ipfs/js-ipfs/issues/1475)) ([649b755](https://github.com/ipfs/js-ipfs/commit/649b755)), closes [#1473](https://github.com/ipfs/js-ipfs/issues/1473)
* remove decomissioned bootstrappers ([e3868f4](https://github.com/ipfs/js-ipfs/commit/e3868f4))
* rm decomissioned bootstrappers - nodejs ([90e9f68](https://github.com/ipfs/js-ipfs/commit/90e9f68))
* support --raw-leaves ([#1454](https://github.com/ipfs/js-ipfs/issues/1454)) ([1f63e8c](https://github.com/ipfs/js-ipfs/commit/1f63e8c))


### Reverts

* docs: add migration note about upgrading from < 0.30.0 ([#1450](https://github.com/ipfs/js-ipfs/issues/1450)) ([#1456](https://github.com/ipfs/js-ipfs/issues/1456)) ([f4344b0](https://github.com/ipfs/js-ipfs/commit/f4344b0))



<a name="0.30.1"></a>
## [0.30.1](https://github.com/ipfs/js-ipfs/compare/v0.30.0...v0.30.1) (2018-07-17)


### Bug Fixes

* aegir docs fails if outer funtion is called pin ([#1429](https://github.com/ipfs/js-ipfs/issues/1429)) ([a08a17d](https://github.com/ipfs/js-ipfs/commit/a08a17d))
* double pre start ([#1437](https://github.com/ipfs/js-ipfs/issues/1437)) ([e6ad63e](https://github.com/ipfs/js-ipfs/commit/e6ad63e))
* fixing circuit-relaying example ([#1443](https://github.com/ipfs/js-ipfs/issues/1443)) ([a681fc5](https://github.com/ipfs/js-ipfs/commit/a681fc5)), closes [#1423](https://github.com/ipfs/js-ipfs/issues/1423)



<a name="0.30.0"></a>
# [0.30.0](https://github.com/ipfs/js-ipfs/compare/v0.29.3...v0.30.0) (2018-07-09)


### Bug Fixes

* allow put empty block & add X-Stream-Output header on get ([#1408](https://github.com/ipfs/js-ipfs/issues/1408)) ([52f7aa7](https://github.com/ipfs/js-ipfs/commit/52f7aa7))
* broken contributing links ([#1386](https://github.com/ipfs/js-ipfs/issues/1386)) ([cd449ff](https://github.com/ipfs/js-ipfs/commit/cd449ff))
* do not stringify output of object data ([#1398](https://github.com/ipfs/js-ipfs/issues/1398)) ([4e51a69](https://github.com/ipfs/js-ipfs/commit/4e51a69))
* **dag:** fix default hash algorithm for put() api ([#1419](https://github.com/ipfs/js-ipfs/issues/1419)) ([1a36375](https://github.com/ipfs/js-ipfs/commit/1a36375))
* **dag:** make options in `put` API optional ([#1415](https://github.com/ipfs/js-ipfs/issues/1415)) ([d299ed7](https://github.com/ipfs/js-ipfs/commit/d299ed7)), closes [#1395](https://github.com/ipfs/js-ipfs/issues/1395)
* **tests:** loosen assertion for bitswap.stat test ([#1404](https://github.com/ipfs/js-ipfs/issues/1404)) ([4290256](https://github.com/ipfs/js-ipfs/commit/4290256))
* update hlsjs-ipfs-loader version ([#1422](https://github.com/ipfs/js-ipfs/issues/1422)) ([6b14812](https://github.com/ipfs/js-ipfs/commit/6b14812))


### Features

* (BREAKING CHANGE) new libp2p configuration ([#1401](https://github.com/ipfs/js-ipfs/issues/1401)) ([9c60909](https://github.com/ipfs/js-ipfs/commit/9c60909))
* expose libp2p connection manager configuration options ([#1410](https://github.com/ipfs/js-ipfs/issues/1410)) ([2615f76](https://github.com/ipfs/js-ipfs/commit/2615f76))
* implement bitswap.wantlist peerid and bitswap.unwant ([#1349](https://github.com/ipfs/js-ipfs/issues/1349)) ([45b705d](https://github.com/ipfs/js-ipfs/commit/45b705d))
* mfs implementation ([#1360](https://github.com/ipfs/js-ipfs/issues/1360)) ([871d24e](https://github.com/ipfs/js-ipfs/commit/871d24e)), closes [#1425](https://github.com/ipfs/js-ipfs/issues/1425)
* modular interface tests ([#1389](https://github.com/ipfs/js-ipfs/issues/1389)) ([18888be](https://github.com/ipfs/js-ipfs/commit/18888be))
* pin API ([#1045](https://github.com/ipfs/js-ipfs/issues/1045)) ([2a5cc5e](https://github.com/ipfs/js-ipfs/commit/2a5cc5e)), closes [#1249](https://github.com/ipfs/js-ipfs/issues/1249)


### Performance Improvements

* use lodash ([#1414](https://github.com/ipfs/js-ipfs/issues/1414)) ([5637330](https://github.com/ipfs/js-ipfs/commit/5637330))


### BREAKING CHANGES

* libp2p configuration has changed

    * old: `libp2p.modules.discovery`
    * new: `libp2p.modules.peerDiscovery`

License: MIT
Signed-off-by: David Dias <mail@daviddias.me>

License: MIT
Signed-off-by: Alan Shaw <alan@tableflip.io>



<a name="0.29.3"></a>
## [0.29.3](https://github.com/ipfs/js-ipfs/compare/v0.29.2...v0.29.3) (2018-06-04)


### Bug Fixes

* **repo:** do not hang on calls to repo gc ([9fff46f](https://github.com/ipfs/js-ipfs/commit/9fff46f))



<a name="0.29.2"></a>
## [0.29.2](https://github.com/ipfs/js-ipfs/compare/v0.29.1...v0.29.2) (2018-06-01)


### Bug Fixes

* adds missing breaking changes for 0.29 to changelog ([#1370](https://github.com/ipfs/js-ipfs/issues/1370)) ([61ba99e](https://github.com/ipfs/js-ipfs/commit/61ba99e))
* dont fail on uninitialized repo ([#1374](https://github.com/ipfs/js-ipfs/issues/1374)) ([6f0a95b](https://github.com/ipfs/js-ipfs/commit/6f0a95b))



<a name="0.29.1"></a>
## [0.29.1](https://github.com/ipfs/js-ipfs/compare/v0.29.0...v0.29.1) (2018-05-30)


### Bug Fixes

* check for repo uninitialized error ([dcf5ea5](https://github.com/ipfs/js-ipfs/commit/dcf5ea5))
* update ipfs-repo errors require ([4d1318d](https://github.com/ipfs/js-ipfs/commit/4d1318d))



<a name="0.29.0"></a>
# [0.29.0](https://github.com/ipfs/js-ipfs/compare/v0.28.2...v0.29.0) (2018-05-29)


### Bug Fixes

* Add ipfs path to cli help ([64c3bfb](https://github.com/ipfs/js-ipfs/commit/64c3bfb))
* change ^ to ~ on 0.x.x deps ([#1345](https://github.com/ipfs/js-ipfs/issues/1345)) ([de95989](https://github.com/ipfs/js-ipfs/commit/de95989))
* change default config from JSON file to JS module to prevent having it doubly used ([#1324](https://github.com/ipfs/js-ipfs/issues/1324)) ([c3d2d1e](https://github.com/ipfs/js-ipfs/commit/c3d2d1e)), closes [#1316](https://github.com/ipfs/js-ipfs/issues/1316)
* changes peer prop in return value from swarm.peers to be a PeerId  ([#1252](https://github.com/ipfs/js-ipfs/issues/1252)) ([e174866](https://github.com/ipfs/js-ipfs/commit/e174866))
* configure webpack to not use esmodules in dependencies ([4486acc](https://github.com/ipfs/js-ipfs/commit/4486acc))
* Display error when using unkown cli option ([a849d2f](https://github.com/ipfs/js-ipfs/commit/a849d2f))
* docker init script sed in non existent file ([#1246](https://github.com/ipfs/js-ipfs/issues/1246)) ([75d47c3](https://github.com/ipfs/js-ipfs/commit/75d47c3))
* files.add with pull streams ([0e601a7](https://github.com/ipfs/js-ipfs/commit/0e601a7))
* make pubsub.unsubscribe async and alter pubsub.subscribe signature ([a115829](https://github.com/ipfs/js-ipfs/commit/a115829))
* remove unused var ([#1273](https://github.com/ipfs/js-ipfs/issues/1273)) ([c1e8db1](https://github.com/ipfs/js-ipfs/commit/c1e8db1))
* typo ([#1367](https://github.com/ipfs/js-ipfs/issues/1367)) ([2679129](https://github.com/ipfs/js-ipfs/commit/2679129))
* use async/setImmediate vs process.nextTick ([af55608](https://github.com/ipfs/js-ipfs/commit/af55608))


### Features

* .stats.bw* - Bandwidth Stats ([#1230](https://github.com/ipfs/js-ipfs/issues/1230)) ([9694925](https://github.com/ipfs/js-ipfs/commit/9694925))
* add ability to files.cat with a cid instance ([2e332c8](https://github.com/ipfs/js-ipfs/commit/2e332c8))
* Add support for specifying hash algorithms in files.add ([a2954cb](https://github.com/ipfs/js-ipfs/commit/a2954cb))
* allow dht to be enabled via cli arg ([#1340](https://github.com/ipfs/js-ipfs/issues/1340)) ([7bb838f](https://github.com/ipfs/js-ipfs/commit/7bb838f))
* Allows for byte offsets when using ipfs.files.cat and friends to request slices of files ([a93971a](https://github.com/ipfs/js-ipfs/commit/a93971a))
* Circuit Relay ([#1063](https://github.com/ipfs/js-ipfs/issues/1063)) ([f7eaa43](https://github.com/ipfs/js-ipfs/commit/f7eaa43))
* cli: add IPFS_PATH info to init command help ([#1274](https://github.com/ipfs/js-ipfs/issues/1274)) ([e189b72](https://github.com/ipfs/js-ipfs/commit/e189b72))
* handle SIGHUP ([7a817cf](https://github.com/ipfs/js-ipfs/commit/7a817cf))
* ipfs.ping cli, http-api and core ([#1342](https://github.com/ipfs/js-ipfs/issues/1342)) ([b8171b1](https://github.com/ipfs/js-ipfs/commit/b8171b1))
* jsipfs add --only-hash ([#1233](https://github.com/ipfs/js-ipfs/issues/1233)) ([#1266](https://github.com/ipfs/js-ipfs/issues/1266)) ([bddc5b4](https://github.com/ipfs/js-ipfs/commit/bddc5b4))
* Provide access to bundled libraries when in browser ([#1297](https://github.com/ipfs/js-ipfs/issues/1297)) ([4905c2d](https://github.com/ipfs/js-ipfs/commit/4905c2d))
* use class-is for type checks ([5b2cf8c](https://github.com/ipfs/js-ipfs/commit/5b2cf8c))
* wrap with directory ([#1329](https://github.com/ipfs/js-ipfs/issues/1329)) ([47285a7](https://github.com/ipfs/js-ipfs/commit/47285a7))


### Performance Improvements

* **cli:** load only sub-system modules and inline require ipfs ([3820be0](https://github.com/ipfs/js-ipfs/commit/3820be0))


### BREAKING CHANGES

1. Argument order for `pubsub.subscribe` has changed:
    * Old: `pubsub.subscribe(topic, [options], handler, [callback]): Promise`
    * New: `pubsub.subscribe(topic, handler, [options], [callback]): Promise`
2. The `pubsub.unsubscribe` method has become async meaning that it now takes a callback or returns a promise:
    * Old: `pubsub.unsubscribe(topic, handler): undefined`
    * New: `pubsub.unsubscribe(topic, handler, [callback]): Promise`
3. Property names on response objects for `ping` are now lowered:
    * Old: `{ Success, Time, Text }`
    * New: `{ success, time, text }`
4. In the CLI, `jsipfs object data` no longer returns a newline after the end of the returned data



<a name="0.28.2"></a>
## [0.28.2](https://github.com/ipfs/js-ipfs/compare/v0.28.1...v0.28.2) (2018-03-14)


### Bug Fixes

* match error if repo doesnt exist ([#1262](https://github.com/ipfs/js-ipfs/issues/1262)) ([aea69d3](https://github.com/ipfs/js-ipfs/commit/aea69d3))
* reinstates the non local block check in dht.provide ([#1250](https://github.com/ipfs/js-ipfs/issues/1250)) ([5b736a8](https://github.com/ipfs/js-ipfs/commit/5b736a8))


### Features

* add config validation ([#1239](https://github.com/ipfs/js-ipfs/issues/1239)) ([a32dce7](https://github.com/ipfs/js-ipfs/commit/a32dce7))



<a name="0.28.1"></a>
## [0.28.1](https://github.com/ipfs/js-ipfs/compare/v0.28.0...v0.28.1) (2018-03-09)


### Bug Fixes

* **gateway:** catch stream2 error ([#1243](https://github.com/ipfs/js-ipfs/issues/1243)) ([5b40b41](https://github.com/ipfs/js-ipfs/commit/5b40b41))
* accept objects in file.add ([#1257](https://github.com/ipfs/js-ipfs/issues/1257)) ([d32dad9](https://github.com/ipfs/js-ipfs/commit/d32dad9))



<a name="0.28.0"></a>
# [0.28.0](https://github.com/ipfs/js-ipfs/compare/v0.27.7...v0.28.0) (2018-03-01)


### Bug Fixes

* **cli:** show help for subcommands ([8c63f8f](https://github.com/ipfs/js-ipfs/commit/8c63f8f))
* (cli/init) use cross-platform path separator ([bbb7cc5](https://github.com/ipfs/js-ipfs/commit/bbb7cc5))
* **dag:** print data in a readable way if it is JSON ([42545dc](https://github.com/ipfs/js-ipfs/commit/42545dc))
* bootstrap ([d527b45](https://github.com/ipfs/js-ipfs/commit/d527b45))
* now properly fix bootstrap in core ([9f39a6f](https://github.com/ipfs/js-ipfs/commit/9f39a6f))
* Remove scape characteres from error message. ([68e7b5a](https://github.com/ipfs/js-ipfs/commit/68e7b5a))
* Return swarm http errors as json ([d3a0ae1](https://github.com/ipfs/js-ipfs/commit/d3a0ae1)), closes [#1176](https://github.com/ipfs/js-ipfs/issues/1176)
* stats tests ([a0fd355](https://github.com/ipfs/js-ipfs/commit/a0fd355))
* use "ipld" instead of "ipld-resolver" ([e7f0432](https://github.com/ipfs/js-ipfs/commit/e7f0432))


### Features

* `ipfs version` flags + `ipfs repo version` ([#1181](https://github.com/ipfs/js-ipfs/issues/1181)) ([#1188](https://github.com/ipfs/js-ipfs/issues/1188)) ([494da7f](https://github.com/ipfs/js-ipfs/commit/494da7f))
* Add /ip6 addresses to bootstrap ([3bca165](https://github.com/ipfs/js-ipfs/commit/3bca165)), closes [#706](https://github.com/ipfs/js-ipfs/issues/706)
* all pubsub tests passing with libp2p pubsub ([6fe015f](https://github.com/ipfs/js-ipfs/commit/6fe015f))
* Bootstrap API compliance ([#1218](https://github.com/ipfs/js-ipfs/issues/1218)) ([9a445d1](https://github.com/ipfs/js-ipfs/commit/9a445d1))
* Implementation of the ipfs.key API ([#1133](https://github.com/ipfs/js-ipfs/issues/1133)) ([d945fce](https://github.com/ipfs/js-ipfs/commit/d945fce))
* improved multiaddr validation. ([d9744a1](https://github.com/ipfs/js-ipfs/commit/d9744a1))
* ipfs shutdown ([#1200](https://github.com/ipfs/js-ipfs/issues/1200)) ([95365fa](https://github.com/ipfs/js-ipfs/commit/95365fa))
* jsipfs ls -r (Recursive list directory) ([#1222](https://github.com/ipfs/js-ipfs/issues/1222)) ([0f1e00f](https://github.com/ipfs/js-ipfs/commit/0f1e00f))
* latest libp2p + other deps. Fix bugs in tests along the way ([4b79066](https://github.com/ipfs/js-ipfs/commit/4b79066))
* reworking tests with new ipfsd-ctl ([#1167](https://github.com/ipfs/js-ipfs/issues/1167)) ([d16a129](https://github.com/ipfs/js-ipfs/commit/d16a129))
* stats API (stats.bitswap and stats.repo) ([#1198](https://github.com/ipfs/js-ipfs/issues/1198)) ([905bdc0](https://github.com/ipfs/js-ipfs/commit/905bdc0))
* support Jenkins ([bc66e9f](https://github.com/ipfs/js-ipfs/commit/bc66e9f))
* use PubSub API directly from libp2p ([6b9fc95](https://github.com/ipfs/js-ipfs/commit/6b9fc95))
* use reduces keysize ([#1232](https://github.com/ipfs/js-ipfs/issues/1232)) ([7f69628](https://github.com/ipfs/js-ipfs/commit/7f69628))



<a name="0.27.7"></a>
## [0.27.7](https://github.com/ipfs/js-ipfs/compare/v0.27.6...v0.27.7) (2018-01-16)


### Features

* /api/v0/dns ([#1172](https://github.com/ipfs/js-ipfs/issues/1172)) ([639024c](https://github.com/ipfs/js-ipfs/commit/639024c))



<a name="0.27.6"></a>
## [0.27.6](https://github.com/ipfs/js-ipfs/compare/v0.27.5...v0.27.6) (2018-01-07)


### Bug Fixes

* cli files on Windows ([#1159](https://github.com/ipfs/js-ipfs/issues/1159)) ([1b98fa1](https://github.com/ipfs/js-ipfs/commit/1b98fa1))



<a name="0.27.5"></a>
## [0.27.5](https://github.com/ipfs/js-ipfs/compare/v0.27.4...v0.27.5) (2017-12-18)


### Bug Fixes

* cat: test file existence after filtering ([#1148](https://github.com/ipfs/js-ipfs/issues/1148)) ([34f28ef](https://github.com/ipfs/js-ipfs/commit/34f28ef)), closes [#1142](https://github.com/ipfs/js-ipfs/issues/1142)
* ipfs.ls: allow any depth ([#1152](https://github.com/ipfs/js-ipfs/issues/1152)) ([279af78](https://github.com/ipfs/js-ipfs/commit/279af78)), closes [#1079](https://github.com/ipfs/js-ipfs/issues/1079)
* use new bitswap stats ([#1151](https://github.com/ipfs/js-ipfs/issues/1151)) ([e223888](https://github.com/ipfs/js-ipfs/commit/e223888))
* **files.add:** directory with odd name ([#1155](https://github.com/ipfs/js-ipfs/issues/1155)) ([058c674](https://github.com/ipfs/js-ipfs/commit/058c674))



<a name="0.27.4"></a>
## [0.27.4](https://github.com/ipfs/js-ipfs/compare/v0.27.3...v0.27.4) (2017-12-13)


### Bug Fixes

* files.cat: detect and handle rrors when unknown path and cat dir ([#1143](https://github.com/ipfs/js-ipfs/issues/1143)) ([120d291](https://github.com/ipfs/js-ipfs/commit/120d291))
* fix bug introduced by 1143 ([#1146](https://github.com/ipfs/js-ipfs/issues/1146)) ([12cdc08](https://github.com/ipfs/js-ipfs/commit/12cdc08))



<a name="0.27.3"></a>
## [0.27.3](https://github.com/ipfs/js-ipfs/compare/v0.27.2...v0.27.3) (2017-12-10)


### Bug Fixes

* config handler should check if value is null ([#1134](https://github.com/ipfs/js-ipfs/issues/1134)) ([0444c42](https://github.com/ipfs/js-ipfs/commit/0444c42))
* **pubsub:** subscribe promises ([#1141](https://github.com/ipfs/js-ipfs/issues/1141)) ([558017d](https://github.com/ipfs/js-ipfs/commit/558017d))



<a name="0.27.2"></a>
## [0.27.2](https://github.com/ipfs/js-ipfs/compare/v0.27.1...v0.27.2) (2017-12-09)



<a name="0.27.1"></a>
## [0.27.1](https://github.com/ipfs/js-ipfs/compare/v0.27.0...v0.27.1) (2017-12-07)


### Bug Fixes

* **pubsub.peers:** remove the requirement for a topic ([#1125](https://github.com/ipfs/js-ipfs/issues/1125)) ([5601c26](https://github.com/ipfs/js-ipfs/commit/5601c26))



<a name="0.27.0"></a>
# [0.27.0](https://github.com/ipfs/js-ipfs/compare/v0.26.0...v0.27.0) (2017-12-04)


### Bug Fixes

* fix the welcome message and throw error when trying to cat a non-exis… ([#1032](https://github.com/ipfs/js-ipfs/issues/1032)) ([25fb390](https://github.com/ipfs/js-ipfs/commit/25fb390)), closes [#1031](https://github.com/ipfs/js-ipfs/issues/1031)
* make offline error retain stack ([#1056](https://github.com/ipfs/js-ipfs/issues/1056)) ([dce6a49](https://github.com/ipfs/js-ipfs/commit/dce6a49))
* pre 1.0.0 deps should be always installed with ~ and not ^ ([c672af7](https://github.com/ipfs/js-ipfs/commit/c672af7))
* progress bar flakiness ([#1042](https://github.com/ipfs/js-ipfs/issues/1042)) ([d7732c3](https://github.com/ipfs/js-ipfs/commit/d7732c3))
* promisify .block (get, put, rm, stat) ([#1085](https://github.com/ipfs/js-ipfs/issues/1085)) ([cafa52b](https://github.com/ipfs/js-ipfs/commit/cafa52b))
* **files.add:** glob needs a POSIX path ([#1108](https://github.com/ipfs/js-ipfs/issues/1108)) ([9c29a23](https://github.com/ipfs/js-ipfs/commit/9c29a23))
* promisify node.stop ([#1082](https://github.com/ipfs/js-ipfs/issues/1082)) ([9b385ae](https://github.com/ipfs/js-ipfs/commit/9b385ae))
* pubsub message fields ([#1077](https://github.com/ipfs/js-ipfs/issues/1077)) ([9de6f4c](https://github.com/ipfs/js-ipfs/commit/9de6f4c))
* removed error handler that was hiding errors ([#1120](https://github.com/ipfs/js-ipfs/issues/1120)) ([58ded8d](https://github.com/ipfs/js-ipfs/commit/58ded8d))
* Typo ([#1044](https://github.com/ipfs/js-ipfs/issues/1044)) ([179b6a4](https://github.com/ipfs/js-ipfs/commit/179b6a4))
* update *-star multiaddrs to explicity say that they need tcp and a port ([#1117](https://github.com/ipfs/js-ipfs/issues/1117)) ([9eda8a8](https://github.com/ipfs/js-ipfs/commit/9eda8a8))


### Features

* accept additional transports ([6613aa6](https://github.com/ipfs/js-ipfs/commit/6613aa6))
* add circuit relay and aegir 12 (+ big refactor) ([104ef1e](https://github.com/ipfs/js-ipfs/commit/104ef1e))
* add WebUI Path ([#1124](https://github.com/ipfs/js-ipfs/issues/1124)) ([8041b48](https://github.com/ipfs/js-ipfs/commit/8041b48))
* adding appveyor support ([#1054](https://github.com/ipfs/js-ipfs/issues/1054)) ([b92bdfe](https://github.com/ipfs/js-ipfs/commit/b92bdfe))
* agent version with package number ([#1121](https://github.com/ipfs/js-ipfs/issues/1121)) ([550f955](https://github.com/ipfs/js-ipfs/commit/550f955))
* cli --api option ([#1087](https://github.com/ipfs/js-ipfs/issues/1087)) ([1b1fa05](https://github.com/ipfs/js-ipfs/commit/1b1fa05))
* complete PubSub implementation  ([ac95601](https://github.com/ipfs/js-ipfs/commit/ac95601))
* implement "ipfs file ls" ([#1078](https://github.com/ipfs/js-ipfs/issues/1078)) ([6db3fb8](https://github.com/ipfs/js-ipfs/commit/6db3fb8))
* implementing the new streaming interfaces ([#1086](https://github.com/ipfs/js-ipfs/issues/1086)) ([2c4b8b3](https://github.com/ipfs/js-ipfs/commit/2c4b8b3))
* ipfs.ls ([#1073](https://github.com/ipfs/js-ipfs/issues/1073)) ([35687cb](https://github.com/ipfs/js-ipfs/commit/35687cb))
* make js-ipfs daemon stop with same SIG as go-ipfs ([#1067](https://github.com/ipfs/js-ipfs/issues/1067)) ([7dd4e01](https://github.com/ipfs/js-ipfs/commit/7dd4e01))
* WebSocketStar ([#1090](https://github.com/ipfs/js-ipfs/issues/1090)) ([33e9949](https://github.com/ipfs/js-ipfs/commit/33e9949))
* windows interop ([#1065](https://github.com/ipfs/js-ipfs/issues/1065)) ([d8197f9](https://github.com/ipfs/js-ipfs/commit/d8197f9))



<a name="0.26.0"></a>
# [0.26.0](https://github.com/ipfs/js-ipfs/compare/v0.25.4...v0.26.0) (2017-09-13)


### Bug Fixes

* strips trailing slash from path ([#985](https://github.com/ipfs/js-ipfs/issues/985)) ([bfc58d6](https://github.com/ipfs/js-ipfs/commit/bfc58d6))


### Features

* Add --cid-version option to ipfs files add +  decodeURIComponent for file and directory names ([7544b7b](https://github.com/ipfs/js-ipfs/commit/7544b7b))
* add gateway to ipfs daemon ([9f2006e](https://github.com/ipfs/js-ipfs/commit/9f2006e)), closes [#1006](https://github.com/ipfs/js-ipfs/issues/1006) [#1008](https://github.com/ipfs/js-ipfs/issues/1008) [#1009](https://github.com/ipfs/js-ipfs/issues/1009)
* adds quiet flags ([#1001](https://github.com/ipfs/js-ipfs/issues/1001)) ([d21b492](https://github.com/ipfs/js-ipfs/commit/d21b492))
* complete the migration to p2p-webrtc-star ([#984](https://github.com/ipfs/js-ipfs/issues/984)) ([1e5dd2c](https://github.com/ipfs/js-ipfs/commit/1e5dd2c))



<a name="0.25.4"></a>
## [0.25.4](https://github.com/ipfs/js-ipfs/compare/v0.25.3...v0.25.4) (2017-09-01)


### Features

* add multiaddrs for bootstrapers gateway  ([a15bee9](https://github.com/ipfs/js-ipfs/commit/a15bee9))



<a name="0.25.3"></a>
## [0.25.3](https://github.com/ipfs/js-ipfs/compare/v0.25.2...v0.25.3) (2017-09-01)


### Bug Fixes

* config, dangling comma ([4eb63c5](https://github.com/ipfs/js-ipfs/commit/4eb63c5))
* only show connected addrs for peers in swarm.peers ([d939323](https://github.com/ipfs/js-ipfs/commit/d939323))
* remove shutdown bootstrapers from bootstrappers list ([5ec27a3](https://github.com/ipfs/js-ipfs/commit/5ec27a3))


### Features

* add instrumentation ([8f0254e](https://github.com/ipfs/js-ipfs/commit/8f0254e))



<a name="0.25.2"></a>
## [0.25.2](https://github.com/ipfs/js-ipfs/compare/v0.25.1...v0.25.2) (2017-08-26)



<a name="0.25.1"></a>
## [0.25.1](https://github.com/ipfs/js-ipfs/compare/v0.25.0...v0.25.1) (2017-07-26)


### Bug Fixes

* js-ipfs daemon config params ([#914](https://github.com/ipfs/js-ipfs/issues/914)) ([e00b96f](https://github.com/ipfs/js-ipfs/commit/e00b96f)), closes [#868](https://github.com/ipfs/js-ipfs/issues/868)
* remove non existent commands ([#925](https://github.com/ipfs/js-ipfs/issues/925)) ([b7e8e88](https://github.com/ipfs/js-ipfs/commit/b7e8e88))
* stream issue, do not use isstream, use is-stream ([#937](https://github.com/ipfs/js-ipfs/issues/937)) ([da66b1f](https://github.com/ipfs/js-ipfs/commit/da66b1f))


### Features

* new print func for the CLI ([#931](https://github.com/ipfs/js-ipfs/issues/931)) ([a5e75e0](https://github.com/ipfs/js-ipfs/commit/a5e75e0))
* no more need for webcrypto-ossl ([bc8ffee](https://github.com/ipfs/js-ipfs/commit/bc8ffee))



<a name="0.25.0"></a>
# [0.25.0](https://github.com/ipfs/js-ipfs/compare/v0.24.1...v0.25.0) (2017-07-12)


### Bug Fixes

* **bootstrap:add:** prevent duplicate inserts ([#893](https://github.com/ipfs/js-ipfs/issues/893)) ([ce504cd](https://github.com/ipfs/js-ipfs/commit/ce504cd))
* **swarm:** move isConnected filter from addrs to peers ([#901](https://github.com/ipfs/js-ipfs/issues/901)) ([e2f371b](https://github.com/ipfs/js-ipfs/commit/e2f371b))
* circle ci, thanks victor! ([b074966](https://github.com/ipfs/js-ipfs/commit/b074966))
* do not let lodash mess with libp2p modules ([1f68b9b](https://github.com/ipfs/js-ipfs/commit/1f68b9b))
* is online is only online if libp2p is online ([#891](https://github.com/ipfs/js-ipfs/issues/891)) ([8b0f996](https://github.com/ipfs/js-ipfs/commit/8b0f996))
* issue [#905](https://github.com/ipfs/js-ipfs/issues/905) ([#906](https://github.com/ipfs/js-ipfs/issues/906)) ([cbcf90e](https://github.com/ipfs/js-ipfs/commit/cbcf90e))
* setImmediate polyfilled in node.id() ([#909](https://github.com/ipfs/js-ipfs/issues/909)) ([ebaf9a0](https://github.com/ipfs/js-ipfs/commit/ebaf9a0))
* succeed when stopping already stopped ([74f3185](https://github.com/ipfs/js-ipfs/commit/74f3185))


### Features

* adapted to new ipfs-repo API ([#887](https://github.com/ipfs/js-ipfs/issues/887)) ([4e39d2c](https://github.com/ipfs/js-ipfs/commit/4e39d2c))
* block get pipe fix ([#903](https://github.com/ipfs/js-ipfs/issues/903)) ([8063f6b](https://github.com/ipfs/js-ipfs/commit/8063f6b))



<a name="0.24.1"></a>
## [0.24.1](https://github.com/ipfs/js-ipfs/compare/0.24.1...v0.24.1) (2017-05-29)



<a name="0.24.0"></a>
# [0.24.0](https://github.com/ipfs/js-ipfs/compare/v0.23.1...v0.24.0) (2017-05-24)


### Bug Fixes

* cli flag typos ([c5bb0b9](https://github.com/ipfs/js-ipfs/commit/c5bb0b9))
* example, now files from datatransfer is a FileList which is not an array ([d7c9eec](https://github.com/ipfs/js-ipfs/commit/d7c9eec))
* issue-858 ([481933a](https://github.com/ipfs/js-ipfs/commit/481933a))
* last touches for dns websockets bootstrapers ([3b680a7](https://github.com/ipfs/js-ipfs/commit/3b680a7))
* linting ([68ee42e](https://github.com/ipfs/js-ipfs/commit/68ee42e))
* make start an async event ([78ba1e8](https://github.com/ipfs/js-ipfs/commit/78ba1e8))
* missing import ([6aa914d](https://github.com/ipfs/js-ipfs/commit/6aa914d))
* options to the HTTP API ([f1eb595](https://github.com/ipfs/js-ipfs/commit/f1eb595))
* removed hard-coded timeout on test and liting fixes ([0a3bbcb](https://github.com/ipfs/js-ipfs/commit/0a3bbcb))
* run webworker tests ([23c84f6](https://github.com/ipfs/js-ipfs/commit/23c84f6))
* **object.get:** treat ipfs hash strings as default base58 encoded ([7b3caef](https://github.com/ipfs/js-ipfs/commit/7b3caef))
* update bootstrapers ([7e7d9eb](https://github.com/ipfs/js-ipfs/commit/7e7d9eb))


### Features

* add dns ws bootstrappers ([a856578](https://github.com/ipfs/js-ipfs/commit/a856578))
* add WebRTC by default as a multiaddr ([4ea1571](https://github.com/ipfs/js-ipfs/commit/4ea1571))
* add websocket bootstrapers to the config ([602d033](https://github.com/ipfs/js-ipfs/commit/602d033))
* DHT integration PART I ([860165c](https://github.com/ipfs/js-ipfs/commit/860165c))
* new libp2p-api ([7bf75d1](https://github.com/ipfs/js-ipfs/commit/7bf75d1))
* update to new libp2p events for peers ([ca88706](https://github.com/ipfs/js-ipfs/commit/ca88706))
* update to the latest libp2p ([aca4297](https://github.com/ipfs/js-ipfs/commit/aca4297))



<a name="0.23.1"></a>
## [0.23.1](https://github.com/ipfs/js-ipfs/compare/v0.23.0...v0.23.1) (2017-03-27)


### Bug Fixes

* added backpressure to the add stream ([#810](https://github.com/ipfs/js-ipfs/issues/810)) ([31dbabc](https://github.com/ipfs/js-ipfs/commit/31dbabc))



<a name="0.23.0"></a>
# [0.23.0](https://github.com/ipfs/js-ipfs/compare/v0.22.1...v0.23.0) (2017-03-24)


### Bug Fixes

* **files.add:** error on invalid input ([#782](https://github.com/ipfs/js-ipfs/issues/782)) ([c851ca0](https://github.com/ipfs/js-ipfs/commit/c851ca0))
* give the daemon time to spawn ([2bf32cd](https://github.com/ipfs/js-ipfs/commit/2bf32cd))
* linting on transfer-files example ([f876171](https://github.com/ipfs/js-ipfs/commit/f876171))
* offer an init event to monitor when repo is there and avoid setTimeout ([c4130b9](https://github.com/ipfs/js-ipfs/commit/c4130b9))
* pull-stream-to-stream replaced with duplex stream ([#809](https://github.com/ipfs/js-ipfs/issues/809)) ([4b064a1](https://github.com/ipfs/js-ipfs/commit/4b064a1))


### Features

* bootstrap is enabled by default now ([64cde5d](https://github.com/ipfs/js-ipfs/commit/64cde5d))
* bootstrap is enabled by default now ([2642417](https://github.com/ipfs/js-ipfs/commit/2642417))
* datastore, ipfs-block and all the deps that were updated ([68d92b6](https://github.com/ipfs/js-ipfs/commit/68d92b6))
* no need anymore to append ipfs/Qmhash to webrtc-star multiaddrs ([a77ae3c](https://github.com/ipfs/js-ipfs/commit/a77ae3c))



<a name="0.22.1"></a>
## [0.22.1](https://github.com/ipfs/js-ipfs/compare/v0.22.0...v0.22.1) (2017-02-24)


### Bug Fixes

* interop tests with multiplex passing ([cb109fc](https://github.com/ipfs/js-ipfs/commit/cb109fc))


### Features

* **core:** allow IPFS object to be created without supplying configOpts ([f620d71](https://github.com/ipfs/js-ipfs/commit/f620d71))
* **deps:** update multiplex libp2p-ipfs deps ([5605148](https://github.com/ipfs/js-ipfs/commit/5605148))



<a name="0.22.0"></a>
# [0.22.0](https://github.com/ipfs/js-ipfs/compare/v0.21.8...v0.22.0) (2017-02-15)


### Bug Fixes

* lint ([ffc120a](https://github.com/ipfs/js-ipfs/commit/ffc120a))
* make sure all deps are up to date, expose Buffer type ([7eb630d](https://github.com/ipfs/js-ipfs/commit/7eb630d))
* readable-stream needs to be 1.1.14 ([e999f05](https://github.com/ipfs/js-ipfs/commit/e999f05))
* tidy dag cli up ([b90ba76](https://github.com/ipfs/js-ipfs/commit/b90ba76))


### Features

* **breaking change:** experimental config options ([#749](https://github.com/ipfs/js-ipfs/issues/749)) ([69fa802](https://github.com/ipfs/js-ipfs/commit/69fa802))
* **dag:** basics (get, put) ([#746](https://github.com/ipfs/js-ipfs/issues/746)) ([e5ec0cf](https://github.com/ipfs/js-ipfs/commit/e5ec0cf))
* **dag:** Resolve API ([#751](https://github.com/ipfs/js-ipfs/issues/751)) ([4986908](https://github.com/ipfs/js-ipfs/commit/4986908))
* merge of get and resolve ([#761](https://github.com/ipfs/js-ipfs/issues/761)) ([b081e35](https://github.com/ipfs/js-ipfs/commit/b081e35))



<a name="0.21.8"></a>
## [0.21.8](https://github.com/ipfs/js-ipfs/compare/v0.21.7...v0.21.8) (2017-01-31)


### Features

* add CLI support for different hash func and type ([#748](https://github.com/ipfs/js-ipfs/issues/748)) ([a6c522f](https://github.com/ipfs/js-ipfs/commit/a6c522f))



<a name="0.21.7"></a>
## [0.21.7](https://github.com/ipfs/js-ipfs/compare/v0.21.6...v0.21.7) (2017-01-30)


### Bug Fixes

* default config file ([01ef4b5](https://github.com/ipfs/js-ipfs/commit/01ef4b5))



<a name="0.21.6"></a>
## [0.21.6](https://github.com/ipfs/js-ipfs/compare/v0.21.5...v0.21.6) (2017-01-29)


### Features

* bootstrap as an option ([#735](https://github.com/ipfs/js-ipfs/issues/735)) ([03362a3](https://github.com/ipfs/js-ipfs/commit/03362a3))



<a name="0.21.5"></a>
## [0.21.5](https://github.com/ipfs/js-ipfs/compare/v0.21.4...v0.21.5) (2017-01-29)


### Bug Fixes

* differenciate default config in browser and in node ([#734](https://github.com/ipfs/js-ipfs/issues/734)) ([17ccc8b](https://github.com/ipfs/js-ipfs/commit/17ccc8b))



<a name="0.21.4"></a>
## [0.21.4](https://github.com/ipfs/js-ipfs/compare/v0.21.3...v0.21.4) (2017-01-28)


### Bug Fixes

* ipfs.id does not double append ipfs/<id> anymore ([#732](https://github.com/ipfs/js-ipfs/issues/732)) ([718394a](https://github.com/ipfs/js-ipfs/commit/718394a))



<a name="0.21.3"></a>
## [0.21.3](https://github.com/ipfs/js-ipfs/compare/v0.21.2...v0.21.3) (2017-01-25)



<a name="0.21.2"></a>
## [0.21.2](https://github.com/ipfs/js-ipfs/compare/v0.21.1...v0.21.2) (2017-01-23)



<a name="0.21.1"></a>
## [0.21.1](https://github.com/ipfs/js-ipfs/compare/v0.21.0...v0.21.1) (2017-01-23)



<a name="0.21.0"></a>
# [0.21.0](https://github.com/ipfs/js-ipfs/compare/v0.20.4...v0.21.0) (2017-01-17)


### Bug Fixes

* point to a specific go-ipfs version (still waiting for another 0.4.5 pre release though ([19dbb1e](https://github.com/ipfs/js-ipfs/commit/19dbb1e))



<a name="0.20.4"></a>
## [0.20.4](https://github.com/ipfs/js-ipfs/compare/v0.20.2...v0.20.4) (2016-12-26)


### Bug Fixes

* bitswap wantlist http endpoint ([58f0885](https://github.com/ipfs/js-ipfs/commit/58f0885))
* bitswap wantlist stats ([9db86f5](https://github.com/ipfs/js-ipfs/commit/9db86f5))
* change default values of js-ipfs to avoid clash with go-ipfs + clean the browserify example ([6d52e1c](https://github.com/ipfs/js-ipfs/commit/6d52e1c))
* npm scripts ([eadcec0](https://github.com/ipfs/js-ipfs/commit/eadcec0))
* pass a first arg to bitswap to be removed after new bitswap is merged, so that tests pass now ([bddcee7](https://github.com/ipfs/js-ipfs/commit/bddcee7))


### Features

* **init:** add empty unixfs dir to match go-ipfs ([a967bb0](https://github.com/ipfs/js-ipfs/commit/a967bb0))
* **object:** add template option to object.new ([9058118](https://github.com/ipfs/js-ipfs/commit/9058118))
* add multicastdns to the mix ([c2ddefb](https://github.com/ipfs/js-ipfs/commit/c2ddefb))



<a name="0.20.2"></a>
## [0.20.2](https://github.com/ipfs/js-ipfs/compare/v0.20.1...v0.20.2) (2016-12-09)


### Bug Fixes

* **cli:** Tell user to init repo if not initialized when starting daemon ([fa7e275](https://github.com/ipfs/js-ipfs/commit/fa7e275))



<a name="0.20.1"></a>
## [0.20.1](https://github.com/ipfs/js-ipfs/compare/v0.19.0...v0.20.1) (2016-11-28)



<a name="0.19.0"></a>
# [0.19.0](https://github.com/ipfs/js-ipfs/compare/v0.18.0...v0.19.0) (2016-11-26)


### Bug Fixes

* addLink and rmLink ([7fad4d8](https://github.com/ipfs/js-ipfs/commit/7fad4d8))
* apply CR ([698f708](https://github.com/ipfs/js-ipfs/commit/698f708))
* **lint:** install missing plugin ([20e3d2e](https://github.com/ipfs/js-ipfs/commit/20e3d2e))
* **lint:** use eslint directly ([443dd9e](https://github.com/ipfs/js-ipfs/commit/443dd9e))
* **lint and polish:** add a little more comments ([d6ce83d](https://github.com/ipfs/js-ipfs/commit/d6ce83d))


### Features

* **cli:** migrate to awesome-dag-pb ([3bb3ba8](https://github.com/ipfs/js-ipfs/commit/3bb3ba8))
* **core:** migrate to awesome dag-pb ([db550a1](https://github.com/ipfs/js-ipfs/commit/db550a1))
* **examples:** add a getting-started example ([7485ac5](https://github.com/ipfs/js-ipfs/commit/7485ac5))
* **http:** migrate to awesome dag-pb ([ca9935f](https://github.com/ipfs/js-ipfs/commit/ca9935f))
* **swarm:** update swarm.peers to new api ([265a77a](https://github.com/ipfs/js-ipfs/commit/265a77a))



<a name="0.18.0"></a>
# [0.18.0](https://github.com/ipfs/js-ipfs/compare/v0.17.0...v0.18.0) (2016-11-12)


### Bug Fixes

* async .key ([2d2185b](https://github.com/ipfs/js-ipfs/commit/2d2185b))
* don't break backwards compatibility on the Block API ([3674b8e](https://github.com/ipfs/js-ipfs/commit/3674b8e))
* **cli:** alias add, cat and get to top-level cli ([6ad325b](https://github.com/ipfs/js-ipfs/commit/6ad325b))


### Features

* block API uses CIDs ([2eeea35](https://github.com/ipfs/js-ipfs/commit/2eeea35))
* migrate cli to use new async DAGNode interface ([1b0b22d](https://github.com/ipfs/js-ipfs/commit/1b0b22d))
* migrate core to use new async DAGNode interface ([254afdc](https://github.com/ipfs/js-ipfs/commit/254afdc))
* migrate files to use IPLD Resolver ([0fb1a1a](https://github.com/ipfs/js-ipfs/commit/0fb1a1a))
* migrate http-api to use new async DAGNode interface ([01e56ec](https://github.com/ipfs/js-ipfs/commit/01e56ec))
* migrate init to IPLD resolver ([61d1084](https://github.com/ipfs/js-ipfs/commit/61d1084))
* object API internals updated to use CID ([5cb10cc](https://github.com/ipfs/js-ipfs/commit/5cb10cc))
* update cli and http to support new ipld block api with IPLD ([5dbb799](https://github.com/ipfs/js-ipfs/commit/5dbb799))
* **http:** better error messages ([cd7f77d](https://github.com/ipfs/js-ipfs/commit/cd7f77d))
* **http:** set default headers for browsers ([6a21cd0](https://github.com/ipfs/js-ipfs/commit/6a21cd0))



<a name="0.17.0"></a>
# [0.17.0](https://github.com/ipfs/js-ipfs/compare/v0.16.0...v0.17.0) (2016-10-10)


### Bug Fixes

* **cli:** Fix issue with right cwd not being set ([e5f5e1b](https://github.com/ipfs/js-ipfs/commit/e5f5e1b))
* **deps:** move blob stores to dependencies ([8f33d11](https://github.com/ipfs/js-ipfs/commit/8f33d11))
* **files.get:** fix the command ([7015586](https://github.com/ipfs/js-ipfs/commit/7015586))


### Features

* **http-api:** add joi validation to bootstrap ([028a98c](https://github.com/ipfs/js-ipfs/commit/028a98c))



<a name="0.16.0"></a>
# [0.16.0](https://github.com/ipfs/js-ipfs/compare/v0.15.0...v0.16.0) (2016-09-15)


### Bug Fixes

* **cli:** add output for cli init ([29c9793](https://github.com/ipfs/js-ipfs/commit/29c9793))
* always use files.cat ([5b8da13](https://github.com/ipfs/js-ipfs/commit/5b8da13))
* **cli:** make ipfs files add work online and offline ([3edc2b9](https://github.com/ipfs/js-ipfs/commit/3edc2b9)), closes [#480](https://github.com/ipfs/js-ipfs/issues/480)
* **cli:** pipe content to the cli from cat it is a stream ([3e4e2fd](https://github.com/ipfs/js-ipfs/commit/3e4e2fd))
* **cli:** use right argument for cli .cat ([2bf49ea](https://github.com/ipfs/js-ipfs/commit/2bf49ea))
* **cli:** use right argument for cli .cat ([dd3fe88](https://github.com/ipfs/js-ipfs/commit/dd3fe88))
* **config:** better http-api and interface-ipfs-core compliant ([2beac9c](https://github.com/ipfs/js-ipfs/commit/2beac9c))
* **http:** get handler reads the stream ([b0a6db9](https://github.com/ipfs/js-ipfs/commit/b0a6db9))
* **swarm:** fix cli commands and enable tests ([6effa19](https://github.com/ipfs/js-ipfs/commit/6effa19))
* **version:** better http-api and interface-ipfs-core compliant ([0ee7215](https://github.com/ipfs/js-ipfs/commit/0ee7215))


### Features

* **add:** add the http endpoint for files.add ([e29f429](https://github.com/ipfs/js-ipfs/commit/e29f429))
* **files:** get interface-ipfs-core files tests pass through http-api ([11cb4ca](https://github.com/ipfs/js-ipfs/commit/11cb4ca))
* **files:** interface-ipfs-core tests over ipfs-api ([001a6eb](https://github.com/ipfs/js-ipfs/commit/001a6eb))
* **swarm:** interface-ipfs-core swarm compatibility ([3b32dfd](https://github.com/ipfs/js-ipfs/commit/3b32dfd))
* **swarm:** make interface-ipfs-core compliant ([ef729bb](https://github.com/ipfs/js-ipfs/commit/ef729bb)), closes [#439](https://github.com/ipfs/js-ipfs/issues/439)
* **tests:** waste less time generating keys ([cb10ab7](https://github.com/ipfs/js-ipfs/commit/cb10ab7))



<a name="0.15.0"></a>
# [0.15.0](https://github.com/ipfs/js-ipfs/compare/v0.14.3...v0.15.0) (2016-09-09)


### Bug Fixes

* **cli:** fix the files API commands ([138f519](https://github.com/ipfs/js-ipfs/commit/138f519))
* **config:** support null values (0 or empty string) on get and set ([a3d98a8](https://github.com/ipfs/js-ipfs/commit/a3d98a8))
* **repo:** init does not break if no opts are passed. Fixes [#349](https://github.com/ipfs/js-ipfs/issues/349) ([ca700cc](https://github.com/ipfs/js-ipfs/commit/ca700cc))
* **style:** apply CR ([97af048](https://github.com/ipfs/js-ipfs/commit/97af048))
* **test:** make the version test fetch the version from package.json instead of a hardcoded value ([50c9f7c](https://github.com/ipfs/js-ipfs/commit/50c9f7c))


### Features

* **bitswap tests, config, id:** cope with the nuances of the config API (.replace) and make necessary changes to make it all work again ([cc0c8fd](https://github.com/ipfs/js-ipfs/commit/cc0c8fd))
* **block-core:** add compliance with interface-ipfs-core on block-API ([5e6387d](https://github.com/ipfs/js-ipfs/commit/5e6387d))
* **block-http:** tests passing according with compliance ([a4071f0](https://github.com/ipfs/js-ipfs/commit/a4071f0))
* **config:** make the config impl spec compliant ([76b6670](https://github.com/ipfs/js-ipfs/commit/76b6670))
* **config-http:** return error if value is invalid ([f7a668d](https://github.com/ipfs/js-ipfs/commit/f7a668d))
* **factory:** add ipfs factory to files ([eba0398](https://github.com/ipfs/js-ipfs/commit/eba0398))
* **factory:** add ipfs factory, verify it works with object tests ([3db096e](https://github.com/ipfs/js-ipfs/commit/3db096e))
* **files.add:** update API to conform latest interface-ipfs-core updates ([28b0bb7](https://github.com/ipfs/js-ipfs/commit/28b0bb7))
* **http:** Refactor inject tests, made them all pass again ([31f673d](https://github.com/ipfs/js-ipfs/commit/31f673d))
* **http:** refactor ipfs-api tests and make them all pass again ([56904fd](https://github.com/ipfs/js-ipfs/commit/56904fd))
* **object-http:** support protobuf encoded values ([5f02303](https://github.com/ipfs/js-ipfs/commit/5f02303))
* **roadmap:** update ([418660f](https://github.com/ipfs/js-ipfs/commit/418660f))
* **roadmap:** update roadmap ms2 with extra added goals ([ac5352e](https://github.com/ipfs/js-ipfs/commit/ac5352e))
* disable PhantomJS ([921b11e](https://github.com/ipfs/js-ipfs/commit/921b11e))
* **tests:** all tests running ([44dba6c](https://github.com/ipfs/js-ipfs/commit/44dba6c))
* **tests:** factory-http ([08a4b19](https://github.com/ipfs/js-ipfs/commit/08a4b19))



<a name="0.14.3"></a>
## [0.14.3](https://github.com/ipfs/js-ipfs/compare/v0.14.2...v0.14.3) (2016-08-10)


### Features

* **interface:** update interface-ipfs-core to v0.6.0 ([d855740](https://github.com/ipfs/js-ipfs/commit/d855740))



<a name="0.14.2"></a>
## [0.14.2](https://github.com/ipfs/js-ipfs/compare/v0.14.1...v0.14.2) (2016-08-09)


### Bug Fixes

* upgrade aegir and ensure glob is mocked ([3c70eaa](https://github.com/ipfs/js-ipfs/commit/3c70eaa)), closes [#354](https://github.com/ipfs/js-ipfs/issues/354) [#353](https://github.com/ipfs/js-ipfs/issues/353)
* **cli:** replace ronin with yargs ([cba42ca](https://github.com/ipfs/js-ipfs/commit/cba42ca)), closes [#331](https://github.com/ipfs/js-ipfs/issues/331)
* **version:** return actual js-ipfs version ([6377ab2](https://github.com/ipfs/js-ipfs/commit/6377ab2)), closes [#377](https://github.com/ipfs/js-ipfs/issues/377)
* use static version of package.json ([3ffdc27](https://github.com/ipfs/js-ipfs/commit/3ffdc27))


### Features

* update all dependencies ([b90747e](https://github.com/ipfs/js-ipfs/commit/b90747e))



<a name="0.14.1"></a>
## [0.14.1](https://github.com/ipfs/js-ipfs/compare/v0.14.0...v0.14.1) (2016-06-29)



<a name="0.14.0"></a>
# [0.14.0](https://github.com/ipfs/js-ipfs/compare/v0.13.0...v0.14.0) (2016-06-27)



<a name="0.13.0"></a>
# [0.13.0](https://github.com/ipfs/js-ipfs/compare/v0.12.0...v0.13.0) (2016-06-07)



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ipfs/js-ipfs/compare/v0.11.1...v0.12.0) (2016-06-06)


### Bug Fixes

* handle new wantlist format ([7850dbb](https://github.com/ipfs/js-ipfs/commit/7850dbb))



<a name="0.11.1"></a>
## [0.11.1](https://github.com/ipfs/js-ipfs/compare/v0.11.0...v0.11.1) (2016-05-30)



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ipfs/js-ipfs/compare/v0.10.3...v0.11.0) (2016-05-27)



<a name="0.10.3"></a>
## [0.10.3](https://github.com/ipfs/js-ipfs/compare/v0.10.2...v0.10.3) (2016-05-26)



<a name="0.10.2"></a>
## [0.10.2](https://github.com/ipfs/js-ipfs/compare/v0.10.1...v0.10.2) (2016-05-26)


### Bug Fixes

* use passed in repo location in the browser ([4b55102](https://github.com/ipfs/js-ipfs/commit/4b55102))



<a name="0.10.1"></a>
## [0.10.1](https://github.com/ipfs/js-ipfs/compare/v0.10.0...v0.10.1) (2016-05-25)



<a name="0.10.0"></a>
# [0.10.0](https://github.com/ipfs/js-ipfs/compare/v0.9.0...v0.10.0) (2016-05-24)



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ipfs/js-ipfs/compare/v0.8.0...v0.9.0) (2016-05-24)



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipfs/js-ipfs/compare/v0.7.0...v0.8.0) (2016-05-23)



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-ipfs/compare/v0.6.1...v0.7.0) (2016-05-21)



<a name="0.6.1"></a>
## [0.6.1](https://github.com/ipfs/js-ipfs/compare/v0.6.0...v0.6.1) (2016-05-19)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-ipfs/compare/v0.5.0...v0.6.0) (2016-05-19)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-ipfs/compare/v0.4.10...v0.5.0) (2016-05-16)


### Bug Fixes

* **files:add:** simplify checkPath ([46d9e6a](https://github.com/ipfs/js-ipfs/commit/46d9e6a))
* **files:get:** simplify checkArgs ([7f89bfb](https://github.com/ipfs/js-ipfs/commit/7f89bfb))
* **http:object:** proper handling of empty args ([9763f86](https://github.com/ipfs/js-ipfs/commit/9763f86))


### Features

* integrate libp2p-ipfs-browser ([6022b46](https://github.com/ipfs/js-ipfs/commit/6022b46))
* make core/object satisfy interface-ipfs-core ([96013bb](https://github.com/ipfs/js-ipfs/commit/96013bb))



<a name="0.4.10"></a>
## [0.4.10](https://github.com/ipfs/js-ipfs/compare/v0.4.9...v0.4.10) (2016-05-08)


### Bug Fixes

* **cli:** self host cmds listing ([a415dc1](https://github.com/ipfs/js-ipfs/commit/a415dc1))
* **core:** consistent repo.exists checks ([3d1e6b0](https://github.com/ipfs/js-ipfs/commit/3d1e6b0))



<a name="0.4.9"></a>
## [0.4.9](https://github.com/ipfs/js-ipfs/compare/v0.4.8...v0.4.9) (2016-04-28)



<a name="0.4.8"></a>
## [0.4.8](https://github.com/ipfs/js-ipfs/compare/v0.4.7...v0.4.8) (2016-04-28)



<a name="0.4.7"></a>
## [0.4.7](https://github.com/ipfs/js-ipfs/compare/v0.4.6...v0.4.7) (2016-04-25)



<a name="0.4.6"></a>
## [0.4.6](https://github.com/ipfs/js-ipfs/compare/v0.4.4...v0.4.6) (2016-04-22)



<a name="0.4.4"></a>
## [0.4.4](https://github.com/ipfs/js-ipfs/compare/v0.4.3...v0.4.4) (2016-03-22)



<a name="0.4.3"></a>
## [0.4.3](https://github.com/ipfs/js-ipfs/compare/v0.4.2...v0.4.3) (2016-03-21)



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipfs/js-ipfs/compare/v0.4.1...v0.4.2) (2016-03-21)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/js-ipfs/compare/v0.4.0...v0.4.1) (2016-03-16)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipfs/compare/v0.3.1...v0.4.0) (2016-02-23)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/ipfs/js-ipfs/compare/v0.3.0...v0.3.1) (2016-02-19)



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-ipfs/compare/v0.2.3...v0.3.0) (2016-02-03)



<a name="0.2.3"></a>
## [0.2.3](https://github.com/ipfs/js-ipfs/compare/v0.2.2...v0.2.3) (2016-01-31)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipfs/js-ipfs/compare/v0.2.1...v0.2.2) (2016-01-28)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipfs/js-ipfs/compare/v0.2.0...v0.2.1) (2016-01-28)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs/compare/v0.0.3...v0.2.0) (2016-01-27)



<a name="0.0.3"></a>
## [0.0.3](https://github.com/ipfs/js-ipfs/compare/v0.0.2...v0.0.3) (2016-01-15)



<a name="0.0.2"></a>
## 0.0.2 (2016-01-11)



