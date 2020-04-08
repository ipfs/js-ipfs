# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/ipfs/js-ipfs/compare/example-browser-video-streaming@2.0.0...example-browser-video-streaming@2.0.1) (2020-04-08)

**Note:** Version bump only for package example-browser-video-streaming





# 2.0.0 (2020-03-31)


### Bug Fixes

* browser video streaming example ([#2267](https://github.com/ipfs/js-ipfs/issues/2267)) ([f5cf216](https://github.com/ipfs/js-ipfs/commit/f5cf216a9a3128779562711f6c5ab46791d30947))
* reinstate hlsjs-ipfs-loader dep for video streaming example ([#2914](https://github.com/ipfs/js-ipfs/issues/2914)) ([af66e94](https://github.com/ipfs/js-ipfs/commit/af66e9460cd3fbabcc88f74496a3d93049453e51))
* update hlsjs-ipfs-loader version ([#1422](https://github.com/ipfs/js-ipfs/issues/1422)) ([6b14812](https://github.com/ipfs/js-ipfs/commit/6b14812ae53a6f2c852d4b7deb7d9ab23eb454ba))


### Code Refactoring

* return peer IDs as strings not CIDs ([#2729](https://github.com/ipfs/js-ipfs/issues/2729)) ([16d540c](https://github.com/ipfs/js-ipfs/commit/16d540c540f375061d83dafaf6c38d0b7c4a3d60))


### Features

* implementing the new streaming interfaces ([#1086](https://github.com/ipfs/js-ipfs/issues/1086)) ([2c4b8b3](https://github.com/ipfs/js-ipfs/commit/2c4b8b325b94d4506b87441f06c5d29bb6f37f72))


### BREAKING CHANGES

* Where `PeerID`s were previously [CID](https://www.npmjs.com/package/cids)s, now they are Strings

- `ipfs.bitswap.stat().peers[n]` is now a String (was a CID)
- `ipfs.dht.findPeer().id` is now a String (was a CID)
- `ipfs.dht.findProvs()[n].id` is now a String (was a CID)
- `ipfs.dht.provide()[n].id` is now a String (was a CID)
- `ipfs.dht.put()[n].id` is now a String (was a CID)
- `ipfs.dht.query()[n].id` is now a String (was a CID)
- `ipfs.id().id` is now a String (was a CID)
- `ipfs.id().addresses[n]` are now [Multiaddr](https://www.npmjs.com/package/multiaddr)s (were Strings)
