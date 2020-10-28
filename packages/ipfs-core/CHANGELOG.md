# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.1.0 (2020-10-28)


### Bug Fixes

* files ls should return string ([#3352](https://github.com/ipfs/js-ipfs/issues/3352)) ([16ecc74](https://github.com/ipfs/js-ipfs/commit/16ecc7485dfbb1f0c827c5f804974bb804f3dafd)), closes [#3345](https://github.com/ipfs/js-ipfs/issues/3345) [#2939](https://github.com/ipfs/js-ipfs/issues/2939) [#3330](https://github.com/ipfs/js-ipfs/issues/3330) [#2948](https://github.com/ipfs/js-ipfs/issues/2948)
* remove buffer export from ipfs-core ([#3348](https://github.com/ipfs/js-ipfs/issues/3348)) ([5cc6dfe](https://github.com/ipfs/js-ipfs/commit/5cc6dfebf96ad9509e7ded175291789e32402eec)), closes [#3312](https://github.com/ipfs/js-ipfs/issues/3312)
* use fetch in electron renderer and electron-fetch in main ([#3251](https://github.com/ipfs/js-ipfs/issues/3251)) ([639d71f](https://github.com/ipfs/js-ipfs/commit/639d71f7ac8f66d9633e753a2a6be927e14a5af0))


### Features

* enable custom formats for dag put and get ([#3347](https://github.com/ipfs/js-ipfs/issues/3347)) ([3250ff4](https://github.com/ipfs/js-ipfs/commit/3250ff453a1d3275cc4ab746f59f9f70abd5cc5f))
* remove support for SECIO ([#3295](https://github.com/ipfs/js-ipfs/issues/3295)) ([5f5ef7e](https://github.com/ipfs/js-ipfs/commit/5f5ef7ee6cc6dc634cc6adbede0602492490a85d))
* type check & generate defs from jsdoc ([#3281](https://github.com/ipfs/js-ipfs/issues/3281)) ([bbcaf34](https://github.com/ipfs/js-ipfs/commit/bbcaf34111251b142273a5675f4754ff68bd9fa0))


### BREAKING CHANGES

* types returned by `ipfs.files.ls` are now strings, in line with the docs but different to previous behaviour

Co-authored-by: Geoffrey Cohler <g.cohler@computer.org>
* `Buffer` is no longer exported from core
* this removes support for SECIO making Noise the only security transport.

Closes https://github.com/ipfs/js-ipfs/issues/3210

Co-authored-by: achingbrain <alex@achingbrain.net>
