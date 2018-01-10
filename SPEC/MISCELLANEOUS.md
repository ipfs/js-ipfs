Generic API
===========

#### `id`

> Returns the identity of the Peer

##### `Go` **WIP**

##### `JavaScript` - ipfs.id([callback])

`callback` must follow `function (err, identity) {}` signature, where `err` is an error if the operation was not successful. `identity` is an object with the Peer identity.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.id(function (err, identity) {
  if (err) {
    throw err
  }
  console.log(identity)
})
```

A great source of [examples][] can be found in the tests for this API.

#### `version`

> Returns the implementation version

##### `Go` **WIP**

##### `JavaScript` - ipfs.version([callback])

`callback` must follow `function (err, version) {}` signature, where `err` is an error if the operation was not successful. `version` is an object with the version of the implementation, the commit and the Repo.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.version((err, version) => {
  if (err) {
    throw err
  }
  console.log(version)
})
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/generic.js

#### `dns`

> Resolve DNS links

##### `Go` **WIP**

##### `JavaScript` - ipfs.dns(domain, [callback])

`callback` must follow `function (err, path) {}` signature, where `err` is an error if the operation was not successful. `path` is the IPFS path for that domain.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.dns('ipfs.io', (err, path) => {
  if (err) {
    throw err
  }
  console.log(path)
})
```
