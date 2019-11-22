<a name="0.13.2"></a>
## [0.13.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.13.1...v0.13.2) (2019-11-22)


### Bug Fixes

* response for empty dir when ?stream=true ([14d53ce](https://github.com/ipfs/js-ipfs-mfs/commit/14d53ce)), closes [/github.com/ipfs/interface-js-ipfs-core/blob/c766dbff654fd259f7094070ee71858091898750/src/files-mfs/ls.js#L106-L112](https://github.com//github.com/ipfs/interface-js-ipfs-core/blob/c766dbff654fd259f7094070ee71858091898750/src/files-mfs/ls.js/issues/L106-L112)



<a name="0.13.1"></a>
## [0.13.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.13.0...v0.13.1) (2019-08-29)


### Features

* export MFS root key ([265eee5](https://github.com/ipfs/js-ipfs-mfs/commit/265eee5)), closes [/github.com/ipfs/js-ipfs/pull/2022/files#r303383848](https://github.com//github.com/ipfs/js-ipfs/pull/2022/files/issues/r303383848)



# [0.13.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.12.0...v0.13.0) (2019-08-05)


### Bug Fixes

* update to newest IPLD libraries ([c21e032](https://github.com/ipfs/js-ipfs-mfs/commit/c21e032))



<a name="0.12.0"></a>
# [0.12.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.11.7...v0.12.0) (2019-07-18)


### Features

* support -p flag on cp ([#56](https://github.com/ipfs/js-ipfs-mfs/issues/56)) ([0743d90](https://github.com/ipfs/js-ipfs-mfs/commit/0743d90))



<a name="0.11.7"></a>
## [0.11.7](https://github.com/ipfs/js-ipfs-mfs/compare/v0.11.6...v0.11.7) (2019-07-12)



<a name="0.11.6"></a>
## [0.11.6](https://github.com/ipfs/js-ipfs-mfs/compare/v0.11.5...v0.11.6) (2019-07-12)



<a name="0.11.5"></a>
## [0.11.5](https://github.com/ipfs/js-ipfs-mfs/compare/v0.11.4...v0.11.5) (2019-06-12)


### Bug Fixes

* handle dag-cbor nodes in trail ([3b49d4b](https://github.com/ipfs/js-ipfs-mfs/commit/3b49d4b))
* return the CID for dag-cbor nodes ([#52](https://github.com/ipfs/js-ipfs-mfs/issues/52)) ([4159b90](https://github.com/ipfs/js-ipfs-mfs/commit/4159b90))



<a name="0.11.4"></a>
## [0.11.4](https://github.com/ipfs/js-ipfs-mfs/compare/v0.11.3...v0.11.4) (2019-05-24)



<a name="0.11.3"></a>
## [0.11.3](https://github.com/ipfs/js-ipfs-mfs/compare/v0.11.2...v0.11.3) (2019-05-24)



<a name="0.11.2"></a>
## [0.11.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.11.1...v0.11.2) (2019-05-20)



<a name="0.11.1"></a>
## [0.11.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.11.0...v0.11.1) (2019-05-20)



<a name="0.11.0"></a>
# [0.11.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.10.4...v0.11.0) (2019-05-18)


### Features

* convert to async/await ([#49](https://github.com/ipfs/js-ipfs-mfs/issues/49)) ([f02a941](https://github.com/ipfs/js-ipfs-mfs/commit/f02a941))


### BREAKING CHANGES

* 1. Everything is now async/await
2. No more callbacks, Readable Streams or Pull Streams
3. `stat` and `ls` commands return `cid` objects instead of string hashes
4. `stat` and `ls` commands return all fields, `hash`, `long` etc options are now ignored

* chore: standardise error codes, use latest cids and ipld formats

* chore: update importer and exporter

* chore: update importer again

* chore: update deps



<a name="0.10.4"></a>
## [0.10.4](https://github.com/ipfs/js-ipfs-mfs/compare/v0.10.3...v0.10.4) (2019-04-08)


### Features

* handle raw nodes in mfs ([#48](https://github.com/ipfs/js-ipfs-mfs/issues/48)) ([ad1df5a](https://github.com/ipfs/js-ipfs-mfs/commit/ad1df5a))



<a name="0.10.3"></a>
## [0.10.3](https://github.com/ipfs/js-ipfs-mfs/compare/v0.10.2...v0.10.3) (2019-03-26)


### Bug Fixes

* handle shard updates that create subshards of subshards ([#47](https://github.com/ipfs/js-ipfs-mfs/issues/47)) ([1158951](https://github.com/ipfs/js-ipfs-mfs/commit/1158951))



<a name="0.10.2"></a>
## [0.10.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.10.1...v0.10.2) (2019-03-18)



<a name="0.10.1"></a>
## [0.10.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.9.2...v0.10.1) (2019-03-18)


### Bug Fixes

* correct hamt structure when modifying deep sub-shards ([#46](https://github.com/ipfs/js-ipfs-mfs/issues/46)) ([c08a42f](https://github.com/ipfs/js-ipfs-mfs/commit/c08a42f)), closes [#45](https://github.com/ipfs/js-ipfs-mfs/issues/45)
* expect dir size without protobuf ([ba5b9dc](https://github.com/ipfs/js-ipfs-mfs/commit/ba5b9dc))



<a name="0.10.0"></a>
# [0.10.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.9.2...v0.10.0) (2019-03-18)


### Bug Fixes

* expect dir size without protobuf ([d2ab171](https://github.com/ipfs/js-ipfs-mfs/commit/d2ab171))



<a name="0.9.2"></a>
## [0.9.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.9.1...v0.9.2) (2019-02-19)


### Bug Fixes

* validate and coerce count param for read in HTTP API ([73dc2fc](https://github.com/ipfs/js-ipfs-mfs/commit/73dc2fc))



<a name="0.9.1"></a>
## [0.9.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.9.0...v0.9.1) (2019-01-31)



<a name="0.9.0"></a>
# [0.9.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.8.2...v0.9.0) (2019-01-31)


### Bug Fixes

* parser does not end until file data is consumed ([af4d6f7](https://github.com/ipfs/js-ipfs-mfs/commit/af4d6f7))



<a name="0.8.2"></a>
## [0.8.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.8.1...v0.8.2) (2019-01-16)



<a name="0.8.1"></a>
## [0.8.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.8.0...v0.8.1) (2019-01-04)


### Bug Fixes

* initialise progress as noop ([2a8cf65](https://github.com/ipfs/js-ipfs-mfs/commit/2a8cf65))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.7.7...v0.8.0) (2018-12-04)


### Features

* add streaming option to http ([d832277](https://github.com/ipfs/js-ipfs-mfs/commit/d832277))



<a name="0.7.7"></a>
## [0.7.7](https://github.com/ipfs/js-ipfs-mfs/compare/v0.7.6...v0.7.7) (2018-12-04)


### Bug Fixes

* flush should error on non-existent entries ([dbe7089](https://github.com/ipfs/js-ipfs-mfs/commit/dbe7089))



<a name="0.7.6"></a>
## [0.7.6](https://github.com/ipfs/js-ipfs-mfs/compare/v0.7.5...v0.7.6) (2018-12-04)


### Features

* push sorting out of core ([4ce16b7](https://github.com/ipfs/js-ipfs-mfs/commit/4ce16b7))



<a name="0.7.5"></a>
## [0.7.5](https://github.com/ipfs/js-ipfs-mfs/compare/v0.7.4...v0.7.5) (2018-12-04)


### Bug Fixes

* fix regex for splitting files ([a8142d3](https://github.com/ipfs/js-ipfs-mfs/commit/a8142d3))



<a name="0.7.4"></a>
## [0.7.4](https://github.com/ipfs/js-ipfs-mfs/compare/v0.7.3...v0.7.4) (2018-12-03)



<a name="0.7.3"></a>
## [0.7.3](https://github.com/ipfs/js-ipfs-mfs/compare/v0.7.2...v0.7.3) (2018-12-02)


### Bug Fixes

* add missing dependency ([cc7d708](https://github.com/ipfs/js-ipfs-mfs/commit/cc7d708))



<a name="0.7.2"></a>
## [0.7.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.7.1...v0.7.2) (2018-12-01)


### Bug Fixes

* handle sub-sub shards properly ([9302f01](https://github.com/ipfs/js-ipfs-mfs/commit/9302f01))
* make sure hashes are the same after shard changes ([b2fbd5d](https://github.com/ipfs/js-ipfs-mfs/commit/b2fbd5d))



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.7.0...v0.7.1) (2018-11-29)


### Performance Improvements

* do not load a node when we only want the hash or size ([a029c7e](https://github.com/ipfs/js-ipfs-mfs/commit/a029c7e))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.6.0...v0.7.0) (2018-11-28)


### Features

* adds ls streaming methods ([1b07f58](https://github.com/ipfs/js-ipfs-mfs/commit/1b07f58)), closes [ipfs/interface-ipfs-core#401](https://github.com/ipfs/interface-ipfs-core/issues/401)


### Performance Improvements

* do not list directory contents when statting files ([d16a4e4](https://github.com/ipfs/js-ipfs-mfs/commit/d16a4e4))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.5.2...v0.6.0) (2018-11-28)


### Features

* support sharded directories ([e1c7308](https://github.com/ipfs/js-ipfs-mfs/commit/e1c7308))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.5.1...v0.5.2) (2018-11-16)


### Bug Fixes

* support `count` as well as `length` ([e787bf9](https://github.com/ipfs/js-ipfs-mfs/commit/e787bf9)), closes [#21](https://github.com/ipfs/js-ipfs-mfs/issues/21)



<a name="0.5.1"></a>
## [0.5.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.5.0...v0.5.1) (2018-11-16)


### Features

* allow write and mkdir with different hash algs and cid versions ([0a12b3e](https://github.com/ipfs/js-ipfs-mfs/commit/0a12b3e))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.4.2...v0.5.0) (2018-11-12)


### Bug Fixes

* updates ipld-dag-pb dep to version without .cid properties ([fa9029d](https://github.com/ipfs/js-ipfs-mfs/commit/fa9029d)), closes [ipld/js-ipld-dag-pb#99](https://github.com/ipld/js-ipld-dag-pb/issues/99) [#24](https://github.com/ipfs/js-ipfs-mfs/issues/24)
* use ipfs.add instead of files.add ([6aa245f](https://github.com/ipfs/js-ipfs-mfs/commit/6aa245f))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.4.1...v0.4.2) (2018-10-24)



<a name="0.4.1"></a>
## [0.4.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.4.0...v0.4.1) (2018-10-01)


### Bug Fixes

* simplify write command ([710a2d6](https://github.com/ipfs/js-ipfs-mfs/commit/710a2d6))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.3.2...v0.4.0) (2018-09-28)


### Bug Fixes

* allow for graceful release with datastore-level ([64ff6a1](https://github.com/ipfs/js-ipfs-mfs/commit/64ff6a1))
* avoid creating a cid with a null result ([59bcf3c](https://github.com/ipfs/js-ipfs-mfs/commit/59bcf3c))
* update database not found error ([62212c4](https://github.com/ipfs/js-ipfs-mfs/commit/62212c4))
* update read cli to use returned pull stream ([62cf0cd](https://github.com/ipfs/js-ipfs-mfs/commit/62cf0cd))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.3.1...v0.3.2) (2018-08-23)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.3.0...v0.3.1) (2018-08-20)


### Bug Fixes

* make error messages consistent with go for interop tests ([08f60c3](https://github.com/ipfs/js-ipfs-mfs/commit/08f60c3))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.2.5...v0.3.0) (2018-08-09)


### Performance Improvements

* write files to repo outside of write lock ([63940b4](https://github.com/ipfs/js-ipfs-mfs/commit/63940b4))



<a name="0.2.5"></a>
## [0.2.5](https://github.com/ipfs/js-ipfs-mfs/compare/v0.2.4...v0.2.5) (2018-08-02)


### Bug Fixes

* removes extra sort added to ensure go compatibility ([c211941](https://github.com/ipfs/js-ipfs-mfs/commit/c211941)), closes [ipfs/go-ipfs#5181](https://github.com/ipfs/go-ipfs/issues/5181)



<a name="0.2.4"></a>
## [0.2.4](https://github.com/ipfs/js-ipfs-mfs/compare/v0.2.3...v0.2.4) (2018-07-31)


### Bug Fixes

* prevent returning from http write command early ([1018e7d](https://github.com/ipfs/js-ipfs-mfs/commit/1018e7d))



<a name="0.2.3"></a>
## [0.2.3](https://github.com/ipfs/js-ipfs-mfs/compare/v0.2.2...v0.2.3) (2018-07-26)



<a name="0.2.2"></a>
## [0.2.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.2.1...v0.2.2) (2018-07-20)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.2.0...v0.2.1) (2018-07-20)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.1.1...v0.2.0) (2018-07-19)



<a name="0.1.1"></a>
## [0.1.1](https://github.com/ipfs/js-ipfs-mfs/compare/v0.1.0...v0.1.1) (2018-07-19)


### Features

* adds --cid-base argument to stringify cids in different bases ([5ee75a6](https://github.com/ipfs/js-ipfs-mfs/commit/5ee75a6))
* support --raw-leaves ([61f77dc](https://github.com/ipfs/js-ipfs-mfs/commit/61f77dc))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.17...v0.1.0) (2018-07-13)



<a name="0.0.17"></a>
## [0.0.17](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.16...v0.0.17) (2018-07-13)



<a name="0.0.16"></a>
## [0.0.16](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.15...v0.0.16) (2018-07-10)


### Bug Fixes

* handle copying files onto each other ([749b7a2](https://github.com/ipfs/js-ipfs-mfs/commit/749b7a2))



<a name="0.0.15"></a>
## [0.0.15](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.14...v0.0.15) (2018-07-10)


### Bug Fixes

* refuse to read directories ([1a81d66](https://github.com/ipfs/js-ipfs-mfs/commit/1a81d66))



<a name="0.0.14"></a>
## [0.0.14](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.13...v0.0.14) (2018-07-05)



<a name="0.0.13"></a>
## [0.0.13](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.12...v0.0.13) (2018-07-04)



<a name="0.0.12"></a>
## [0.0.12](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.11...v0.0.12) (2018-07-04)



<a name="0.0.11"></a>
## [0.0.11](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.10...v0.0.11) (2018-07-03)



<a name="0.0.10"></a>
## [0.0.10](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.9...v0.0.10) (2018-07-03)



<a name="0.0.9"></a>
## [0.0.9](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.8...v0.0.9) (2018-07-03)



<a name="0.0.8"></a>
## [0.0.8](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.7...v0.0.8) (2018-07-02)



<a name="0.0.7"></a>
## [0.0.7](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.6...v0.0.7) (2018-06-29)



<a name="0.0.6"></a>
## [0.0.6](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.5...v0.0.6) (2018-06-27)



<a name="0.0.5"></a>
## [0.0.5](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.4...v0.0.5) (2018-06-27)



<a name="0.0.4"></a>
## [0.0.4](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.3...v0.0.4) (2018-06-14)



<a name="0.0.3"></a>
## [0.0.3](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.2...v0.0.3) (2018-06-13)



<a name="0.0.2"></a>
## [0.0.2](https://github.com/ipfs/js-ipfs-mfs/compare/v0.0.1...v0.0.2) (2018-06-12)


### Features

* added mv command ([1577094](https://github.com/ipfs/js-ipfs-mfs/commit/1577094))
* adds rm command ([682c478](https://github.com/ipfs/js-ipfs-mfs/commit/682c478))
* allow for truncating files ([c515184](https://github.com/ipfs/js-ipfs-mfs/commit/c515184))
* basic mfs.write command ([ccecb1b](https://github.com/ipfs/js-ipfs-mfs/commit/ccecb1b))
* copy directories ([cb0135c](https://github.com/ipfs/js-ipfs-mfs/commit/cb0135c))
* Happy path mfs.write command ([2ea064b](https://github.com/ipfs/js-ipfs-mfs/commit/2ea064b))
* implement streaming mfs.read methods ([3e5620b](https://github.com/ipfs/js-ipfs-mfs/commit/3e5620b))
* integrate with jsipfs cli ([79981d8](https://github.com/ipfs/js-ipfs-mfs/commit/79981d8))
* mfs ls and mkdir commands ([bad24b3](https://github.com/ipfs/js-ipfs-mfs/commit/bad24b3))
* More stat tests ([d4fc07e](https://github.com/ipfs/js-ipfs-mfs/commit/d4fc07e))
* most of the cp command ([5d189a6](https://github.com/ipfs/js-ipfs-mfs/commit/5d189a6))
* Replacing chunks of files that do not increase the size of the file ([77b5c32](https://github.com/ipfs/js-ipfs-mfs/commit/77b5c32))
* simple mfs.read command ([035fde5](https://github.com/ipfs/js-ipfs-mfs/commit/035fde5))
* Stat command working on directories ([4671b2e](https://github.com/ipfs/js-ipfs-mfs/commit/4671b2e))





<a name="0.0.1"></a>
# [0.0.1](https://github.com/ipfs/js-ipfs-mfs/releases/tag/v0.0.1)

Initial release.  No features but also no bugs.
