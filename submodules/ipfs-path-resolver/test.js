var git = require('../ipfs-objects-git')
var path = require('../ipfs-path')
var memdown = require('memdown')
var storage = require('../ipfs-storage')({levelup: {db: memdown}})
var resolve = require('./')(storage)
var log = console.log

var b1 = git.Block({data: new Buffer("b1b1b1")})
var b2 = git.Block({data: new Buffer("b1b1b1")})
var b3 = git.Block({data: new Buffer("b3b3b3")})

var l1 = git.List([b1, b2, b3])
var l2 = git.List([l1, b1, b1, b2, b3])

var t1 = git.Tree({'b1': b1, 'l1': l1, 'b3': b3})
var t3 = git.Tree({'b1': b1, 'l2': b2, 't1': t1})

storage.putObject(b1)
storage.putObject(b2)
storage.putObject(l1)
storage.putObject(l2)
storage.putObject(t1)
storage.putObject(t3, function(err) {
  if (err) return console.log(err)

  // resolve an ipfs-path
  var p1 = path([t3, 't1', 'b1']) // /<hash-of-t3>/t1/b1
  resolve(p1, function(err, obj) {
    if (err) return console.log(err)
    if (!obj.equals(t1))
      throw new Error('failed to resolve')
  })

  // resolve a string path
  var sp1 = p1.toString() // /<hash-of-t3>/t1/b1
  resolve(sp1, function(err, obj) {
    if (err) return console.log(err)
    if (!obj.equals(t1))
      throw new Error('failed to resolve')
  })

  // resolve from an object
  // resolve(t3, "t1/l1/1", function(err, obj) {
  //   if (err) return console.log(err)
  //   if (!obj.equals(b2))
  //     throw new Error('failed to resolve')
  // })

})
