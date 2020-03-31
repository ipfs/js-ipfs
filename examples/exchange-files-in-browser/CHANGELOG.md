# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.1.0 (2020-03-31)


### Bug Fixes

* examples after files API refactor ([#1740](https://github.com/ipfs/js-ipfs/issues/1740)) ([34ec036](https://github.com/ipfs/js-ipfs/commit/34ec036b0df9563a014c1348f0a056c1f98aadad))
* fix exchange in files example ([#2913](https://github.com/ipfs/js-ipfs/issues/2913)) ([cd46c78](https://github.com/ipfs/js-ipfs/commit/cd46c7899e805227dfe8a566cf354a1a127299c3))
* update *-star multiaddrs to explicity say that they need tcp and a port ([#1117](https://github.com/ipfs/js-ipfs/issues/1117)) ([9eda8a8](https://github.com/ipfs/js-ipfs/commit/9eda8a8287159c12b4df017c3d0cdac083a0b4f0))
* update option in exchange files in browser example ([#2087](https://github.com/ipfs/js-ipfs/issues/2087)) ([63469ed](https://github.com/ipfs/js-ipfs/commit/63469ed2a21f207a947d915bfe1c1beda3eaa0e3))


### Code Refactoring

* return peer IDs as strings not CIDs ([#2729](https://github.com/ipfs/js-ipfs/issues/2729)) ([16d540c](https://github.com/ipfs/js-ipfs/commit/16d540c540f375061d83dafaf6c38d0b7c4a3d60))


### Features

* add circuit relay and aegir 12 (+ big refactor) ([104ef1e](https://github.com/ipfs/js-ipfs/commit/104ef1ef6cc64c09ec886f67c28e9b5d37bc9e66))
* gossipsub as default pubsub ([#2298](https://github.com/ipfs/js-ipfs/issues/2298)) ([902e045](https://github.com/ipfs/js-ipfs/commit/902e04547e8cd0aaee994193ef664f662ff07683))
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
* The default pubsub implementation has changed from floodsub to [gossipsub](https://github.com/ChainSafe/gossipsub-js). Additionally, to enable pubsub programmatically set `pubsub.enabled: true` instead of `EXPERIMENTAL.pubsub: true` or via the CLI pass `--enable-pubsub` instead of `--enable-pubsub-experiment` to `jsipfs daemon`.
