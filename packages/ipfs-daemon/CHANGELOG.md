# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.11.0](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.10.4...ipfs-daemon@0.11.0) (2021-12-15)


### Features

* dht client ([#3947](https://github.com/ipfs/js-ipfs/issues/3947)) ([62d8ecb](https://github.com/ipfs/js-ipfs/commit/62d8ecbc723e693a2544e69172d99c576d187c23))
* improve collected metrics ([#3978](https://github.com/ipfs/js-ipfs/issues/3978)) ([33f1034](https://github.com/ipfs/js-ipfs/commit/33f1034a6fc257f1a87de7bb38d876925f61cb5f))


### BREAKING CHANGES

* The DHT API has been refactored to return async iterators of query events





### [0.12.2](https://www.github.com/ipfs/js-ipfs/compare/ipfs-daemon-v0.12.1...ipfs-daemon-v0.12.2) (2022-03-01)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core bumped from ^0.14.1 to ^0.14.2
    * ipfs-core-types bumped from ^0.10.1 to ^0.10.2
    * ipfs-grpc-server bumped from ^0.8.2 to ^0.8.3
    * ipfs-http-gateway bumped from ^0.9.1 to ^0.9.2
    * ipfs-http-server bumped from ^0.11.1 to ^0.11.2

### [0.12.1](https://www.github.com/ipfs/js-ipfs/compare/ipfs-daemon-v0.12.0...ipfs-daemon-v0.12.1) (2022-02-06)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core bumped from ^0.14.0 to ^0.14.1
    * ipfs-core-types bumped from ^0.10.0 to ^0.10.1
    * ipfs-grpc-server bumped from ^0.8.1 to ^0.8.2
    * ipfs-http-gateway bumped from ^0.9.0 to ^0.9.1
    * ipfs-http-server bumped from ^0.11.0 to ^0.11.1

## [0.12.0](https://www.github.com/ipfs/js-ipfs/compare/ipfs-daemon-v0.11.0...ipfs-daemon-v0.12.0) (2022-01-27)


### ⚠ BREAKING CHANGES

* peerstore methods are now all async, the repo is migrated to v12

### Features

* libp2p async peerstore ([#4018](https://www.github.com/ipfs/js-ipfs/issues/4018)) ([a6b201a](https://www.github.com/ipfs/js-ipfs/commit/a6b201af2c3697430ab0ebe002dd573d185f1ac0))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ipfs-core bumped from ^0.13.0 to ^0.14.0
    * ipfs-core-types bumped from ^0.9.0 to ^0.10.0
    * ipfs-grpc-server bumped from ^0.8.0 to ^0.8.1
    * ipfs-http-gateway bumped from ^0.8.0 to ^0.9.0
    * ipfs-http-server bumped from ^0.10.0 to ^0.11.0

## [0.10.4](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.10.3...ipfs-daemon@0.10.4) (2021-11-24)

**Note:** Version bump only for package ipfs-daemon





## [0.10.3](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.10.2...ipfs-daemon@0.10.3) (2021-11-19)

**Note:** Version bump only for package ipfs-daemon





## [0.10.2](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.10.1...ipfs-daemon@0.10.2) (2021-11-12)

**Note:** Version bump only for package ipfs-daemon





## [0.10.1](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.10.0...ipfs-daemon@0.10.1) (2021-09-28)

**Note:** Version bump only for package ipfs-daemon





# [0.10.0](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.9.8...ipfs-daemon@0.10.0) (2021-09-24)


### Features

* pull in new globSource ([#3889](https://github.com/ipfs/js-ipfs/issues/3889)) ([be4a542](https://github.com/ipfs/js-ipfs/commit/be4a5428ebc4b05a2edd9a91bf9df6416c1a8c2b))
* switch to esm ([#3879](https://github.com/ipfs/js-ipfs/issues/3879)) ([9a40109](https://github.com/ipfs/js-ipfs/commit/9a40109632e5b4837eb77a2f57dbc77fbf1fe099))


### BREAKING CHANGES

* the globSource api has changed from `globSource(dir, opts)` to `globSource(dir, pattern, opts)`
* There are no default exports and everything is now dual published as ESM/CJS





## [0.9.8](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.9.7...ipfs-daemon@0.9.8) (2021-09-17)

**Note:** Version bump only for package ipfs-daemon





## [0.9.7](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.9.6...ipfs-daemon@0.9.7) (2021-09-17)

**Note:** Version bump only for package ipfs-daemon





## [0.9.6](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.9.5...ipfs-daemon@0.9.6) (2021-09-08)

**Note:** Version bump only for package ipfs-daemon





## [0.9.5](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.9.4...ipfs-daemon@0.9.5) (2021-09-02)


### Bug Fixes

* remove use of instanceof for CID class ([#3847](https://github.com/ipfs/js-ipfs/issues/3847)) ([ebbb12d](https://github.com/ipfs/js-ipfs/commit/ebbb12db523c53ce8e4ddae5266cd9acb3504431))





## [0.9.4](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.9.3...ipfs-daemon@0.9.4) (2021-08-25)

**Note:** Version bump only for package ipfs-daemon





## [0.9.3](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.9.1...ipfs-daemon@0.9.3) (2021-08-17)

**Note:** Version bump only for package ipfs-daemon





## [0.9.1](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.9.0...ipfs-daemon@0.9.1) (2021-08-17)

**Note:** Version bump only for package ipfs-daemon





# [0.9.0](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.8.1...ipfs-daemon@0.9.0) (2021-08-11)


### Features

* make ipfs.get output tarballs ([#3785](https://github.com/ipfs/js-ipfs/issues/3785)) ([1ad6001](https://github.com/ipfs/js-ipfs/commit/1ad60018d39d5b46c484756631e30e1989fd8eba))


### BREAKING CHANGES

* the output type of `ipfs.get` has changed and the `recursive` option has been removed from `ipfs.ls` since it was not supported everywhere





## [0.8.1](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.8.0...ipfs-daemon@0.8.1) (2021-07-30)

**Note:** Version bump only for package ipfs-daemon





# [0.8.0](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.7.2...ipfs-daemon@0.8.0) (2021-07-27)


### Features

* upgrade to the new multiformats ([#3556](https://github.com/ipfs/js-ipfs/issues/3556)) ([d13d15f](https://github.com/ipfs/js-ipfs/commit/d13d15f022a87d04a35f0f7822142f9cb898479c))


### BREAKING CHANGES

* ipld-formats no longer supported, use multiformat BlockCodecs instead

Co-authored-by: Rod Vagg <rod@vagg.org>
Co-authored-by: achingbrain <alex@achingbrain.net>





## [0.7.2](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.7.1...ipfs-daemon@0.7.2) (2021-06-18)

**Note:** Version bump only for package ipfs-daemon





## [0.7.1](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.7.0...ipfs-daemon@0.7.1) (2021-06-05)


### Bug Fixes

* move wrtc to optional deps ([#3705](https://github.com/ipfs/js-ipfs/issues/3705)) ([7cf404c](https://github.com/ipfs/js-ipfs/commit/7cf404c8fd11888fa803c6167bd2ec62d94a2b34))
* stalling subscription on (node) http-client when daemon is stopped ([#3468](https://github.com/ipfs/js-ipfs/issues/3468)) ([0266abf](https://github.com/ipfs/js-ipfs/commit/0266abf0c4b817636172f78c6e91eb4dd5aad451)), closes [#3465](https://github.com/ipfs/js-ipfs/issues/3465)





# [0.7.0](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.6.1...ipfs-daemon@0.7.0) (2021-05-26)


### Features

* allow passing the id of a network peer to ipfs.id ([#3386](https://github.com/ipfs/js-ipfs/issues/3386)) ([00fd709](https://github.com/ipfs/js-ipfs/commit/00fd709a7b71e7cf354ea452ebce460dd7375d34))





## [0.6.1](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.6.0...ipfs-daemon@0.6.1) (2021-05-11)

**Note:** Version bump only for package ipfs-daemon





# [0.6.0](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.5.4...ipfs-daemon@0.6.0) (2021-05-10)


### Bug Fixes

* mark ipld options as partial ([#3669](https://github.com/ipfs/js-ipfs/issues/3669)) ([f98af8e](https://github.com/ipfs/js-ipfs/commit/f98af8ed24784929898bb5d33a64dc442c77074d))


### chore

* upgrade deps with new typedefs ([#3550](https://github.com/ipfs/js-ipfs/issues/3550)) ([a418a52](https://github.com/ipfs/js-ipfs/commit/a418a521574c878d7aabd0ad2fd8d516908a3756))


### BREAKING CHANGES

* all core api methods now have types, some method signatures have changed, named exports are now used by the http, grpc and ipfs client modules





## [0.5.4](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.5.3...ipfs-daemon@0.5.4) (2021-03-10)

**Note:** Version bump only for package ipfs-daemon





## [0.5.3](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.5.2...ipfs-daemon@0.5.3) (2021-03-09)


### Bug Fixes

* update to new aegir ([#3528](https://github.com/ipfs/js-ipfs/issues/3528)) ([49f7880](https://github.com/ipfs/js-ipfs/commit/49f78807d7e26483bd926b45cc7e0f797d77e41b))





## [0.5.2](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.5.1...ipfs-daemon@0.5.2) (2021-02-08)

**Note:** Version bump only for package ipfs-daemon





## [0.5.1](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.5.0...ipfs-daemon@0.5.1) (2021-02-02)

**Note:** Version bump only for package ipfs-daemon





# [0.5.0](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.4.2...ipfs-daemon@0.5.0) (2021-02-01)


### chore

* update deps ([#3514](https://github.com/ipfs/js-ipfs/issues/3514)) ([061d77c](https://github.com/ipfs/js-ipfs/commit/061d77cc03f40af5a3bc3590481e1e5836e7f0d8))


### Features

* enable upnp nat hole punching ([#3426](https://github.com/ipfs/js-ipfs/issues/3426)) ([65dc161](https://github.com/ipfs/js-ipfs/commit/65dc161feebe154b4a2d1472940dc9e70fbb817f))


### BREAKING CHANGES

* ipfs-repo upgrade requires repo migration to v10





## [0.4.2](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.4.1...ipfs-daemon@0.4.2) (2021-01-22)

**Note:** Version bump only for package ipfs-daemon





## [0.4.1](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.4.0...ipfs-daemon@0.4.1) (2021-01-20)

**Note:** Version bump only for package ipfs-daemon





# [0.4.0](https://github.com/ipfs/js-ipfs/compare/ipfs-daemon@0.3.2...ipfs-daemon@0.4.0) (2021-01-15)


### chore

* update libp2p to 0.30 ([#3427](https://github.com/ipfs/js-ipfs/issues/3427)) ([a39e6fb](https://github.com/ipfs/js-ipfs/commit/a39e6fb372bf9e7782462b6a4b7530a3f8c9b3f1))


### Features

* add grpc server and client ([#3403](https://github.com/ipfs/js-ipfs/issues/3403)) ([a9027e0](https://github.com/ipfs/js-ipfs/commit/a9027e0ec0cea9a4f34b4f2f52e09abb35237384)), closes [#2519](https://github.com/ipfs/js-ipfs/issues/2519) [#2838](https://github.com/ipfs/js-ipfs/issues/2838) [#2943](https://github.com/ipfs/js-ipfs/issues/2943) [#2854](https://github.com/ipfs/js-ipfs/issues/2854) [#2864](https://github.com/ipfs/js-ipfs/issues/2864)
* allow passing a http.Agent to ipfs-http-client in node ([#3474](https://github.com/ipfs/js-ipfs/issues/3474)) ([fe93ba0](https://github.com/ipfs/js-ipfs/commit/fe93ba01a0c62cead7cc4e0023de2d2a00adbc02)), closes [/tools.ietf.org/html/rfc2616#section-8](https://github.com//tools.ietf.org/html/rfc2616/issues/section-8) [#3464](https://github.com/ipfs/js-ipfs/issues/3464)


### BREAKING CHANGES

* The websocket transport will only dial DNS+WSS addresses - see https://github.com/libp2p/js-libp2p-websockets/releases/tag/v0.15.0

Co-authored-by: Hugo Dias <hugomrdias@gmail.com>





## 0.3.2 (2020-12-16)

**Note:** Version bump only for package ipfs-daemon
