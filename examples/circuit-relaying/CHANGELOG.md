# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.1.0 (2020-03-31)


### Bug Fixes

* fixing circuit-relaying example ([#1443](https://github.com/ipfs/js-ipfs/issues/1443)) ([a681fc5](https://github.com/ipfs/js-ipfs/commit/a681fc5aea835ee83adcf900efb5168e7e31cde8)), closes [#1423](https://github.com/ipfs/js-ipfs/issues/1423)
* typo ([#1367](https://github.com/ipfs/js-ipfs/issues/1367)) ([2679129](https://github.com/ipfs/js-ipfs/commit/267912959fc55b0ac90946b6ee46ff886799ea60))


### chore

* move mfs and multipart files into core ([#2811](https://github.com/ipfs/js-ipfs/issues/2811)) ([82b9e08](https://github.com/ipfs/js-ipfs/commit/82b9e085330e6c6290e6f3dd29678247984ffdce))


### Code Refactoring

* return peer IDs as strings not CIDs ([#2729](https://github.com/ipfs/js-ipfs/issues/2729)) ([16d540c](https://github.com/ipfs/js-ipfs/commit/16d540c540f375061d83dafaf6c38d0b7c4a3d60))


### Features

* (BREAKING CHANGE) new libp2p configuration ([#1401](https://github.com/ipfs/js-ipfs/issues/1401)) ([9c60909](https://github.com/ipfs/js-ipfs/commit/9c6090975521ae517b570f9479f696acf2d5371b))
* Circuit Relay ([#1063](https://github.com/ipfs/js-ipfs/issues/1063)) ([f7eaa43](https://github.com/ipfs/js-ipfs/commit/f7eaa4321de2d8137086ac750104a0671f156a47))
* gossipsub as default pubsub ([#2298](https://github.com/ipfs/js-ipfs/issues/2298)) ([902e045](https://github.com/ipfs/js-ipfs/commit/902e04547e8cd0aaee994193ef664f662ff07683))
* mfs implementation ([#1360](https://github.com/ipfs/js-ipfs/issues/1360)) ([871d24e](https://github.com/ipfs/js-ipfs/commit/871d24e35c402956e2297350342268528c3192db)), closes [#1425](https://github.com/ipfs/js-ipfs/issues/1425)


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
* The default pubsub implementation has changed from floodsub to [gossipsub](https://github.com/ChainSafe/gossipsub-js). Additionally, to enable pubsub programmatically set `pubsub.enabled: true` instead of `EXPERIMENTAL.pubsub: true` or via the CLI pass `--enable-pubsub` instead of `--enable-pubsub-experiment` to `jsipfs daemon`.
* libp2p configuration has changed

    * old: `libp2p.modules.discovery`
    * new: `libp2p.modules.peerDiscovery`

License: MIT
Signed-off-by: David Dias <mail@daviddias.me>

License: MIT
Signed-off-by: Alan Shaw <alan@tableflip.io>
