Stats API
=======

#### `bitswap`

> Adds an IPFS object to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able).

##### `Go` **WIP**

##### `JavaScript` - ipfs.stats.bitswap([callback])

`callback` must follow `function (err, stats) {}` signature, where `err` is an error if the operation was not successful. `stats` is an Object containing the following keys:

- `provideBufLen`
- `wantlist` (array)
- `peers` (array)
- `blocksReceived`
- `dataReceived`
- `blocksSent`
- `dataSent`
- `dupBlksReceived`
- `dupDataReceived`

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.stats.bitswap((err, stats) => console.log(stats))

// { provideBufLen: 0,
//   wantlist: null,
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

#### `bw`

> Adds an IPFS object to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able).

##### `Go` **WIP**

##### `JavaScript` - ipfs.stats.bw([options, callback])

Where:

- `options` is an opcional object that might contain the following keys:
  - `peer` specifies a peer to print bandwidth for.
  - `proto` specifies a protocol to print bandwidth for.
  - `poll` is used to print bandwidth at an interval.
  - `interval` is the time interval to wait between updating output, if `poll` is true.

`callback` must follow `function (err, stats) {}` signature, where `err` is an error if the operation was not successful. `stats` is an Object containing the following keys:

- `totalIn`
- `totalOut`
- `rateIn`
- `rateOut`

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.stats.bw((err, stats) => console.log(stats))

// { totalIn: 15456,
//   totalOut: 15420,
//   rateIn: 905.0873512246716,
//   rateOut: 893.7400053359125 }
```

#### `stat`

> Get stats for the currently used repo.

##### `Go` **WIP**

##### `JavaScript` - ipfs.repo.stat([options, callback])

Where:

- `options` is an object that contains following properties
  - `human` a Boolean value to output `repoSize` in MiB.

`callback` must follow `function (err, stats) {}` signature, where `err` is an Error if the operation was not successful and `stats` is an object containing the following keys:

- `numObjects`
- `repoSize`
- `repoPath`
- `version`
- `storageMax`

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.repo.stat((err, stats) => console.log(stats))

// { numObjects: 15,
//   repoSize: 64190,
//   repoPath: 'C:\\Users\\henri\\AppData\\Local\\Temp\\ipfs_687c6eb3da07d3b16fe3c63ce17560e9',
//   version: 'fs-repo@6',
//   storageMax: 10000000000 }
```
