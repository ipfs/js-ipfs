# ipfs-path - path system for ipfs

This module provides filesystem paths on top of [ipfs](https://github.com/jbenet/ipfs) objects. It supports arbitrary object types, using the hashes and names in the objects' links. It also provides a binary encoding for paths, and path resolution.


```js
var git = require('ipfs-objects-git')
var path = require('ipfs-path')

var b1 = git.Block({data: new Buffer("b1b1b1")})
var b2 = git.Block({data: new Buffer("b1b1b1")})
var b3 = git.Block({data: new Buffer("b3b3b3")})

var l1 = List([b1, b2, b3])
var l2 = List([l1, b1, b1, b2, b3])

var t1 = Tree({'b1': b1, 'l1': l1, 'b3': b3})
var t3 = Tree({'b1': b1, 'l2': b2, 't1': t1})


var p1 = path(t3, 't1', '0', '1')
// /<t3-multihash>/t1/0/1  ---means--> b2

var p2 = p1.child()
// /t1/0/1

// components
p2.first() // t1
p2.last()  // 1
p2.split() // ['t1', '0', '1']

var p3 = p2.parent(t3)
// p3.equals(p1) is true

// partial resolution step.
var t1hash = t3.child(p2.first())
```
