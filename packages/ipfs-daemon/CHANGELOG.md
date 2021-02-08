# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
