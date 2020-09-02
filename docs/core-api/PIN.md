# Pin API <!-- omit in toc -->

- [`ipfs.pin.add(ipfsPath, [options])`](#ipfspinaddipfspath-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.pin.addAll(source, [options])`](#ipfspinaddallsource-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.pin.ls([options])`](#ipfspinlsoptions)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.pin.rm(ipfsPath, [options])`](#ipfspinrmipfspath-options)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.pin.rmAll(source, [options])`](#ipfspinrmallsource-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)

## `ipfs.pin.add(ipfsPath, [options])`

> Adds an IPFS object to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able)

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| source | [CID][] or String | A CID or IPFS Path to pin in your repo |

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
| [CID[] | The CIDs that was pinned |

### Example

```JavaScript
const cid of ipfs.pin.add(new CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'))
console.log(cid)
// Logs:
// CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.addAll(source, [options])`

> Adds multiple IPFS objects to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able)

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| source | `AsyncIterable<{ cid: CID, path: String, recursive: Boolean, comments: String }>` | One or more CIDs or IPFS Paths to pin in your repo |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<CID>` | An async iterable that yields the CIDs that were pinned |

Each yielded object has the form:

```JavaScript
{
  cid: CID('QmHash')
}
```

### Example

```JavaScript
for await (const cid of ipfs.pin.addAll(new CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'))) {
  console.log(cid)
}
// Logs:
// CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.ls([options])`

> List all the objects pinned to local storage

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| paths | [CID][] or `Array<CID>` or `String` or `Array<String>` | CIDs or IPFS paths to search for in the pinset |
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

```JavaScript
for await (const { cid, type } of ipfs.pin.ls({
  paths: [ new CID('Qmc5..'), new CID('QmZb..'), new CID('QmSo..') ]
})) {
  console.log({ cid, type })
}
// { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
// { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
// { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.rm(ipfsPath, [options])`

> Unpin this block from your repo

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ipfsPath | [CID][] of String | Unpin this CID or IPFS Path |

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
| [CID][] | The CIDs that was unpinned |

### Example

```JavaScript
const cid of ipfs.pin.rm(new CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'))
console.log(cid)
// prints the CID that was unpinned
// CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.rmAll(source, [options])`

> Unpin one or more blocks from your repo

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| source | [CID][], String or `AsyncIterable<{ cid: CID, path: String, recursive: Boolean }>` | Unpin this CID |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<CID>` | An async iterable that yields the CIDs that were unpinned |

### Example

```JavaScript
for await (const cid of ipfs.pin.rmAll(new CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'))) {
  console.log(cid)
}
// prints the CIDs that were unpinned
// CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/pin
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
