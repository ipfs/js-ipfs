# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.8.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.7.1...ipfs-core@0.8.0) (2021-06-18)


### Bug Fixes

* repo auto-migration regression ([#3718](https://github.com/ipfs/js-ipfs/issues/3718)) ([b5470d4](https://github.com/ipfs/js-ipfs/commit/b5470d40ea455069f3f3bd7ab3fb42d7c08926b4)), closes [#3712](https://github.com/ipfs/js-ipfs/issues/3712)


### Features

* support v2 ipns signatures ([#3708](https://github.com/ipfs/js-ipfs/issues/3708)) ([ade01d1](https://github.com/ipfs/js-ipfs/commit/ade01d138bb185fda902c0a3f7fa14d5bfd48a5e))





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.7.0...ipfs-core@0.7.1) (2021-06-05)


### Bug Fixes

* stalling subscription on (node) http-client when daemon is stopped ([#3468](https://github.com/ipfs/js-ipfs/issues/3468)) ([0266abf](https://github.com/ipfs/js-ipfs/commit/0266abf0c4b817636172f78c6e91eb4dd5aad451)), closes [#3465](https://github.com/ipfs/js-ipfs/issues/3465)





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.6.1...ipfs-core@0.7.0) (2021-05-26)


### Bug Fixes

* remove optional chaining from code that will be transpiled ([#3698](https://github.com/ipfs/js-ipfs/issues/3698)) ([96b3909](https://github.com/ipfs/js-ipfs/commit/96b39099efb051b7a76f0afc2ff9429997c73971))


### Features

* allow passing the id of a network peer to ipfs.id ([#3386](https://github.com/ipfs/js-ipfs/issues/3386)) ([00fd709](https://github.com/ipfs/js-ipfs/commit/00fd709a7b71e7cf354ea452ebce460dd7375d34))





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.6.0...ipfs-core@0.6.1) (2021-05-11)


### Bug Fixes

* ipfs get with raw blocks ([#3683](https://github.com/ipfs/js-ipfs/issues/3683)) ([28235b0](https://github.com/ipfs/js-ipfs/commit/28235b02558c513e1119dfd3d12b622d67546eca)), closes [#3682](https://github.com/ipfs/js-ipfs/issues/3682)





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.4...ipfs-core@0.6.0) (2021-05-10)


### Bug Fixes

* do not republish self key twice ([#3634](https://github.com/ipfs/js-ipfs/issues/3634)) ([8545a76](https://github.com/ipfs/js-ipfs/commit/8545a763daa38aefa71cca514016ba400363830a))
* fix types ([#3662](https://github.com/ipfs/js-ipfs/issues/3662)) ([0fe8892](https://github.com/ipfs/js-ipfs/commit/0fe8892361180dab53ed3c3b006479b32a792d44))
* mark ipld options as partial ([#3669](https://github.com/ipfs/js-ipfs/issues/3669)) ([f98af8e](https://github.com/ipfs/js-ipfs/commit/f98af8ed24784929898bb5d33a64dc442c77074d))
* only accept cid for ipfs.dag.get ([#3675](https://github.com/ipfs/js-ipfs/issues/3675)) ([bb8f8bc](https://github.com/ipfs/js-ipfs/commit/bb8f8bc501ffc1ee0f064ba61ec0bca4015bf6ad)), closes [#3637](https://github.com/ipfs/js-ipfs/issues/3637)
* update ipfs repo ([#3671](https://github.com/ipfs/js-ipfs/issues/3671)) ([9029ee5](https://github.com/ipfs/js-ipfs/commit/9029ee591fa74ea65c9600f2d249897e933416fa))
* update types after feedback from ceramic ([#3657](https://github.com/ipfs/js-ipfs/issues/3657)) ([0ddbb1b](https://github.com/ipfs/js-ipfs/commit/0ddbb1b1deb4e40dac3e365d7f98a5f174c2ce8f)), closes [#3640](https://github.com/ipfs/js-ipfs/issues/3640)


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### Features

* support identity hash in block.get + dag.get ([#3616](https://github.com/ipfs/js-ipfs/issues/3616)) ([28ad9ad](https://github.com/ipfs/js-ipfs/commit/28ad9ad6e50abb89a366ecd6b5301e848f0e9962))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.5.4](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.3...ipfs-core@0.5.4) (2021-03-10)

**Note:** Version bump only for package ipfs-core





## [0.5.3](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.2...ipfs-core@0.5.3) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.1...ipfs-core@0.5.2) (2021-02-08)


### Bug Fixes

* ts types after multihashing-async release ([#3529](https://github.com/ipfs/js-ipfs/issues/3529)) ([95b891f](https://github.com/ipfs/js-ipfs/commit/95b891f10e0661f508e8641a1c5d41ea9194c630)), closes [#3527](https://github.com/ipfs/js-ipfs/issues/3527)





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.5.0...ipfs-core@0.5.1) (2021-02-02)

**Note:** Version bump only for package ipfs-core





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.4.2...ipfs-core@0.5.0) (2021-02-01)


### Bug Fixes

* updates webpack example to use v5 ([#3512](https://github.com/ipfs/js-ipfs/issues/3512)) ([c7110db](https://github.com/ipfs/js-ipfs/commit/c7110db71b5c0f0f9f415f31f91b5b228341e13e)), closes [#3511](https://github.com/ipfs/js-ipfs/issues/3511)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### Features

* enable upnp nat hole punching ([#3426](https://github.com/ipfs/js-ipfs/issues/3426)) ([65dc161](https://github.com/ipfs/js-ipfs/commit/65dc161feebe154b4a2d1472940dc9e70fbb817f))
* support  remote pinning services in ipfs-http-client ([#3293](https://github.com/ipfs/js-ipfs/issues/3293)) ([ba240fd](https://github.com/ipfs/js-ipfs/commit/ba240fdf93edc88028315483240d7822a7ca88ed))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.4.2](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.4.1...ipfs-core@0.4.2) (2021-01-22)

**Note:** Version bump only for package ipfs-core





## [0.4.1](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.4.0...ipfs-core@0.4.1) (2021-01-20)

**Note:** Version bump only for package ipfs-core





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-core@0.3.1...ipfs-core@0.4.0) (2021-01-15)


### chore

* update libp2p to 0.30 ([#3427](https://github.com/ipfs/js-ipfs/issues/3427)) ([a39e6fb](https://github.com/ipfs/js-ipfs/commit/a39e6fb372bf9e7782462b6a4b7530a3f8c9b3f1))


### Features

* add grpc server and client ([#3403](https://github.com/ipfs/js-ipfs/issues/3403)) ([a9027e0](https://github.com/ipfs/js-ipfs/commit/a9027e0ec0cea9a4f34b4f2f52e09abb35237384)), closes [#2519](https://github.com/ipfs/js-ipfs/issues/2519) [#2838](https://github.com/ipfs/js-ipfs/issues/2838) [#2943](https://github.com/ipfs/js-ipfs/issues/2943) [#2854](https://github.com/ipfs/js-ipfs/issues/2854) [#2864](https://github.com/ipfs/js-ipfs/issues/2864)
* allow passing a http.Agent to the grpc client ([#3477](https://github.com/ipfs/js-ipfs/issues/3477)) ([c5f0bc5](https://github.com/ipfs/js-ipfs/commit/c5f0bc5eeee15369b7d02901035b04184a8608d2)), closes [#3474](https://github.com/ipfs/js-ipfs/issues/3474)


### BREAKING CHANGES

* The websocket transport will only dial DNS+WSS addresses - see https://github.com/libp2p/js-libp2p-websockets/releases/tag/v0.15.0

Co-authored-by: Hugo Dias <hugomrdias@gmail.com>





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
