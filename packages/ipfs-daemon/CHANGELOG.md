# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
