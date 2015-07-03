var fs = require('fs')
var Git = require('../ipfs-objects-git')
var Path = require('../ipfs-path')
var path = require('path')

module.exports = add

function add(ipfs, argv) {
  if (argv._args.length == 0) {
    console.error('ipfs add <local-path>')
    process.exit(-1)
  }

  var adder = Adder(ipfs, {
    recursive: (argv.r || argv.recursive),
  })

  adder.addPath(argv._args[0])
}

function Adder(ipfs, opts) {
  if (!(this instanceof Adder))
    return new Adder(ipfs, opts)
  this.ipfs = ipfs
  this.opts = opts
}

Adder.prototype.addPath = function(p, cb) {
  var self = this
  fs.stat(p, function(err, stat) {
    if (err) return die(err)

    if (stat.isDirectory()) {
      if (self.opts.recursive)
        self.addTree(p, cb)
      else
        console.log(p + ': ignored (use -r for recursive)')
    }
    else if (stat.isFile())
      self.addBlock(p, cb)
    else
      console.log(p + ': ignored (not file or dir)')
  })
}

Adder.prototype.addTree = function(p, cb) {
  if (!this.opts.recursive)
    return cb(new Error('cannot addTree in non recursive context'))

  var self = this
  function writeTree(p, objs, cb) {
    var tree = Git.Tree(objs)
    self.ipfs.blocks.putObject(tree, function(err, key, val) {
      if (err) return cb(err, p, tree)

      console.log(p + ': added tree ' + Path(tree))
      cb && cb(null, p, tree)
    })
  }

  fs.readdir(p, function(err, files) {
    var objs = {}
    for (var f in files) {
      objs[files[f]] = null

      // add subpath
      var subpath = path.join(p, files[f])
      self.addPath(subpath, function(err, p2, obj) {
        if (err) return cb(err, p2, obj)

        objs[path.basename(p2)] = obj
        if (all(objs)) { // when done adding all subobjs
          writeTree(p, objs, cb)
        }
      })
    }

  })
}


Adder.prototype.addBlock = function(p, cb) {
  var self = this
  fs.readFile(p, function(err, data) {
    if (err) return cb(err, p)

    var block = Git.Block({data: new Buffer(data)})
    self.ipfs.blocks.putObject(block, function(err, key, val) {
      if (err) return cb(err, p, block)

      console.log(p + ': added block ' + Path(block))
      cb && cb(null, p, block)
    })
  })
}


function die(err) {
  console.error('ipfs add: ' + err)
  process.exit(-1)
}

function all(coll, filter) {
  filter = filter || function(v) { return !!v }
  for (var k in coll) {
    if (!filter(coll[k]))
      return false
  }
  return true
}
