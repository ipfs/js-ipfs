# Bitswap API

* [bitswap.wantlist](#bitswapwantlist)
* [bitswap.stat](#bitswapstat)

### `bitswap.wantlist`

> Returns the wantlist, optionally filtered by peer ID

#### `ipfs.bitswap.wantlist([peerId])`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<CID[]>` | An array of [CID][cid]s currently in the wantlist |

**Example:**

```JavaScript
const list = await ipfs.bitswap.wantlist()
console.log(list)
// [ CID('QmHash') ]

const list2 = await ipfs.bitswap.wantlist(peerId)
console.log(list2)
// [ CID('QmHash') ]
```

A great source of [examples][] can be found in the tests for this API.

#### `bitswap.stat`

> Show diagnostic information on the bitswap agent.

##### `ipfs.bitswap.stat()`

Note: `bitswap.stat` and `stats.bitswap` can be used interchangeably.

**Returns**

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

**Example:**

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
[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/bitswap
[cid]: https://www.npmjs.com/package/cids
