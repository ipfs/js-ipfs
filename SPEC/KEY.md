# Key API

* [key.gen](#keygen)
* [key.list](#keylist)
* [key.rm](#keyrm)
* [key.rename](#keyrename)
* [key.export](#keyexport)
* [key.import](#keyimport)

#### `key.gen`

> Generate a new key

##### `ipfs.key.gen(name, options)`

Where:

- `name` is a local name for the key
- `options` is an object that contains following properties
  - 'type' - the key type, one of 'rsa', 'ed25519' (Note: `js-ipfs` will not support 'ed25519' until [libp2p/js-libp2p-crypto#145](https://github.com/libp2p/js-libp2p-crypto/issues/145) is resolved)
  - 'size' - the key size in bits

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that describes the key; `name` and `id` |

**Example:**

```JavaScript
const key = await ipfs.key.gen('my-key', {
    type: 'rsa',
    size: 2048
})

console.log(key)
// { id: 'QmYWqAFvLWb2G5A69JGXui2JJXzaHXiUEmQkQgor6kNNcJ',
//  name: 'my-key' }
```

A great source of [examples][] can be found in the tests for this API.

#### `key.list`

> List all the keys

##### `ipfs.key.list()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array representing all the keys |

example of the returned array:

```js
{
  id: 'hash',   // string - the hash of the key
  name: 'self'  // string - the name of the key
}
```

**Example:**

```JavaScript
const keys = await ipfs.key.list()

console.log(keys)
// [
//   { id: 'QmTe4tuceM2sAmuZiFsJ9tmAopA8au71NabBDdpPYDjxAb',
//     name: 'self' },
//   { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
//     name: 'my-key' }
// ]
```

A great source of [examples][] can be found in the tests for this API.

#### `key.rm`

> Remove a key

##### `ipfs.key.rm(name)`

Where:
- `name` is the local name for the key

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that describes the removed key |

example of the returned object:

```js
{
  id: 'hash',   // string - the hash of the key
  name: 'self'  // string - the name of the key
}
```

**Example:**

```JavaScript
const key = await ipfs.key.rm('my-key')

console.log(key)
// { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
//   name: 'my-key' }
```

A great source of [examples][] can be found in the tests for this API.

#### `key.rename`

> Rename a key

##### `ipfs.key.rename(oldName, newName)`

Where:
- `oldName` is the local name for the key
- `newName` a new name for key

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that describes the renamed key |

**Example:**

```JavaScript
const key = await ipfs.key.rename('my-key', 'my-new-key')

console.log(key)
// { id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg',
//   was: 'my-key',
//   now: 'my-new-key',
//   overwrite: false }
```

A great source of [examples][] can be found in the tests for this API.

#### `key.export`

> Export a key in a PEM encoded password protected PKCS #8

##### `ipfs.key.export(name, password)`

Where:
- `name` is the local name for the key
- `password` is the password to protect the key

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<String>` | The string representation of the key |

**Example:**

```JavaScript
const pem = await ipfs.key.export('self', 'password')

console.log(pem)
// -----BEGIN ENCRYPTED PRIVATE KEY-----
// MIIFDTA/BgkqhkiG9w0BBQ0wMjAaBgkqhkiG9w0BBQwwDQQIpdO40RVyBwACAWQw
// ...
// YA==
// -----END ENCRYPTED PRIVATE KEY-----
```

A great source of [examples][] can be found in the tests for this API.

#### `key.import`

> Import a PEM encoded password protected PKCS #8 key

##### `ipfs.key.import(name, pem, password)`

Where:
- `name` is a local name for the key
- `pem` is the PEM encoded key
- `password` is the password that protects the PEM key

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that describes the new key |

**Example:**

```JavaScript
const key = await ipfs.key.import('clone', 'password')

console.log(key)
// { id: 'QmQRiays958UM7norGRQUG3tmrLq8pJdmJarwYSk2eLthQ',
//   name: 'clone' }
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/key
