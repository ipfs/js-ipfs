# ipfs-path-resolver

Resolves ipfs paths to objects, using ipfs-blocks. The resolver will retrieve (`get`) all necessary blocks in order to resolve the path.

## Examples

Suppose we have some objects:

```js
var git = require('ipfs-objects-git')

var b1 = git.Block({data: new Buffer("b1b1b1")})
var b2 = git.Block({data: new Buffer("b1b1b1")})
var b3 = git.Block({data: new Buffer("b3b3b3")})

var l1 = git.List([b1, b2, b3])
var l2 = git.List([l1, b1, b1, b2, b3])

var t1 = git.Tree({'b1': b1, 'l1': l1, 'b3': b3})
var t3 = git.Tree({'b1': b1, 'l2': b2, 't1': t1})
```

Let's store them + resolve paths:

```js
var path = require('ipfs-path')
var storage = require('ipfs-storage')(...)
var blocks = require('ipfs-blocks')(storage)
var resolver = require('ipfs-path-resolver')(storage)

storage.put([b1, b2, l1, l2, t1, t3], functon(err) {
  if (err) return console.log(err)

  // resolve an ipfs-path
  var p1 = path(t3, 't1', 'b1') // /<hash-of-t3>/t1/b1
  resolve(p1, function(err, obj) {
    if (err) return console.log(err)
    obj.equals(t1) // true
  })

  // resolve a string path
  var sp1 = p1.toString() // /<hash-of-t3>/t1/b1
  resolve(sp1, function(err, obj) {
    if (err) return console.log(err)
    obj.equals(t1) // true
  })

  // resolve from an object
  resolve(t3, "t1/l1/1", function(err, obj) {
    if (err) return console.log(err)
    obj.equals(b2) // true
  })

})
```

Note: if resolution fails (because a block is missing, the resolver will return an error, the last object retrieved, and the path remaining to be resolved)
