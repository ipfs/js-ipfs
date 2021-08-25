# Pin API <!-- omit in toc -->

- [`ipfs.pin.add(ipfsPath, [options])`](#ipfspinaddipfspath-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
- [`ipfs.pin.addAll(source, [options])`](#ipfspinaddallsource-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.pin.ls([options])`](#ipfspinlsoptions)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.pin.rm(ipfsPath, [options])`](#ipfspinrmipfspath-options)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.pin.rmAll(source, [options])`](#ipfspinrmallsource-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)
- [`ipfs.pin.remote.service.add(name, options)`](#ipfspinremoteserviceaddname-options)
  - [Parameters](#parameters-5)
  - [Options](#options-5)
  - [Returns](#returns-5)
  - [Example](#example-5)
- [`ipfs.pin.remote.service.ls([options])`](#ipfspinremoteservicels_options)
  - [Options](#options-6)
  - [Returns](#returns-6)
  - [Example](#example-6)
- [`ipfs.pin.remote.service.rm(name, [options])`](#ipfspinremoteservicermname-options)
  - [Parameters](#parameters-6)
  - [Options](#options-7)
  - [Returns](#returns-7)
  - [Example](#example-7)
- [`ipfs.pin.remote.add(cid, [options])`](#ipfspinremoteaddcid-options)
  - [Parameters](#parameters-7)
  - [Options](#options-8)
  - [Returns](#returns-8)
  - [Example](#example-8)
- [`ipfs.pin.remote.ls(options)`](#ipfspinremotelsoptions)
  - [Options](#options-9)
  - [Returns](#returns-9)
  - [Example](#example-9)
- [`ipfs.pin.remote.rm(options)`](#ipfspinremotermoptions)
  - [Options](#options-10)
  - [Returns](#returns-10)
  - [Example](#example-10)
- [`ipfs.pin.remote.rmAll(options)`](#ipfspinremotermalloptions)
  - [Options](#options-11)
  - [Returns](#returns-11)
  - [Example](#example-11)

## `ipfs.pin.add(ipfsPath, [options])`

> Adds an IPFS object to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able)

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| source | [CID][] or `string` | A CID or IPFS Path to pin in your repo |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `true` | Recursively pin all links contained by the object |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| [CID][] | The CID that was pinned |

### Example

```JavaScript
const cid of ipfs.pin.add(CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'))
console.log(cid)
// Logs:
// CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.addAll(source, [options])`

> Adds multiple IPFS objects to the pinset and also stores it to the IPFS repo. pinset is the set of hashes currently pinned (not gc'able)

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| source | `AsyncIterable<{ cid: CID, path: string, recursive: boolean, comments: string }>` | One or more CIDs or IPFS Paths to pin in your repo |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<CID>` | An async iterable that yields the CIDs that were pinned |

Each yielded object has the form:

```JavaScript
{
  cid: CID('QmHash')
}
```

### Example

```JavaScript
for await (const cid of ipfs.pin.addAll(CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'))) {
  console.log(cid)
}
// Logs:
// CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.ls([options])`

> List all the objects pinned to local storage

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| paths | [CID][] or `Array<CID>` or `string` or `Array<string>` | CIDs or IPFS paths to search for in the pinset |
| type | `string` | `undefined` | Filter by this type of pin ("recursive", "direct" or "indirect") |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<{ cid: CID, type: string }>` | An async iterable that yields currently pinned objects with `cid` and `type` properties. `cid` is a [CID][cid] of the pinned node, `type` is the pin type ("recursive", "direct" or "indirect") |

### Example

```JavaScript
for await (const { cid, type } of ipfs.pin.ls()) {
  console.log({ cid, type })
}
// { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
// { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
// { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
```

```JavaScript
for await (const { cid, type } of ipfs.pin.ls({
  paths: [ CID.parse('Qmc5..'), CID.parse('QmZb..'), CID.parse('QmSo..') ]
})) {
  console.log({ cid, type })
}
// { cid: CID(Qmc5XkteJdb337s7VwFBAGtiaoj2QCEzyxtNRy3iMudc3E), type: 'recursive' }
// { cid: CID(QmZbj5ruYneZb8FuR9wnLqJCpCXMQudhSdWhdhp5U1oPWJ), type: 'indirect' }
// { cid: CID(QmSo73bmN47gBxMNqbdV6rZ4KJiqaArqJ1nu5TvFhqqj1R), type: 'indirect' }
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.rm(ipfsPath, [options])`

> Unpin this block from your repo

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ipfsPath | [CID][] of string | Unpin this CID or IPFS Path |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `true` | Recursively unpin the object linked |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| [CID][] | The CIDs that was unpinned |

### Example

```JavaScript
const cid of ipfs.pin.rm(CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'))
console.log(cid)
// prints the CID that was unpinned
// CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.rmAll(source, [options])`

> Unpin one or more blocks from your repo

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| source | [CID][], string or `AsyncIterable<{ cid: CID, path: string, recursive: boolean }>` | Unpin this CID |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<CID>` | An async iterable that yields the CIDs that were unpinned |

### Example

```JavaScript
for await (const cid of ipfs.pin.rmAll(CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'))) {
  console.log(cid)
}
// prints the CIDs that were unpinned
// CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.remote.service.add(name, options)`

> Registers remote pinning service with a given name. Errors if service with the given name is already registered.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | `string` | Service name |

### Options

An object which must contain following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| endpoint | `string` | Service endpoint URL |
| key | `string` | Service key |



An object may have the following optional fields:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| ---- | -------- |
| Promise<void> | Resolves if added successfully, or fails with error e.g. if service with such name is already registered |


### Example

```JavaScript
await ipfs.pin.remote.service.add('pinata', {
  endpoint: new URL('https://api.pinata.cloud'),
  key: 'your-pinata-key'
})
```

A great source of [examples][] can be found in the tests for this API.


## `ipfs.pin.remote.service.ls([options])`

> List registered remote pinning services.

### Options

An object may have the following optional fields:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| stat | `boolean` | `false` | If `true` will  include service stats. |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| ---- | -------- |
| Promise<[RemotePinService][][]> | List of registered services |

#### `RemotePinService`

Object contains following fields:

| Name | Type | Description |
| ---- | ---- | -------- |
| service | `string` | Service name |
| endpoint | `URL` | Service endpoint URL |
| stat | [Stat][] | Is included only when `stat: true` option was passed |

#### `Stat`

If stats could not be fetched from service (e.g. endpoint was unreachable) object has following form:

| Name | Type | Description |
| ---- | ---- | -------- |
| status | `'invalid'` | Service status |


If stats were fetched from service successfully object has following form:

| Name | Type | Description |
| ---- | ---- | -------- |
| status | `'valid'` | Service status |
| pinCount | [PinCount][] | Pin counts |

#### `PinCount`

Object has following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| queued | `number` | Number of queued pins |
| pinning | `number` | Number of pins that are pinning |
| pinned | `number` | Number of pinned pins |
| failed | `number` | Number of faield pins |



### Example

```JavaScript
await ipfs.pin.remote.service.ls()
// [{
//   service: 'pinata'
//   endpoint: new URL('https://api.pinata.cloud'),
// }]

await ipfs.pin.remote.service.ls({ stat: true })
// [{
//   service: 'pinata'
//   endpoint: new URL('https://api.pinata.cloud'),
//   stat: {
//      status: 'valid',
//      pinCount: {
//        queued: 0,
//        pinning: 0,
//        pinned: 1,
//        failed: 0,
//      }
//   }
// }]
```

A great source of [examples][] can be found in the tests for this API.


## `ipfs.pin.remote.service.rm(name, [options])`

> Unregisteres remote pinning service with a given name (if service with such name is regisetered).

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | `string` | Service name |

### Options

An object may have the following optional fields:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| ---- | -------- |
| Promise<void> | Resolves on completion |


### Example

```JavaScript
await ipfs.pin.remote.service.rm('pinata')
```

A great source of [examples][] can be found in the tests for this API.


## `ipfs.pin.remote.add(cid, [options])`

> Pin a content with a given CID to a remote pinning service

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| cid | [CID][] | A CID to pin on a remote pinning service |

### Options

An object which must contain following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| service | `string` | Name of the remote pinning service to use |


An object may have the following optional fields:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| name | `string` | `undefined` | Name for pinned data; can be used for lookups later (max 255 characters) |
| origins | `Multiaddr[]` | `undefined` | List of multiaddrs known to provide the data (max 20) |
| background | `boolean` | `false` | If true, will add to the queue on the remote service and return immediately. If false or omitted will wait until pinned on the remote service |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| ---- | -------- |
| [Pin][] | Pin Object |

#### `Pin`

Object has following fields:

| Type | Description |
| ---- | ----------- |
| [Status][] | Pin status |
| [CID][] | CID of the content |
| `string | undefined` | name that was given to the pin, or `undefined` if no name was not given |

#### `Status`

Status is one of the following string values:

`'queued'`, `'pinning'`, `'pinned'`, `'failed'`

### Example

```JavaScript
const cid = CID.parse('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
const pin = await ipfs.pin.remote.add(cid, {
  service: 'pinata',
  name: 'block-party'
})
console.log(pin)
// Logs:
// {
//    status: 'pinned',
//    cid: CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'),
//    name: 'block-party'
// }
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.remote.ls(options)`

> Returns a list of matching pins on the remote pinning service.


### Options

An object which must contain following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| service | `string` | Name of the remote pinning service to use |

An object may have the following optional fields:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| cid | [CID][][] | `undefined` | If provided, will only include pin objects that have a CID from the given set. |
| name | `string` | `undefined` | If passed, will only include pin objects with names that have this name (case-sensitive, exact match). |
| status | [Status][][] | ['pinned'] | Return pin objects for pins that have one of the specified status values |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| ---- | -------- |
| AysncIterable<[Pin][]> | Pin Objects |

### Example

```JavaScript
for await (const pin of ipfs.pin.remote.ls({ service: 'pinata' })) {
  console.log(pin)
}
// Logs:
// {
//    status: 'pinned',
//    cid: CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'),
//    name: 'block-party'
// }
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.remote.rm(options)`

> Removes a single matching pin object from the remote pinning service. Will error when multiple pins mtach, to remove all matches `rmAll` should be used instead.

### Options

An object which must contain following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| service | `string` | Name of the remote pinning service to use |

An object may also contain following optional fields:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| cid | [CID][][] | `undefined` | If provided, will match pin object(s) that have a CID from the given set. |
| name | `string` | `undefined` | If provided, will match pin object(s) with exact (case-sensitive) name. |
| status | [Status][][] | ['pinned'] | If provided, will match pin object(s) that have a status from the given set. |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| ---- | -------- |
| Promise<void> | Succeeds on completion |

### Example

```JavaScript
await ipfs.pin.remote.rm({
  service: 'pinata',
  name: 'block-party'
})
```

A great source of [examples][] can be found in the tests for this API.

## `ipfs.pin.remote.rmAll(options)`

> Removes all the matching pin objects from the remote pinning
service.

### Options

An object which must contain following fields:

| Name | Type | Description |
| ---- | ---- | ----------- |
| service | `string` | Name of the remote pinning service to use |

An object may also contain following optional fields:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| cid | [CID][][] | `undefined` | If provided, will match pin object(s) that have a CID from the given set. |
| name | `string` | `undefined` | If provided, will match pin object(s) with exact (case-sensitive) name. |
| status | [Status][][] | ['pinned'] | If provided, will match pin object(s) that have a status from the given set. |
| timeout | `number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| ---- | -------- |
| Promise<void> | Succeeds on completion |

### Example

```JavaScript
// Delete all non 'pinned' pins
await ipfs.pin.remote.rmAll({
  service: 'pinata',
  status: ['queued', 'pinning', 'failed']
})
```

A great source of [examples][] can be found in the tests for this API.

[Pin]: #pin
[Status]: #status
[RemotePinService]: #remotepinservice
[Status]: #status
[Stat]: #stat
[PinCount]: #pincount
[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/pin
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
