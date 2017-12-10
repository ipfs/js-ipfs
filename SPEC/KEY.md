Key API
=======

#### `gen`

> Generate a new key

##### `Go` **WIP**

##### `JavaScript` - ipfs.key.gen(name, options, [callback])

Where:

- `name` is a local name for the key
- `options` is an object that contains following properties
  - 'type' - the key type, one of 'rsa'
  - 'size' - the key size in bits

`callback` must follow `function (err, key) {}` signature, where `err` is an Error if the operation was not successful. `key` is an object that describes the key; `name` and `id`.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.add(
  'my-key', 
  { type: 'rsa', size: 2048 }, 
  (err, key) => console.log(key))


{ 
  Name: 'my-key',
  Id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg'
}
```

#### `list`

> List all the keys

##### `Go` **WIP**

##### `JavaScript` - ipfs.key.list([callback])

`callback` must follow `function (err, keys) {}` signature, where `err` is an Error if the operation was not successful. `keys` is an object with the property `Keys` that is an array of `KeyInfo` (`name` and `id`)

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.list((err, keys) => console.log(keys))

{ 
  Keys: [
    { Name: 'self',
      Id: 'QmRT6i9wXVSmxKi3MxVRduZqF3Wvv8DuV5utMXPN3BxPML' },
    { Name: 'my-key',
      Id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg' } 
  ]
}
```

#### `rm`

> Remove a key

##### `Go` **WIP**

##### `JavaScript` - ipfs.key.rm(name, [callback])

Where:
- `name` is the local name for the key

`callback` must follow `function (err, key) {}` signature, where `err` is an Error if the operation was not successful. `key` is an object that describes the removed key.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.rm('my-key', (err, key) => console.log(key))

{ 
  Keys: [
    { Name: 'my-key',
      Id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg' } 
  ]
}
```

#### `rename`

> Rename a key

##### `Go` **WIP**

##### `JavaScript` - ipfs.key.rename(oldName, newName, [callback])

Where:
- `oldName` is the local name for the key
- `newName` a new name for key

`callback` must follow `function (err, key) {}` signature, where `err` is an Error if the operation was not successful. `key` is an object that describes the renamed key.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.rename(
  'my-key', 
  'my-new-key',
  (err, key) => console.log(key))
  
{ 
  Was: 'my-key',
  Now: 'my-new-key',
  Id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg',
  Overwrite: false
}
```

