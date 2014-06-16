var git = require('../ipfs-objects-git')
var path = require('./')
var log = console.log

var b1 = git.Block({data: new Buffer("b1b1b1")})
var b2 = git.Block({data: new Buffer("b1b1b1")})
var b3 = git.Block({data: new Buffer("b3b3b3")})

var l1 = git.List([b1, b2, b3])
var l2 = git.List([l1, b1, b1, b2, b3])

var t1 = git.Tree({'b1': b1, 'l1': l1, 'b3': b3})
var t3 = git.Tree({'b1': b1, 'l2': b2, 't1': t1})


var p1 = path([t3, 't1', '0', '1'])
log(p1)
// /<t3-multihash>/t1/0/1  ---means--> b2

if (p1.length() != 4)
  throw new Error('length error: ' + p1.length())

var p2 = p1.slice(1)
log(p2)
// /<t3-multihash>/t1/0

// components
log(p2.first()) // t1
log(p2.last())  // 1
log(p2.parts) // ['t1', '0', '1']

var p3 = p2.prepend(t3)
log(p3)
log(p3.equals(p1))

// partial resolution step.
// var t1hash = t3.child(p2.first())
// log(t1hash)
