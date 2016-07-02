block API
=========

#### `get`

> Get a raw IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.get(multihash, [callback])

`multihash` is a [multihash][] which can be passed as

- Buffer, the raw Buffer of the multihash 
- String, the base58 encoded version of the multihash

`callback` must follow `function (err, block) {}` signature, where `err` is an error if the operation was not successful and `block` is a [Block][].


```js
ipfs.block.get(multihash, function (err, data) {
  // data is the raw data contained in a block
})
```

If no `callback` is passed, a promise is returned.




#### `put`

> Stores input as an IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.put(data, [callback])

Where `data` can be a

- Buffer, requiring that the encoding is specified on the options. if no 
  encoding is specified, Buffer is treated as the Data field
- [Block][] instance

`callback` has the signature `function (err, block) {}`, where `err` is an error
if the operation was not successful. and `block` is a [Block][].

If no `callback` is passed, a promise is returned.





#### `stat`

> Print information of a raw IPFS block.

##### `Go` **WIP**

##### `JavaScript` - ipfs.block.stat(multihash, [callback])

`multihash` is a [multihash][] which can be passed as:

- Buffer, the raw Buffer of the multihash (or of and encoded version)
- String, the toString version of the multihash (or of an encoded version)

`callback` must follow the signature `function (err, stats) {}`, where `err` is
an error if the operation was not successful and `stats` is an object with
the format

```JavaScript
{
  Key: 'QmPTkMuuL6PD8L2SwTwbcs1NPg14U8mRzerB1ZrrBrkSDD',
  Size: 10
}
```

If no `callback` is passed, a promise is returned.