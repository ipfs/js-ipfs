# Pin API

* [pin.add](#pinadd)
* [pin.ls](#pinls)
* [pin.rm](#pinrm)

#### `pin.add`

> Adds an IPFS object to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able).

##### `ipfs.pin.add(hash, [options])`

Where:

- `hash` is an IPFS multihash.
- `options` is an object that can contain the following keys
  - `recursive` (`boolean`) - Recursively pin the object linked. Type: bool. Default: `true`
  - `timeout` (`number`|`string`) - Throw an error if the request does not complete within the specified milliseconds timeout. If `timeout` is a string, the value is parsed as a [human readable duration](https://www.npmjs.com/package/parse-duration). There is no timeout by default.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<{ cid: CID }>` | An array of objects that represent the files that were pinned |

an array of objects is returned, each of the form:

```JavaScript
{
  cid: CID('QmHash')
}
```

**Example:**

```JavaScript
const pinset = await ipfs.pin.add('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
console.log(pinset)
// Logs:
// [ { cid: CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u') } ]
```

A great source of [examples][] can be found in the tests for this API.

#### `pin.ls`

> List all the objects pinned to local storage or under a specific hash.

##### `ipfs.pin.ls([cid], [options])`

Where:

- `cid` - a [CID][cid] instance or CID as a string or an array of CIDs.
- `options` - is an object that can contain the following keys:
  - `type` - filter by this type of pin ("recursive", "direct" or "indirect")

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<{ cid: CID, type: string }>` | An async iterable that yields currently pinned objects with `cid` and `type` properties. `cid` is a [CID][cid] of the pinned node, `type` is the pin type ("recursive", "direct" or "indirect") |

**Example:**

```JavaScript
for await (const { cid, type } of ipfs.pin.ls()) {
  console.log({ cid, type })
}
// { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
// { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
// { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
```

A great source of [examples][] can be found in the tests for this API.

#### `pin.rm`

> Remove a hash from the pinset

##### `ipfs.pin.rm(hash, [options])`

Where:
- `hash` is a multihash.
- `options` is an object that can contain the following keys
  - 'recursive' - Recursively unpin the object linked. Type: bool. Default: `true`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<{ cid: CID }>` | An array of unpinned objects |

**Example:**

```JavaScript
const pinset = await ipfs.pin.rm('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
console.log(pinset)
// prints the hashes that were unpinned
// [ { cid: CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u') } ]
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/pin
[cid]: https://www.npmjs.com/package/cids
