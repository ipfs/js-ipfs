<a name="0.7.2"></a>
## [0.7.2](https://github.com/ipfs/js-ipfs-utils/compare/v0.7.1...v0.7.2) (2020-02-10)


### Bug Fixes

* number is not a valid mtime value ([#24](https://github.com/ipfs/js-ipfs-utils/issues/24)) ([bb2d841](https://github.com/ipfs/js-ipfs-utils/commit/bb2d841)), closes [/github.com/ipfs/js-ipfs-unixfs/blob/master/src/index.js#L104-L106](https://github.com//github.com/ipfs/js-ipfs-unixfs/blob/master/src/index.js/issues/L104-L106)



<a name="0.7.1"></a>
## [0.7.1](https://github.com/ipfs/js-ipfs-utils/compare/v0.7.0...v0.7.1) (2020-01-23)


### Bug Fixes

* downgrade to ky 15 ([#22](https://github.com/ipfs/js-ipfs-utils/issues/22)) ([5dd7570](https://github.com/ipfs/js-ipfs-utils/commit/5dd7570))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.6.0...v0.7.0) (2020-01-23)


### Features

* accept browser readable streams as input ([#21](https://github.com/ipfs/js-ipfs-utils/issues/21)) ([0902067](https://github.com/ipfs/js-ipfs-utils/commit/0902067))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.5.0...v0.6.0) (2020-01-09)


### Bug Fixes

* dependency badge URL ([#16](https://github.com/ipfs/js-ipfs-utils/issues/16)) ([5d93881](https://github.com/ipfs/js-ipfs-utils/commit/5d93881))
* format mtime as timespec ([#20](https://github.com/ipfs/js-ipfs-utils/issues/20)) ([a68f8b1](https://github.com/ipfs/js-ipfs-utils/commit/a68f8b1))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.4.0...v0.5.0) (2019-12-06)


### Features

* convert to async iterators ([#15](https://github.com/ipfs/js-ipfs-utils/issues/15)) ([251eff0](https://github.com/ipfs/js-ipfs-utils/commit/251eff0))
* support unixfs metadata and formatting it ([#14](https://github.com/ipfs/js-ipfs-utils/issues/14)) ([173e4bf](https://github.com/ipfs/js-ipfs-utils/commit/173e4bf))


### BREAKING CHANGES

* In order to support metadata on intermediate directories, globSource in this module will now emit directories and files where previously it only emitted files.
* Support for Node.js streams and Pull Streams has been removed



<a name="0.4.0"></a>
# [0.4.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.3.0...v0.4.0) (2019-09-19)


### Features

* add isElectronMain env test ([#13](https://github.com/ipfs/js-ipfs-utils/issues/13)) ([9072c90](https://github.com/ipfs/js-ipfs-utils/commit/9072c90))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.2.0...v0.3.0) (2019-09-15)


### Features

* support old school streams ([#12](https://github.com/ipfs/js-ipfs-utils/issues/12)) ([18cfa86](https://github.com/ipfs/js-ipfs-utils/commit/18cfa86))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.1.0...v0.2.0) (2019-09-06)


### Features

* env/isTest ([#10](https://github.com/ipfs/js-ipfs-utils/issues/10)) ([481aab1](https://github.com/ipfs/js-ipfs-utils/commit/481aab1))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/ipfs/js-ipfs-utils/compare/v0.0.4...v0.1.0) (2019-09-04)


### Bug Fixes

* write after end ([#7](https://github.com/ipfs/js-ipfs-utils/issues/7)) ([b30d7a3](https://github.com/ipfs/js-ipfs-utils/commit/b30d7a3))


### Features

* add glob-source from js-ipfs to be shared ([#9](https://github.com/ipfs/js-ipfs-utils/issues/9)) ([0a95ef8](https://github.com/ipfs/js-ipfs-utils/commit/0a95ef8))
* add normalise input function ([#5](https://github.com/ipfs/js-ipfs-utils/issues/5)) ([b22b8de](https://github.com/ipfs/js-ipfs-utils/commit/b22b8de)), closes [#8](https://github.com/ipfs/js-ipfs-utils/issues/8)



<a name="0.0.4"></a>
## [0.0.4](https://github.com/ipfs/js-ipfs-utils/compare/v0.0.3...v0.0.4) (2019-07-18)


### Features

* add globalThis polyfill ([f0c7c42](https://github.com/ipfs/js-ipfs-utils/commit/f0c7c42))



<a name="0.0.3"></a>
## [0.0.3](https://github.com/ipfs/js-ipfs-utils/compare/v0.0.2...v0.0.3) (2019-05-16)



<a name="0.0.2"></a>
## 0.0.2 (2019-05-16)


### Bug Fixes

* use is-buffer ([bbf5baf](https://github.com/ipfs/js-ipfs-utils/commit/bbf5baf))



