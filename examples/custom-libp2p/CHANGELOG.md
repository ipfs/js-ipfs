# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.2.1](https://github.com/ipfs/js-ipfs/compare/example-custom-libp2p@0.2.0...example-custom-libp2p@0.2.1) (2020-04-08)

**Note:** Version bump only for package example-custom-libp2p





# 0.2.0 (2020-03-31)


### Bug Fixes

* **package:** update libp2p-kad-dht to version 0.15.0 ([#2049](https://github.com/ipfs/js-ipfs/issues/2049)) ([5905760](https://github.com/ipfs/js-ipfs/commit/59057609784ec6ca04625003e0e765f3141418ac))


### Code Refactoring

* return peer IDs as strings not CIDs ([#2729](https://github.com/ipfs/js-ipfs/issues/2729)) ([16d540c](https://github.com/ipfs/js-ipfs/commit/16d540c540f375061d83dafaf6c38d0b7c4a3d60))


### Features

* add libp2p factory config option with example ([#1470](https://github.com/ipfs/js-ipfs/issues/1470)) ([46222e1](https://github.com/ipfs/js-ipfs/commit/46222e1093b8919f572fd948612bd436a4376e31)), closes [#1463](https://github.com/ipfs/js-ipfs/issues/1463)
* gossipsub as default pubsub ([#2298](https://github.com/ipfs/js-ipfs/issues/2298)) ([902e045](https://github.com/ipfs/js-ipfs/commit/902e04547e8cd0aaee994193ef664f662ff07683))
* use libp2p auto dial ([#1983](https://github.com/ipfs/js-ipfs/issues/1983)) ([7f1fb26](https://github.com/ipfs/js-ipfs/commit/7f1fb263788dbd2c07766949fb9150319887f666))


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
* The default pubsub implementation has changed from floodsub to [gossipsub](https://github.com/ChainSafe/gossipsub-js). Additionally, to enable pubsub programmatically set `pubsub.enabled: true` instead of `EXPERIMENTAL.pubsub: true` or via the CLI pass `--enable-pubsub` instead of `--enable-pubsub-experiment` to `jsipfs daemon`.
