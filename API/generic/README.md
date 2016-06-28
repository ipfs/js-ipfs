generic API
===========

#### `id`

> Returns the identity of the Peer

##### `Go` **WIP**

##### `JavaScript` - ipfs.id([callback])

`callback` must follow `function (err, identity) {}` signature, where `err` is an error if the operation was not successful. `identity` is an object with the Peer identity.

If no `callback` is passed, a promise is returned.

Example:

```js
ipfs.id(function (err, identity) {
  if (err) {
    throw err
  }
  console.log(identity)
})
```

#### `version`

> Returns the implementation version

##### `Go` **WIP**

##### `JavaScript` - ipfs.version([callback])

`callback` must follow `function (err, version) {}` signature, where `err` is an error if the operation was not successful. `version` is the version string of the implementation.

If no `callback` is passed, a promise is returned.

Example:

```js
ipfs.version(function (err, version) {
  if (err) {
    throw err
  }
  console.log(version)
})
```
