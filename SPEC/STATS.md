Stats API
=======

#### `bitswap`

`stats.bitswap` and `bitswap.stat` can be used interchangeably. See [`bitswap.stat`](./BITSWAP.md#stat) for more details.

#### `repo`

`stats.repo` and `repo.stat` can be used interchangeably. See [`repo.stat`](./REPO.md#stat) for more details.

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
