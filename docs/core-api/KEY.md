# Key API <!-- omit in toc -->

- [`ipfs.key.gen(name, [options])`](#ipfskeygenname-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.key.list([options])`](#ipfskeylistoptions)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.key.rm(name, [options])`](#ipfskeyrmname-options)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.key.rename(oldName, newName, [options])`](#ipfskeyrenameoldname-newname-options)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.key.export(name, password, [options])`](#ipfskeyexportname-password-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)
- [`ipfs.key.import(name, pem, password, [options])`](#ipfskeyimportname-pem-password-options)
  - [Parameters](#parameters-5)
  - [Options](#options-5)
  - [Returns](#returns-5)
  - [Example](#example-5)

## `ipfs.key.gen(name, [options])`

> Generate a new key

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | String | The name to give the key |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| type | `String` | `'rsa'` | The key type, one of `'rsa'` or `'ed25519'` |
| size | `Number` | `2048` | The key size in bits |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that describes the key; `name` and `id` |

### Example

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

## `ipfs.key.list([options])`

> List all the keys

### Parameters

None

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

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

### Example

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

## `ipfs.key.rm(name, [options])`

> Remove a key

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | String | The name of the key to remove |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

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

### Example

```JavaScript
const key = await ipfs.key.rm('my-key')

console.log(key)
// { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
//   name: 'my-key' }
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.key.rename(oldName, newName, [options])`

> Rename a key

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| oldName | String | The current key name |
| newName | String | The desired key name |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that describes the renamed key |

### Example

```JavaScript
const key = await ipfs.key.rename('my-key', 'my-new-key')

console.log(key)
// { id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg',
//   was: 'my-key',
//   now: 'my-new-key',
//   overwrite: false }
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.key.export(name, password, [options])`

> Export a key in a PEM encoded password protected PKCS #8

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | String | The name of the key to export |
| password | String | Password to set on the PEM output |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<String>` | The string representation of the key |

### Example

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

## `ipfs.key.import(name, pem, password, [options])`

> Import a PEM encoded password protected PKCS #8 key

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | String | The name of the key to export |
| pem | String | The PEM encoded key |
| password | String | The password that protects the PEM key |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that describes the new key |

### Example

```JavaScript
const key = await ipfs.key.import('clone', 'password')

console.log(key)
// { id: 'QmQRiays958UM7norGRQUG3tmrLq8pJdmJarwYSk2eLthQ',
//   name: 'clone' }
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/key
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
