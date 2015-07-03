# ipfs-object - defines the interface all objects must use

## Format

```proto
// An IPFS Object
message Object {
  optional bytes data = 1; // opaque data
  repeated Link links = 2; // refs to other objects
}

// An IPFS Link
message Link {
  optional bytes hash = 1;
  optional string name = 2;
  optional uint64 size = 3; // cumulative
}
```

## Example

```js
var Object = require('./')
var log = console.log

var a = Object({ data: new Buffer("aaa") })
var b = Object({ data: new Buffer("bbb") })
var c = Object({
  data: new Buffer("ccc"),
  links: [
    {hash: a.multihash(), name: "a", size: 10 },
    {hash: b.multihash(), name: "b", size: 10 },
  ]
})

log(c.data())
// new Buffer("ccc")

log(c.links())
// [
//  {hash: new Buffer(...), name: "a", size: 10 },
//  {hash: new Buffer(...), name: "b", size: 10 },
//]

log(c.decode())
// { data: new Buffer("ccc"),
//   links: [
//     {hash: new Buffer(...), name: "a", size: 10 },
//     {hash: new Buffer(...), name: "b", size: 10 } ] }
```
