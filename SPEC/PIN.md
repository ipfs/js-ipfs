# Pin API

* [pin.add](#pinadd)
* [pin.ls](#pinls)
* [pin.rm](#pinrm)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `pin.add`

> Adds an IPFS object to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able).

##### `ipfs.pin.add(hash, [options])`

Where:

- `hash` is an IPFS multihash.
- `options` is an object that can contain the following keys
  - 'recursive' - Recursively pin the object linked. Type: bool. Default: `true`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects that represent the files that were pinned |

an array of objects is returned, each of the form:

```JavaScript
{
  hash: 'QmHash'
}
```

**Example:**

```JavaScript
const pinset = await ipfs.pin.add('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
console.log(pinset)
// Logs:
// [ { hash: 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u' } ]
```

A great source of [examples][] can be found in the tests for this API.

#### `pin.ls`

> List all the objects pinned to local storage or under a specific hash.

##### `ipfs.pin.ls([cid], [options])`

Where:

- `cid` - a [CID][cid] instance or CID as a string or an array of CIDs.
- `options` is an object that can contain the following keys:
  - 'type' - Return also the type of pin (direct, indirect or recursive)

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of current pinned objects |

an array of objects with keys `hash` and `type` is returned.

**Example:**

```JavaScript
const pinset = await ipfs.pin.ls()
console.log(pinset)
// Logs
// [
//   { hash: Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E, type: 'recursive' },
//   { hash: QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ, type: 'indirect' },
//   { hash: QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R, type: 'indirect' }
// ]
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
| `Promise<Array>` | An array of unpinned objects |

**Example:**

```JavaScript
const pinset = await ipfs.pin.rm(hash)
console.log(pinset)
// prints the hashes that were unpinned
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/pin
[cid]: https://www.npmjs.com/package/cids
