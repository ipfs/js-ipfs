# Stats API <!-- omit in toc -->

- [`ipfs.stats.bitswap([options]`](#ipfsstatsbitswapoptions)
- [`ipfs.stats.repo([options])`](#ipfsstatsrepooptions)
- [`ipfs.stats.bw([options])`](#ipfsstatsbwoptions)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)

## `ipfs.stats.bitswap([options]`

> Show diagnostic information on the bitswap agent.

Note: `stats.bitswap` and `bitswap.stat` can be used interchangeably. See [`bitswap.stat`](./BITSWAP.md#bitswapstat) for more details.

## `ipfs.stats.repo([options])`

> Get stats for the currently used repo.

Note: `stats.repo` and `repo.stat` can be used interchangeably. See [`repo.stat`](./REPO.md#repostat) for more details.

## `ipfs.stats.bw([options])`

> Get IPFS bandwidth information.

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| peer | [PeerId][], [CID][] or `String` | `undefined` | Specifies a peer to print bandwidth for |
| proto | `String` | `undefined` | Specifies a protocol to print bandwidth for |
| poll | `boolean` | `undefined` | Is used to yield bandwidth info at an interval |
| interval | `Number` | `undefined` | The time interval to wait between updating output, if `poll` is `true` |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields IPFS bandwidth information |

Each yielded object contains the following keys:

- `totalIn` - is a [BigNumber Int][bigNumber], in bytes.
- `totalOut` - is a [BigNumber Int][bigNumber], in bytes.
- `rateIn` - is a [BigNumber Int][bigNumber], in bytes.
- `rateOut` - is a [BigNumber Int][bigNumber], in bytes.

### Example

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
[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/stats
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
[cid]: https://www.npmjs.com/package/cids
[peerid]: https://www.npmjs.com/package/peer-id
