var Path = require('../ipfs-path')
var errors = require('../ipfs-errors')

module.exports = function(storage) {
  var r = Resolver(storage)
  return r.resolve.bind(r)
}

function Resolver(storage) {
  if (!(this instanceof Resolver))
    return new Resolver(storage)

  this.storage = storage
}


// ipfs path resolution algorithm:
// - first component is always the multihash of an object
// - other components are named links parting from that object
// - e.g. resolve /abcd123/foo/bar/baz:
//    obj = lookupByHash('abcd123')
//    obj = obj.child('foo')
//    obj = obj.child('bar')
//    obj = obj.child('baz')
//    return obj
//
// - or generalizing:
//
//    split = path.split()
//    obj = lookupByHash(split.shift())
//    while (split.length > 0)
//      obj = obj.child(split.shift())
//    return obj

Resolver.prototype.resolve = function(path, cb) {
  // input validation
  if (!path) throw new Error('resolve requires path')
  if (!cb || !(typeof(cb) == 'function'))
    throw new Error('resolve requires callback function')

  path = Path(path)
  var splitPath = path.bufsplit()
  var hash = splitPath.shift()

  // errContext gets returned in callback if error happens.
  var errContext = {last: null, remainder: path}

  console.log(hash)
  this.storage.getObject(hash, function(err, obj) {
    if (err) return cb(err, errContext)
    console.log(Path(splitPath))
    this.linkResolve(obj, Path(splitPath), cb)
  })
  return errors.ReturnCallbackError
}


Resolver.prototype.linkResolve = function linkResolve(object, path, cb) {
  // input validation
  if (!object) throw new Error('linkResolve requires object.')
  if (!cb || !(typeof(cb) == 'function'))
    throw new Error('linkResolve requires callback function')

  // base case. if no more to resolve, done!
  if (!path || path.toString() == '/') {
    cb(null, object)
    return errors.ReturnCallbackError
  }

  // errContext gets returned in callback if error happens.
  var errContext = {last: object, remainder: path}

  // get hash of next object from link structure
  path = Path(path)
  var splitPath = path.split()
  var next = splitPath.shift()
  var child = object.child(next)
  if (!child) {
    cb(errors.NotFoundError, errContext)
    return errors.ReturnCallbackError
  }

  // get object from storage.
  var self = this
  this.storage.getObject(child, function(err, obj) {
    if (err) return cb(err, errContext)
    self.linkResolve(obj, Path(splitPath), cb) // keep resolving recursively
  })

  return errors.ReturnCallbackError
}
