# Bitswap API <!-- omit in toc -->

- [`ipfs.bitswap.wantlist([options])`](#ipfsbitswapwantlistoptions)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.bitswap.wantlistForPeer(peerId, [options])`](#ipfsbitswapwantlistforpeerpeerid-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.bitswap.unwant(cids, [options])`](#ipfsbitswapunwantcids-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.bitswap.stat([options])`](#ipfsbitswapstatoptions)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)

## `ipfs.bitswap.wantlist([options])`

> Returns the wantlist for your node

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID[]>` | An array of [CID][]s currently in the wantlist |

### Example

```JavaScript
const list = await ipfs.bitswap.wantlist()
console.log(list)
// [ CID('QmHash') ]
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.bitswap.wantlistForPeer(peerId, [options])`

> Returns the wantlist for a connected peer

### Parameters

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| peerId | [PeerId][], [CID][], `String` or `Buffer` | A peer ID to return the wantlist for |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<CID[]>` | An array of [CID][]s currently in the wantlist |

### Example

```JavaScript
const list = await ipfs.bitswap.wantlistForPeer(peerId)
console.log(list)
// [ CID('QmHash') ]
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.bitswap.unwant(cids, [options])`

> Removes one or more CIDs from the wantlist

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cids | A [CID][] or Array of [CID][]s | The CIDs to remove from the wantlist |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` | Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<void>` | A promise that resolves once the request is complete |

### Example

```JavaScript
let list = await ipfs.bitswap.wantlist()
console.log(list)
// [ CID('QmHash') ]

await ipfs.bitswap.unwant(cid)

list = await ipfs.bitswap.wantlist()
console.log(list)
// []
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.bitswap.stat([options])`

> Show diagnostic information on the bitswap agent.

Note: `bitswap.stat` and `stats.bitswap` can be used interchangeably.

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains information about the bitswap agent |

The returned object contains the following keys:

- `provideBufLen` is an integer.
- `wantlist` (array of [CID][cid]s)
- `peers` (array of peer IDs as Strings)
- `blocksReceived` is a [BigNumber Int][1]
- `dataReceived` is a [BigNumber Int][1]
- `blocksSent` is a [BigNumber Int][1]
- `dataSent` is a [BigNumber Int][1]
- `dupBlksReceived` is a [BigNumber Int][1]
- `dupDataReceived` is a [BigNumber Int][1]

### Example

```JavaScript
const stats = await ipfs.bitswap.stat()
console.log(stats)
// {
//   provideBufLen: 0,
//   wantlist: [ CID('QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM') ],
//   peers:
//    [ 'QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
//      'QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
//      'QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd' ],
//   blocksReceived: 0,
//   dataReceived: 0,
//   blocksSent: 0,
//   dataSent: 0,
//   dupBlksReceived: 0,
//   dupDataReceived: 0
// }
```

A great source of [examples][] can be found in the tests for this API.

[1]: https://github.com/MikeMcl/bignumber.js/
[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/bitswap
[cid]: https://www.npmjs.com/package/cids
[peerid]: https://www.npmjs.com/package/peer-id
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal