# Block API

* [block.get](#blockget)
* [block.put](#blockput)
* [block.rm](#blockrm)
* [block.stat](#blockstat)

#### `block.get`

> Get a raw IPFS block.

##### `ipfs.block.get(cid, [options])`

`cid` is a [cid][cid] which can be passed as:

- Buffer, the raw Buffer of the cid
- CID, a CID instance
- String, the base58 encoded version of the multihash

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Block>` | A [Block][block] type object, containing both the data and the hash of the block |

**Example:**

```JavaScript
const block = await ipfs.block.get(cid)
console.log(block.data)
```

A great source of [examples][] can be found in the tests for this API.

#### `block.put`

> Stores input as an IPFS block.

##### `ipfs.block.put(block, [options])`

Where `block` can be:

- `Buffer` - the raw bytes of the Block
- [`Block`][block] instance

and `options` is an Object that can contain the following properties:

- `cid` - a [cid][cid] which can be passed as:
  - Buffer, the raw Buffer of the cid
  - CID, a CID instance
  - String, the base58 encoded version of the multihash
- format
- mhtype
- mhlen
- version

if no options are passed, it defaults to `{ format: 'dag-pb', mhtype: 'sha2-256', version: 0 }`

**Note:** If you pass a [`Block`][block] instance as the block parameter, you don't need to pass options, as the block instance will carry the CID value as a property.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Block>` | A [Block][block] type object, containing both the data and the hash of the block |

**Example:**

```JavaScript
// Defaults
const buf = new Buffer('a serialized object')

const block = await ipfs.block.put(buf)

console.log(block.data.toString())
// Logs:
// a serialized object
console.log(block.cid.toString())
// Logs:
// the CID of the object

// With custom format and hashtype through CID
const CID = require('cids')
const buf = new Buffer('another serialized object')
const cid = new CID(1, 'dag-pb', multihash)

const block = await ipfs.block.put(blob, cid)

console.log(block.data.toString())
// Logs:
// a serialized object
console.log(block.cid.toString())
// Logs:
// the CID of the object
```

A great source of [examples][] can be found in the tests for this API.

#### `block.rm`

> Remove one or more IPFS block(s).

##### `ipfs.block.rm(cid, [options])`

`cid` is a [cid][cid] which can be passed as:

- Buffer, the raw Buffer of the cid
- CID, a CID instance
- String, the base58 encoded version of the multihash
- Array, list of CIDs in any of the above three formats

`options` is an Object that can contain the following properties:

- `force` (boolean): Ignores nonexistent blocks.
- `quiet` (boolean): write minimal output

**Returns**

| Type | Description |
| -------- | -------- |
| `AsyncIterable<Object>` | An async iterable that yields objects containing hash and (potentially) error strings |

Each object yielded is of the form:

```js
{
  hash: string,
  error: string
}
```

Note: If an error string is present for a given object, the block with that hash was not removed and the string will contain the reason why, for example if the block was pinned.

**Example:**

```JavaScript
for await (const result of ipfs.block.rm(cid)) {
  console.log(result.hash)
}
```

A great source of [examples][] can be found in the tests for this API.

#### `block.stat`

> Print information of a raw IPFS block.

##### `ipfs.block.stat(cid)`

`cid` is a [cid][cid] which can be passed as:

- `Buffer`, the raw Buffer of the multihash (or of and encoded version)
- `String`, the toString version of the multihash (or of an encoded version)
- CID, a CID instance

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the block's info |

the returned object has the following keys:

```JavaScript
{
  key: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
  size: 10
}
```

**Example:**

```JavaScript
const multihashStr = 'QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ'
const cid = new CID(multihashStr)

const stats = await ipfs.block.stat(cid)
console.log(stats)
// Logs:
// {
//   key: QmQULBtTjNcMwMr4VMNknnVv3RpytrLSdgpvMcTnfNhrBJ,
//    size: 3739
// }
```

A great source of [examples][] can be found in the tests for this API.

[block]: https://github.com/ipfs/js-ipfs-block
[multihash]: https://github.com/multiformats/multihash
[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/block
[cid]: https://www.npmjs.com/package/cids
