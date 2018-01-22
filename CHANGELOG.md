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



