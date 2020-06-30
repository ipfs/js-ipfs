# Name API <!-- omit in toc -->

- [`ipfs.name.publish(value, [options])`](#ipfsnamepublishvalue-options)
  - [Parameters](#parameters)
  - [Options](#options)
  - [Returns](#returns)
  - [Example](#example)
  - [Notes](#notes)
- [`ipfs.name.pubsub.cancel(name, [options])`](#ipfsnamepubsubcancelname-options)
  - [Parameters](#parameters-1)
  - [Options](#options-1)
  - [Returns](#returns-1)
  - [Example](#example-1)
- [`ipfs.name.pubsub.state([options])`](#ipfsnamepubsubstateoptions)
  - [Parameters](#parameters-2)
  - [Options](#options-2)
  - [Returns](#returns-2)
  - [Example](#example-2)
- [`ipfs.name.pubsub.subs([options])`](#ipfsnamepubsubsubsoptions)
  - [Parameters](#parameters-3)
  - [Options](#options-3)
  - [Returns](#returns-3)
  - [Example](#example-3)
- [`ipfs.name.resolve(value, [options])`](#ipfsnameresolvevalue-options)
  - [Parameters](#parameters-4)
  - [Options](#options-4)
  - [Returns](#returns-4)
  - [Example](#example-4)

## `ipfs.name.publish(value, [options])`

> Publish an IPNS name with a given value.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | [CID][] | The content to publish |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| resolve | `boolean` | `true` | Resolve given path before publishing |
| lifetime | `String` | `24h` | Time duration of the record |
| ttl | `String` | `undefined` | Time duration this record should be cached |
| key | `String` | `'self'` | Name of the key to be used |
| allowOffline | `boolean` | `true` | When offline, save the IPNS record to the the local datastore without broadcasting to the network instead of simply failing. |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains the IPNS hash and the IPFS hash |

example of the returned object:

```JavaScript
{
  name: "/ipns/QmHash.."
  value: "/ipfs/QmHash.."
}
```

### Example

Imagine you want to publish your website under IPFS. You can use the [Files API](./FILES.md) to publish your static website and then you'll get a multihash you can link to. But when you need to make a change, a problem arises: you get a new multihash because you now have a different content. And it is not possible for you to be always giving others the new address.

Here's where the Name API comes in handy. With it, you can use one static multihash for your website under IPNS (InterPlanetary Name Service). This way, you can have one single multihash poiting to the newest version of your website.

```JavaScript
// The address of your files.
const addr = '/ipfs/QmbezGequPwcsWo8UL4wDF6a8hYwM1hmbzYv2mnKkEWaUp'

const res = await ipfs.name.publish(addr)
// You now have a res which contains two fields:
//   - name: the name under which the content was published.
//   - value: the "real" address to which Name points.
console.log(`https://gateway.ipfs.io/ipns/${res.name}`)
```

This way, you can republish a new version of your website under the same address. By default, `ipfs.name.publish` will use the Peer ID. If you want to have multiple websites (for example) under the same IPFS module, you can always check the [key API](./KEY.md).

A great source of [examples][] can be found in the tests for this API.

### Notes

The `allowOffline` option is not yet implemented in js-ipfs. See tracking issue [ipfs/js-ipfs#1997](https://github.com/ipfs/js-ipfs/issues/1997).

## `ipfs.name.pubsub.cancel(name, [options])`

> Cancel a name subscription

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | `String` | The name of the subscription to cancel |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

`arg` is the name of the subscription to cancel.

### Returns

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains the result of the operation |

example of the returned object:

```JavaScript
{
  canceled: true
}
```

### Example

```JavaScript
const name = 'QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm'

const result = await ipfs.name.pubsub.cancel(name)
console.log(result.canceled)
// true
```

A great source of [examples][examples-pubsub] can be found in the tests for this API.

## `ipfs.name.pubsub.state([options])`

> Query the state of IPNS pubsub

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
| `Promise<Object>` | An object that contains the result of the operation |

example of the returned object:

```JavaScript
{
  enabled: true
}
```

### Example

```JavaScript
const result = await ipfs.name.pubsub.state()
console.log(result.enabled)
// true
```

A great source of [examples][examples-pubsub] can be found in the tests for this API.

## `ipfs.name.pubsub.subs([options])`

> Show current name subscriptions

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
| `Promise<Array>` | An array of subscriptions |

example of the returned array:

```JavaScript
['/ipns/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm']
```

### Example

```JavaScript
const result = await ipfs.name.pubsub.subs()
console.log(result)
// ['/ipns/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm']
```

A great source of [examples][examples-pubsub] can be found in the tests for this API.

## `ipfs.name.resolve(value, [options])`

> Resolve an IPNS name.

### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | `String` | An IPNS address such as `/ipns/ipfs.io` |

### Options

An optional object which may have the following keys:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| recursive | `boolean` | `false` | Resolve until the result is not an IPNS name |
| nocache | `boolean` | `cache` | Do not use cached entries |
| timeout | `Number` | `undefined` | A timeout in ms |
| signal | [AbortSignal][] | `undefined` |  Can be used to cancel any long running requests started as a result of this call |

### Returns

| Type | Description |
| -------- | -------- |
| `AsyncIterable<String>` | An async iterable that yields strings that are increasingly more accurate resolved paths. |

### Example

```JavaScript
// The IPNS address you want to resolve.
const addr = '/ipns/ipfs.io'

for await (const name of ipfs.name.resolve(addr)) {
  console.log(name)
  // /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
}
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/name
[examples-pubsub]: https://github.com/ipfs/js-ipfs/blob/master/packages/interface-ipfs-core/src/name-pubsub
[cid]: https://www.npmjs.com/package/cids
[AbortSignal]: https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
