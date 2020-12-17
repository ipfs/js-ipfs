# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.3.0...ipfs-core@0.3.1) (2020-12-16)


### Bug Fixes

* export IPFS type ([#3447](https://github.com/ipfs/js-ipfs/issues/3447)) ([cacbfc6](https://github.com/ipfs/js-ipfs/commit/cacbfc6e87eabee0e2a6df2056ac5cc993690a0d)), closes [#3439](https://github.com/ipfs/js-ipfs/issues/3439)
* fix ipfs.ls() for a single file object ([#3440](https://github.com/ipfs/js-ipfs/issues/3440)) ([f243dd1](https://github.com/ipfs/js-ipfs/commit/f243dd1c37fcb9786d77d129cd9b238457d18a15))
* regressions introduced by new releases of CID & multicodec ([#3442](https://github.com/ipfs/js-ipfs/issues/3442)) ([b5152d8](https://github.com/ipfs/js-ipfs/commit/b5152d8cc93ecc8d39fc353ea66d7eaf1661e3c0)), closes [/github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb#diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26](https://github.com//github.com/multiformats/js-cid/commit/0e11f035c9230e7f6d79c159ace9b80de88cb5eb/issues/diff-25a6634263c1b1f6fc4697a04e2b9904ea4b042a89af59dc93ec1f5d44848a26)





# [0.3.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.2.1...ipfs-core@0.3.0) (2020-11-25)


### Features

* announce addresses via config ([#3409](https://github.com/ipfs/js-ipfs/issues/3409)) ([1529da9](https://github.com/ipfs/js-ipfs/commit/1529da9bb2f31eeb525584e67a3e0548b4445721))





## [0.2.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.2.0...ipfs-core@0.2.1) (2020-11-16)


### Bug Fixes

* ensure correct progress is reported ([#3384](https://github.com/ipfs/js-ipfs/issues/3384)) ([633d870](https://github.com/ipfs/js-ipfs/commit/633d8704f74534542f54536bc6960528214339a2))
* report ipfs.add progress over http ([#3310](https://github.com/ipfs/js-ipfs/issues/3310)) ([39cad4b](https://github.com/ipfs/js-ipfs/commit/39cad4b76b950ea6a76477fd01f8631b8bd9aa1e))





# [0.2.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.1.0...ipfs-core@0.2.0) (2020-11-09)


### Bug Fixes

* cache preloaded CIDs ([#3363](https://github.com/ipfs/js-ipfs/issues/3363)) ([b5ea76a](https://github.com/ipfs/js-ipfs/commit/b5ea76ad29082fb40e9fc72ef6223039f1ea3be4)), closes [#3307](https://github.com/ipfs/js-ipfs/issues/3307)
* typedef resolution & add examples that use types ([#3359](https://github.com/ipfs/js-ipfs/issues/3359)) ([dc2795a](https://github.com/ipfs/js-ipfs/commit/dc2795a4f3b515683d09967ce611bf87d5e67f86)), closes [#3356](https://github.com/ipfs/js-ipfs/issues/3356) [#3358](https://github.com/ipfs/js-ipfs/issues/3358)


### Features

* pass file name to add/addAll progress handler ([#3372](https://github.com/ipfs/js-ipfs/issues/3372)) ([69681a7](https://github.com/ipfs/js-ipfs/commit/69681a7d7a8434c11f6f10e370e324f5a3d31042)), closes [ipfs/js-ipfs-unixfs#87](https://github.com/ipfs/js-ipfs-unixfs/issues/87)
* remove all esoteric ipld formats ([#3360](https://github.com/ipfs/js-ipfs/issues/3360)) ([a542882](https://github.com/ipfs/js-ipfs/commit/a5428820a5b157fbb298b8eb49978e08157beca3)), closes [#3347](https://github.com/ipfs/js-ipfs/issues/3347)


### BREAKING CHANGES

* only dag-pb, dag-cbor and raw formats are supported out of the box, any others will need to be configured during node startup.





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
