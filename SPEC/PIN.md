# Pin API

* [pin.add](#pinadd)
* [pin.ls](#pinls)
* [pin.rm](#pinrm)

#### `pin.add`

> Adds an IPFS object to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able).

##### `Go` **WIP**

##### `JavaScript` - ipfs.pin.add(hash, [options], [callback])

Where:

- `hash` is an IPFS multihash.
- `options` is an object that can contain the following keys
  - 'recursive' - Recursively pin the object linked. Type: bool. Default: `true`

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` is an array of objects that represent the files that were pinned. Example:

```JavaScript
{
  hash: 'QmHash'
}
```

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.pin.add(hash, function (err) {})
```

#### `pin.ls`

> List all the objects pinned to local storage or under a specific hash.

##### `Go` **WIP**

##### `JavaScript` - ipfs.pin.ls([hash], [options], [callback])

Where:

- `hash` is an IPFS multihash.
- `options` is an object that can contain the following keys:
  - 'type' - Return also the type of pin (direct, indirect or recursive)

`callback` must follow `function (err, pinset) {}` signature, where `err` is an error if the operation was not successful. `pinset` is an array of objects with keys `hash` and `type`.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.pin.ls(function (err, pinset) {
  if (err) {
    throw err
  }
  console.log(pinset)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `pin.rm`

> Remove a hash from the pinset

##### `Go` **WIP**

##### `JavaScript` - ipfs.pin.rm(hash, [options], [callback])

Where:
- `hash` is a multihash.
- `options` is an object that can contain the following keys
  - 'recursive' - Recursively unpin the object linked. Type: bool. Default: `true`

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.pin.rm(hash, function (err, pinset) {
  if (err) {
    throw err
  }
  console.log(pinset) prints the hashes that were unpinned
})
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/js/src/pin
