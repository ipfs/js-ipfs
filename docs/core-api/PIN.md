# Pin API <!-- omit in toc -->

- [`ipfs.pin.add(cid, [options])`](#ipfspinaddcid-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.pin.ls([cid], [options])`](#ipfspinlscid-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.pin.rm(cid, [options])`](#ipfspinrmcid-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)

## `ipfs.pin.add(cid, [options])`

> Adds an IPFS object to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able)

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | Pin this CID in your repo |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `true` | Recursively pin all links contained by the object |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<{ cid: CID }>` | An array of objects that represent the files that were pinned |

an array of objects is returned, each of the form:

```JavaScript
{
  cid: CID('QmHash')
}
```

### Example

```JavaScript
const pinset = await ipfs.pin.add('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
console.log(pinset)
// Logs:
// [ { cid: CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u') } ]
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.ls([cid], [options])`

> List all the objects pinned to local storage or under a specific hash

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] or `Array<CID>` | List these specific CIDs |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| type | `String` | `undefined` | Filter by this type of pin ("recursive", "direct" or "indirect") |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<{ cid: CID, type: string }>` | An async iterable that yields currently pinned objects with `cid` and `type` properties. `cid` is a [CID][cid] of the pinned node, `type` is the pin type ("recursive", "direct" or "indirect") |

### Example

```JavaScript
for await (const { cid, type } of ipfs.pin.ls()) {
  console.log({ cid, type })
}
// { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
// { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
// { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.rm(cid, [options])`

> Unpin this block from your repo

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | Unpin this CID |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `true` | Recursively unpin the object linked |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<{ cid: CID }>` | An array of unpinned objects |

### Example

```JavaScript
const pinset = await ipfs.pin.rm('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
console.log(pinset)
// prints the hashes that were unpinned
// [ { cid: CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u') } ]
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/pin
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
