# Bitswap API

* [bitswap.wantlist](#bitswapwantlist)
* [bitswap.stat](#bitswapstat)

### `bitswap.wantlist`

> Returns the wantlist, optionally filtered by peer ID

#### Go **WIP**

#### JavaScript - `ipfs.bitswap.wantlist([peerId], [callback])`

`callback` must follow `function (err, list) {}` signature, where `err` is an error if the operation was not successful. `list` is an Object containing the following keys:

- `Keys` An array of objects containing the following keys:
    - `/` A string multihash

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.bitswap.wantlist((err, list) => console.log(list))

// { Keys: [{ '/': 'QmHash' }] }

ipfs.bitswap.wantlist(peerId, (err, list) => console.log(list))

// { Keys: [{ '/': 'QmHash' }] }
```

#### `bitswap.stat`

> Show diagnostic information on the bitswap agent.

##### Go **WIP**

##### JavaScript - `ipfs.bitswap.stat([callback])`

Note: `bitswap.stat` and `stats.bitswap` can be used interchangeably.

`callback` must follow `function (err, stats) {}` signature, where `err` is an error if the operation was not successful. `stats` is an Object containing the following keys:

- `provideBufLen` is an integer.
- `wantlist` (array of CIDs)
- `peers` (array of peer IDs)
- `blocksReceived` is a [BigNumber Int][1]
- `dataReceived` is a [BigNumber Int][1]
- `blocksSent` is a [BigNumber Int][1]
- `dataSent` is a [BigNumber Int][1]
- `dupBlksReceived` is a [BigNumber Int][1]
- `dupDataReceived` is a [BigNumber Int][1]

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.bitswap.stat((err, stats) => console.log(stats))

// { provideBufLen: 0,
//   wantlist: [ { '/': 'QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM' } ],
//   peers:
//    [ 'QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
//      'QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
//      'QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd' ],
//   blocksReceived: 0,
//   dataReceived: 0,
//   blocksSent: 0,
//   dataSent: 0,
//   dupBlksReceived: 0,
//  dupDataReceived: 0 }
```

[1]: https://github.com/MikeMcl/bignumber.js/
