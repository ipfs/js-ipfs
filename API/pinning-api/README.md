pinning API
===========

#### `add`

> Pin an IPFS object to local storage

##### `Go` **WIP**

##### `JavaScript` - ipfs.pin.add(hash, [options, callback])

Where:

- `hash` is an IPFS multihash.
- `options` is an object that can contain the following keys:
  - `recursive` - Recursevely pin the object linked.

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful.

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.pin.add(hash, function (err) {})
```

#### `ls`

> List all the objects pinned to local storage or under a specific hash.

##### `Go` **WIP**

##### `JavaScript` - ipfs.pin.ls([hash, options, callback])

Where:

- `hash` is an IPFS multihash.
- `options` is an object that can contain the following keys:
  - `type` - Return also the type of pin (direct, indirect or recursive)

`callback` must follow `function (err, pinset) {}` signature, where `err` is an error if the operation was not successful. `pinset` is an array of objects with keys `hash` and `type`.

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.pin.ls(function (err, pinset) {})
```


#### `rm`

> Remove an hash from the pinset

##### `Go` **WIP**

##### `JavaScript` - ipfs.pin.rm(hash, [callback])

Where `hash` is a multihash.

`callback` must follow `function (err) {}` signature, where `err` is an error if the operation was not successful. 

If no `callback` is passed, a promise is returned.

Example:

```JavaScript
ipfs.pin.rm(hash, function (err, pinset) {})
```


