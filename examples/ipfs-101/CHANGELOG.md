# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.1.0 (2020-03-31)


### Bug Fixes

* examples after files API refactor ([#1740](https://github.com/ipfs/js-ipfs/issues/1740)) ([34ec036](https://github.com/ipfs/js-ipfs/commit/34ec036b0df9563a014c1348f0a056c1f98aadad))


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
