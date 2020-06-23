# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/ipfs/js-ipfs/compare/example-running-multiple-nodes@2.0.0...example-running-multiple-nodes@2.0.1) (2020-04-08)

**Note:** Version bump only for package example-running-multiple-nodes





# 2.0.0 (2020-03-31)


### chore

* move mfs and multipart files into core ([#2811](https://github.com/ipfs/js-ipfs/issues/2811)) ([82b9e08](https://github.com/ipfs/js-ipfs/commit/82b9e085330e6c6290e6f3dd29678247984ffdce))


### Code Refactoring

* return peer IDs as strings not CIDs ([#2729](https://github.com/ipfs/js-ipfs/issues/2729)) ([16d540c](https://github.com/ipfs/js-ipfs/commit/16d540c540f375061d83dafaf6c38d0b7c4a3d60))


### Features

* support UnixFSv1.5 metadata ([#2621](https://github.com/ipfs/js-ipfs/issues/2621)) ([acbda68](https://github.com/ipfs/js-ipfs/commit/acbda68305b14df08bdd826693f30d4d37493fea)), closes [ipfs/js-datastore-pubsub#20](https://github.com/ipfs/js-datastore-pubsub/issues/20)


### BREAKING CHANGES

* When the path passed to `ipfs.files.stat(path)` was a hamt sharded dir, the resovled
value returned by js-ipfs previously had a `type` property of with a value of
`'hamt-sharded-directory'`.  To bring it in line with go-ipfs this value is now
`'directory'`.
* Where `PeerID`s were previously [CID](https://www.npmjs.com/package/cids)s, now they are Strings

- `ipfs.bitswap.stat().peers[n]` is now a String (was a CID)
- `ipfs.dht.findPeer().id` is now a String (was a CID)
- `ipfs.dht.findProvs()[n].id` is now a String (was a CID)
- `ipfs.dht.provide()[n].id` is now a String (was a CID)
- `ipfs.dht.put()[n].id` is now a String (was a CID)
- `ipfs.dht.query()[n].id` is now a String (was a CID)
- `ipfs.id().id` is now a String (was a CID)
- `ipfs.id().addresses[n]` are now [Multiaddr](https://www.npmjs.com/package/multiaddr)s (were Strings)
