# Stats API

* [stats.bitswap](#statsbitswap)
* [stats.repo](#statsrepo)
* [stats.bw](#statsbw)
* [stats.bwPullStream](#statsbwpullstream)
* [stats.bwReadableStream](#statsbwreadablestream)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `stats.bitswap`

> Show diagnostic information on the bitswap agent.

Note: `stats.bitswap` and `bitswap.stat` can be used interchangeably. See [`bitswap.stat`](./BITSWAP.md#bitswapstat) for more details.

#### `stats.repo`

> Get stats for the currently used repo.

Note: `stats.repo` and `repo.stat` can be used interchangeably. See [`repo.stat`](./REPO.md#repostat) for more details.

#### `stats.bw`

> Get IPFS bandwidth information as an object.

##### `ipfs.stats.bw([options])`

Where:

- `options` is an optional object that might contain the following keys:
  - `peer` specifies a peer to print bandwidth for.
  - `proto` specifies a protocol to print bandwidth for.
  - `poll` is used to print bandwidth at an interval.
  - `interval` is the time interval to wait between updating output, if `poll` is true.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object representing IPFS bandwidth information |

the returned object contains the following keys:

- `totalIn` - is a [BigNumber Int][bigNumber], in bytes.
- `totalOut` - is a [BigNumber Int][bigNumber], in bytes.
- `rateIn` - is a [BigNumber Int][bigNumber], in bytes.
- `rateOut` - is a [BigNumber Int][bigNumber], in bytes.

**Example:**

```JavaScript
const stats = await ipfs.stats.bw()

console.log(stats)
// { totalIn: BigNumber {...},
//   totalOut: BigNumber {...},
//   rateIn: BigNumber {...},
//   rateOut: BigNumber {...} }
```

A great source of [examples][] can be found in the tests for this API.

#### `stats.bwPullStream`

> Get IPFS bandwidth information as a [Pull Stream][ps].

##### `ipfs.stats.bwPullStream([options])`

Options are described on [`ipfs.stats.bw`](#bw).

**Returns**

| Type | Description |
| -------- | -------- |
| `PullStream` | A [Pull Stream][ps] representing IPFS bandwidth information |

**Example:**

```JavaScript
const pull = require('pull-stream')
const log = require('pull-stream/sinks/log')

const stream = ipfs.stats.bwPullStream({ poll: true })

pull(
  stream,
  log()
)

// { totalIn: BigNumber {...},
//   totalOut: BigNumber {...},
//   rateIn: BigNumber {...},
//   rateOut: BigNumber {...} }
// ...
// Ad infinitum
```

A great source of [examples][] can be found in the tests for this API.

#### `stats.bwReadableStream`

> Get IPFS bandwidth information as a [Readable Stream][rs].

##### `ipfs.stats.bwReadableStream([options])`

Options are described on [`ipfs.stats.bw`](#bw).

**Returns**

| Type | Description |
| -------- | -------- |
| `ReadableStream` | A [Readable Stream][rs] representing IPFS bandwidth information |

**Example:**

```JavaScript
const stream = ipfs.stats.bwReadableStream({ poll: true })

stream.on('data', (data) => {
  console.log(data)
}))

// { totalIn: BigNumber {...},
//   totalOut: BigNumber {...},
//   rateIn: BigNumber {...},
//   rateOut: BigNumber {...} }
// ...
// Ad infinitum
```

A great source of [examples][] can be found in the tests for this API.

[bigNumber]: https://github.com/MikeMcl/bignumber.js/
[rs]: https://www.npmjs.com/package/readable-stream
[ps]: https://www.npmjs.com/package/pull-stream
[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/stats
