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

> 

##### `Go` **WIP**

##### `JavaScript` - ipfs.SOMETHING(data, [callback])

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

If no `callback` is passed, a promise is returned.

Example:



#### `rm`

> 

##### `Go` **WIP**

##### `JavaScript` - ipfs.SOMETHING(data, [callback])

`callback` must follow `function (err, res) {}` signature, where `err` is an error if the operation was not successful. `res` will be an array of:

If no `callback` is passed, a promise is returned.

Example:

