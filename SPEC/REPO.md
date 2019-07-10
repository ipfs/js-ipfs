# Repo API

* [repo.gc](#repogc)
* [repo.stat](#repostat)
* [repo.version](#repoversion)

#### `repo.gc`

> Perform a garbage collection sweep on the repo.

##### `ipfs.repo.gc([options], [callback])`

Where:

- `options` is an object that contains following properties
  - `quiet` writes a minimal output.
  - `stream-errors` stream errors.

`callback` must follow `function (err, res) {}` signature, where
- `err` is an Error if the whole GC operation was not successful.
- `res` is an array of objects that contains the following properties
  - `err` is an Error if it was not possible to GC a particular block.
  - `cid` is the [CID][cid] of the block that was Garbage Collected.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.repo.gc((err, res) => console.log(res))
```

#### `repo.stat`

> Get stats for the currently used repo.

##### `ipfs.repo.stat([options], [callback])`

`stats.repo` and `repo.stat` can be used interchangeably.

Where:

- `options` is an object that contains following properties
  - `human` a Boolean value to output `repoSize` in MiB.

`callback` must follow `function (err, stats) {}` signature, where `err` is an Error if the operation was not successful and `stats` is an object containing the following keys:

- `numObjects` is a [BigNumber Int][1].
- `repoSize` is a [BigNumber Int][1], in bytes.
- `repoPath` is a string.
- `version` is a string.
- `storageMax` is a [BigNumber Int][1].

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.repo.stat((err, stats) => console.log(stats))

// { numObjects: 15,
//   repoSize: 64190,
//   repoPath: 'C:\\Users\\henri\\AppData\\Local\\Temp\\ipfs_687c6eb3da07d3b16fe3c63ce17560e9',
//   version: 'fs-repo@6',
//   storageMax: 10000000000 }
```

#### `repo.version`

> Show the repo version.

##### `ipfs.repo.version([callback])`

`callback` must follow `function (err, version) {}` signature, where `err` is an Error if the operation was not successful and `version` is a String containing the version.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.repo.version((err, version) => console.log(version))

// "6"
```

[1]: https://github.com/MikeMcl/bignumber.js/
[cid]: https://www.npmjs.com/package/cids
