var git = require('../ipfs-objects-git')
var path = require('../ipfs-path')

// setup
var storage = require('../ipfs-storage')()
var blocks = require('../ipfs-blocks')(storage)
var resolver = require('./')(blocks)
var log = console.log

var b1 = git.Block({data: new Buffer("b1b1b1")})
var b2 = git.Block({data: new Buffer("b1b1b1")})
var b3 = git.Block({data: new Buffer("b3b3b3")})

var l1 = git.List([b1, b2, b3])
var l2 = git.List([l1, b1, b1, b2, b3])

var t1 = git.Tree({'b1': b1, 'l1': l1, 'b3': b3})
var t3 = git.Tree({'b1': b1, 'l2': b2, 't1': t1})

function put(obj, cb) {
  console.log('putting: ' + obj.inspect())
  blocks.putObject(obj, cb)
}

put(b1)
put(b2)
put(l1)
put(l2)
put(t1)
put(t3, function(err) {
  if (err) return log(err)
  step1()
})

function step1() {

  // resolve an ipfs-path
  var p1 = path([t3, 't1', 'b1']) // /<hash-of-t3>/t1/b1
  log('resolving: ' + p1.inspect())
  resolver.resolve(p1, function(err, obj) {
    if (err) return log(err)
    if (!obj.equals(b1)) {
      log(p1)
      log(obj)
      log(b1)
      throw new Error('failed to resolve')
    }
    step2() // continue
  })
}

function step2() {

  // resolve a string path
  var p1 = path([t3, 't1', 'b1']) // /<hash-of-t3>/t1/b1
  var sp1 = p1.toString() // /<hash-of-t3>/t1/b1
  log('resolving: ' + sp1)
  resolver.resolve(sp1, function(err, obj) {
    if (err) return log(err)
    if (!obj.equals(b1)) {
      log(sp1)
      log(obj)
      log(b1)
      throw new Error('failed to resolve')
    }
    step3() // continue
  })
}

function step3() {
  // resolve a link from an object
  var p = "t1/l1/1"
  log('resolving: ' + t3.inspect() + ' link '+ p)
  resolver.linkResolve(t3, p, function(err, obj) {
    if (err) {
      log(obj)
      return log(err)
    }

    if (!obj.equals(b2)) {
      log(p)
      log(obj)
      log(b2)

      throw new Error('failed to resolve')
    }
  })
}
