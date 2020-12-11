# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.1.3](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.1.2...ipfs-http-server@0.1.3) (2020-11-25)

**Note:** Version bump only for package ipfs-http-server





## [0.1.2](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.1.1...ipfs-http-server@0.1.2) (2020-11-16)


### Bug Fixes

* align behaviour between go and js for content without paths ([#3385](https://github.com/ipfs/js-ipfs/issues/3385)) ([334873d](https://github.com/ipfs/js-ipfs/commit/334873d3784e2baa2b19f8f69b5aade36715ba03))





## [0.1.1](https://github.com/ipfs/js-ipfs/compare/ipfs-http-server@0.1.0...ipfs-http-server@0.1.1) (2020-11-09)

**Note:** Version bump only for package ipfs-http-server





# 0.1.0 (2020-10-28)


### Bug Fixes

* files ls should return string ([#3352](https://github.com/ipfs/js-ipfs/issues/3352)) ([16ecc74](https://github.com/ipfs/js-ipfs/commit/16ecc7485dfbb1f0c827c5f804974bb804f3dafd)), closes [#3345](https://github.com/ipfs/js-ipfs/issues/3345) [#2939](https://github.com/ipfs/js-ipfs/issues/2939) [#3330](https://github.com/ipfs/js-ipfs/issues/3330) [#2948](https://github.com/ipfs/js-ipfs/issues/2948)
* use fetch in electron renderer and electron-fetch in main ([#3251](https://github.com/ipfs/js-ipfs/issues/3251)) ([639d71f](https://github.com/ipfs/js-ipfs/commit/639d71f7ac8f66d9633e753a2a6be927e14a5af0))


### Features

* enable custom formats for dag put and get ([#3347](https://github.com/ipfs/js-ipfs/issues/3347)) ([3250ff4](https://github.com/ipfs/js-ipfs/commit/3250ff453a1d3275cc4ab746f59f9f70abd5cc5f))
* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))
* webui v2.11.4 ([#3317](https://github.com/ipfs/js-ipfs/issues/3317)) ([7f32f7f](https://github.com/ipfs/js-ipfs/commit/7f32f7fd1eb3cffc3cd529827e4af7a8a08e36d9))


### BREAKING CHANGES

* types returned by `ipfs.files.ls` are now strings, in line with the docs but different to previous behaviour

Co-authored-by: Geoffrey Cohler <g.cohler@computer.org>
