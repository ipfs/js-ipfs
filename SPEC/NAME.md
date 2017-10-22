name API
========

#### `publish`

> Publish an IPNS name with a given value.

##### `Go` **WIP**

##### `JavaScript` - ipfs.name.publish(value, [options, callback])

`value` is a base58 encoded IPFS multihash, such as: `/ipfs/QmbezGequPwcsWo8UL4wDF6a8hYwM1hmbzYv2mnKkEWaUp`.

`options` is an object that may contain:

```JavaScript
{
  resolve: // bool - Resolve given path before publishing. Default: true.
  lifetime: // string - Time duration of the record. Defaulg: 24h
  ttl:  // string - Time duration this record should be cached
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

Example:

```JavaScript
// TODO
```

#### `resolve`

> Resolve an IPNS name.

##### `Go` **WIP**

##### `JavaScript` - ipfs.name.resolve([options, callback])

`options` is an object that may contain:

```JavaScript
{
  recursive: // bool - Resolve until the result is not an IPNS name. Default: false.
  nocache: // bool - Do not use cached entries. Default: false.
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

Example:

```JavaScript
// TODO
```
