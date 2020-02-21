# Stats API

* [stats.bitswap](#statsbitswap)
* [stats.repo](#statsrepo)
* [stats.bw](#statsbw)

#### `stats.bitswap`

> Show diagnostic information on the bitswap agent.

Note: `stats.bitswap` and `bitswap.stat` can be used interchangeably. See [`bitswap.stat`](./BITSWAP.md#bitswapstat) for more details.

#### `stats.repo`

> Get stats for the currently used repo.

Note: `stats.repo` and `repo.stat` can be used interchangeably. See [`repo.stat`](./REPO.md#repostat) for more details.

#### `stats.bw`

> Get IPFS bandwidth information.

##### `ipfs.stats.bw([options])`

Where:

- `options` is an optional object that might contain the following keys:
  - `peer` specifies a peer to print bandwidth for.
  - `proto` specifies a protocol to print bandwidth for.
  - `poll` is used to yield bandwidth info at an interval.
  - `interval` is the time interval to wait between updating output, if `poll` is `true`.

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields IPFS bandwidth information |

Each yielded object contains the following keys:

- `totalIn` - is a [BigNumber Int][bigNumber], in bytes.
- `totalOut` - is a [BigNumber Int][bigNumber], in bytes.
- `rateIn` - is a [BigNumber Int][bigNumber], in bytes.
- `rateOut` - is a [BigNumber Int][bigNumber], in bytes.

**Example:**

```JavaScript
for await (const stats of ipfs.stats.bw()) {
  console.log(stats)
}
// { totalIn: BigNumber {...},
//   totalOut: BigNumber {...},
//   rateIn: BigNumber {...},
//   rateOut: BigNumber {...} }
```

A great source of [examples][] can be found in the tests for this API.

[bigNumber]: https://github.com/MikeMcl/bignumber.js/
[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/stats
