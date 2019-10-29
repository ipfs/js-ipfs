# Repo API

* [repo.gc](#repogc)
* [repo.stat](#repostat)
* [repo.version](#repoversion)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `repo.gc`

> Perform a garbage collection sweep on the repo.

##### `ipfs.repo.gc([options])`

Where:

- `options` is an object that contains following properties
  - `quiet` writes a minimal output.
  - `stream-errors` stream errors.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of objects |

each object contains the following properties:

- `err` is an Error if it was not possible to GC a particular block.
- `cid` is the [CID][cid] of the block that was Garbage Collected.

**Example:**

```JavaScript
const res = await ipfs.repo.gc()
console.log(res)
```

#### `repo.stat`

> Get stats for the currently used repo.

##### `ipfs.repo.stat([options])`

`stats.repo` and `repo.stat` can be used interchangeably.

Where:

- `options` is an object that contains following properties
  - `human` a Boolean value to output `repoSize` in MiB.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object containing the repo's info |

the returned object has the following keys:

- `numObjects` is a [BigNumber Int][1].
- `repoSize` is a [BigNumber Int][1], in bytes.
- `repoPath` is a string.
- `version` is a string.
- `storageMax` is a [BigNumber Int][1].

**Example:**

```JavaScript
const stats = await ipfs.repo.stat()
console.log(stats)

// { numObjects: 15,
//   repoSize: 64190,
//   repoPath: 'C:\\Users\\henri\\AppData\\Local\\Temp\\ipfs_687c6eb3da07d3b16fe3c63ce17560e9',
//   version: 'fs-repo@6',
//   storageMax: 10000000000 }
```

#### `repo.version`

> Show the repo version.

##### `ipfs.repo.version()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<String>` | A String containing the repo's version |

**Example:**

```JavaScript
const version = await ipfs.repo.version()
console.log(version)

// "6"
```

[1]: https://github.com/MikeMcl/bignumber.js/
[cid]: https://www.npmjs.com/package/cids
