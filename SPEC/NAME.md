# Name API

* [name.publish](#namepublish)
* [name.pubsub.cancel](#namepubsubcancel)
* [name.pubsub.state](#namepubsubstate)
* [name.pubsub.subs](#namepubsubsubs)
* [name.resolve](#nameresolve)

### ⚠️ Note
Although not listed in the documentation, all the following APIs that actually return a **promise** can also accept a **final callback** parameter.

#### `name.publish`

> Publish an IPNS name with a given value.

##### `ipfs.name.publish(value, [options])`

`value` is a base58 encoded IPFS multihash, such as: `/ipfs/QmbezGequPwcsWo8UL4wDF6a8hYwM1hmbzYv2mnKkEWaUp`.

`options` is an object that may contain:

```JavaScript
{
  resolve:  // bool - Resolve given path before publishing. Default: true
  lifetime: // string - Time duration of the record. Default: 24h
  ttl:      // string - Time duration this record should be cached
  key:      // string - Name of the key to be used. Default: 'self'
}
```

**Returns**

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

**Example:**

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

#### `name.pubsub.cancel`

> Cancel a name subscription.

##### `ipfs.name.pubsub.cancel(arg)`

`arg` is the name of the subscription to cancel.

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains the result of the operation |

example of the returned object:

```JavaScript
{
  canceled: true
}
```

**Example:**

```JavaScript
const name = 'QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm'

const result = await ipfs.name.pubsub.cancel(name)
console.log(result.canceled)
// true
```

A great source of [examples][examples-pubsub] can be found in the tests for this API.

#### `name.pubsub.state`

> Query the state of IPNS pubsub.

##### `ipfs.name.pubsub.state()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Object>` | An object that contains the result of the operation |

example of the returned object:

```JavaScript
{
  enabled: true
}
```

**Example:**

```JavaScript
const result = await ipfs.name.pubsub.state()
console.log(result.enabled)
// true
```

A great source of [examples][examples-pubsub] can be found in the tests for this API.

#### `name.pubsub.subs`

> Show current name subscriptions.

##### `ipfs.name.pubsub.subs()`

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<Array>` | An array of subscriptions |

example of the returned array:

```JavaScript
['/ipns/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm']
```

**Example:**

```JavaScript
const result = await ipfs.name.pubsub.subs()
console.log(result)
// ['/ipns/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm']
```

A great source of [examples][examples-pubsub] can be found in the tests for this API.

#### `name.resolve`

> Resolve an IPNS name.

##### `ipfs.name.resolve(value, [options])`

`value` is a IPNS address, such as: `/ipns/ipfs.io`.

`options` is an object that may contain:

```JavaScript
{
  recursive: // bool - Resolve until the result is not an IPNS name. Default: false.
  nocache: // bool - Do not use cached entries. Default: false.
}
```

**Returns**

| Type | Description |
| -------- | -------- |
| `Promise<String>` | A string that contains the IPFS hash |

**Example:**

```JavaScript
// The IPNS address you want to resolve.
const addr = '/ipns/ipfs.io'

const name = await ipfs.name.resolve(addr)
console.log(name)
// /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
```

A great source of [examples][] can be found in the tests for this API.

[examples]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/name
[examples-pubsub]: https://github.com/ipfs/interface-ipfs-core/blob/master/src/name-pubsub
