# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/ipfs/js-ipfs/compare/example-traverse-ipld-graphs@2.0.0...example-traverse-ipld-graphs@2.0.1) (2020-04-08)

**Note:** Version bump only for package example-traverse-ipld-graphs





# 2.0.0 (2020-03-31)


### Bug Fixes

* traverse-ipld-graphs (tree) example ([#2088](https://github.com/ipfs/js-ipfs/issues/2088)) ([b5c652f](https://github.com/ipfs/js-ipfs/commit/b5c652ffac05ce130ff4b79722c6d25de111f25d))


### chore

* update to js-ipld 0.19 ([#1668](https://github.com/ipfs/js-ipfs/issues/1668)) ([74edafd](https://github.com/ipfs/js-ipfs/commit/74edafd9d9bc88c82ef0f6589d22a0728ebf864b))


### Code Refactoring

* return peer IDs as strings not CIDs ([#2729](https://github.com/ipfs/js-ipfs/issues/2729)) ([16d540c](https://github.com/ipfs/js-ipfs/commit/16d540c540f375061d83dafaf6c38d0b7c4a3d60))
* update ipld formats, async/await mfs/unixfs & base32 cids ([#2068](https://github.com/ipfs/js-ipfs/issues/2068)) ([813048f](https://github.com/ipfs/js-ipfs/commit/813048ffb32a11cfefc51c2ec8634faaff2a924e)), closes [ipld/js-ipld-dag-pb#137](https://github.com/ipld/js-ipld-dag-pb/issues/137) [ipfs/interface-js-ipfs-core#473](https://github.com/ipfs/interface-js-ipfs-core/issues/473) [ipfs/js-ipfs-http-client#1010](https://github.com/ipfs/js-ipfs-http-client/issues/1010) [ipfs/js-ipfs-http-response#25](https://github.com/ipfs/js-ipfs-http-response/issues/25) [#1995](https://github.com/ipfs/js-ipfs/issues/1995)


### Features

* add circuit relay and aegir 12 (+ big refactor) ([104ef1e](https://github.com/ipfs/js-ipfs/commit/104ef1ef6cc64c09ec886f67c28e9b5d37bc9e66))


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
* The default string encoding for version 1 CIDs has changed to `base32`.

IPLD formats have been updated to the latest versions. IPLD nodes returned by `ipfs.dag` and `ipfs.object` commands have significant breaking changes. If you are using these commands in your application you are likely to encounter the following changes to `dag-pb` nodes (the default node type that IPFS creates):

* `DAGNode` properties have been renamed as follows:
    * `data` => `Data`
    * `links` => `Links`
    * `size` => `size` (Note: no change)
* `DAGLink` properties have been renamed as follows:
    * `cid` => `Hash`
    * `name` => `Name`
    * `size` => `Tsize`

See CHANGELOGs for each IPLD format for it's respective changes, you can read more about the [`dag-pb` changes in the CHANGELOG](https://github.com/ipld/js-ipld-dag-pb/blob/master)

License: MIT
Signed-off-by: Alan Shaw <alan.shaw@protocol.ai>
* dag-cbor nodes now represent links as CID objects

The API for [dag-cbor](https://github.com/ipld/js-ipld-dag-cbor) changed.
Links are no longer represented as JSON objects (`{"/": "base-encoded-cid"}`,
but as [CID objects](https://github.com/ipld/js-cid). `ipfs.dag.get()` and now always return links as CID objects. `ipfs.dag.put()` also expects links to be represented as CID objects. The old-style JSON objects representation is still
supported, but deprecated.

Prior to this change:

```js
const cid = new CID('QmXed8RihWcWFXRRmfSRG9yFjEbXNxu1bDwgCFAN8Dxcq5')
// Link as JSON object representation
const putCid = await ipfs.dag.put({link: {'/': cid.toBaseEncodedString()}})
const result = await ipfs.dag.get(putCid)
console.log(result.value)

```

Output:

```js
{ link:
   { '/':
      <Uint8Array 12 20 8a…> } }
```

Now:

```js
const cid = new CID('QmXed8RihWcWFXRRmfSRG9yFjEbXNxu1bDwgCFAN8Dxcq5')
// Link as CID object
const putCid = await ipfs.dag.put({link: cid})
const result = await ipfs.dag.get(putCid)
console.log(result.value)
```

Output:

```js
{ link:
   CID {
     codec: 'dag-pb',
     version: 0,
     multihash:
      <Uint8Array 12 20 8a…> } }
```

See https://github.com/ipld/ipld/issues/44 for more information on why this
change was made.
