Name API
========

#### `publish`

> Publish an IPNS name with a given value.

##### `Go` **WIP**

##### `JavaScript` - ipfs.name.publish(value, [options, callback])

`value` is a base58 encoded IPFS multihash, such as: `/ipfs/QmbezGequPwcsWo8UL4wDF6a8hYwM1hmbzYv2mnKkEWaUp`.

`options` is an object that may contain:

```JavaScript
{
  resolve:  // bool - Resolve given path before publishing. Default: true
  lifetime: // string - Time duration of the record. Default: 24h
  ttl:      // string - Time duration this record should be cached
  key:      // string - Name of the key to be used or Peer ID. Default: 'self'
}
```

`callback` must follow `function (err, name) {}` signature, where `err` is an error if the operation was not successful. `name` is an object that contains the IPNS hash and the IPFS hash, such as: 

```JavaScript
{
  name: "/ipns/QmHash.."
  value: "/ipfs/QmHash.."
}
```

If no `callback` is passed, a promise is returned.

**Example:**

Imagine you want to publish your website under IPFS. You can use the [Files API](./FILES.md) to publish your static website and then you'll get a multihash you can link to. But when you need to make a change, a problem arises: you get a new multihash because you now have a different content. And it is not possible for you to be always giving others the new address.

Here's where the Name API comes in handy. With it, you can use one static multihash for your website under IPNS (InterPlanetary Name Service). This way, you can have one single multihash poiting to the newest version of your website.

```JavaScript
// The address of your files.
const addr = '/ipfs/QmbezGequPwcsWo8UL4wDF6a8hYwM1hmbzYv2mnKkEWaUp'

ipfs.name.publish(addr, function (err, res) {
    // You now receive a res which contains two fields:
    //   - name: the name under which the content was published.
    //   - value: the "real" address to which Name points.
    console.log(`https://gateway.ipfs.io/ipns/${res.name}`)
})
```

This way, you can republish a new version of your website under the same address. By default, `ipfs.name.publish` will use the Peer ID. If you want to have multiple websites (for example) under the same IPFS module, you can always check the [key API](./KEY.md).

#### `resolve`

> Resolve an IPNS name.

##### `Go` **WIP**

##### `JavaScript` - ipfs.name.resolve(value, [options, callback])

`value` is a IPNS address, such as: `/ipns/ipfs.io`.

`options` is an object that may contain:

```JavaScript
{
  recursive: // bool - Resolve until the result is not an IPNS name. Default: false.
  nocache: // bool - Do not use cached entries. Default: false.
}
```

`callback` must follow `function (err, name) {}` signature, where `err` is an error if the operation was not successful. `name` is a string that contains the IPFS hash.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
// The IPNS address you want to resolve.
const addr = '/ipns/ipfs.io'

ipfs.name.resolve(addr, function (err, name) {
    console.log(name)
    // /ipfs/QmQrX8hka2BtNHa8N8arAq16TCVx5qHcb46c5yPewRycLm
})
```
