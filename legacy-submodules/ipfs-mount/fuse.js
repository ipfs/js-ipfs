var fs = require('fs')
var map = require('lodash.map')
var path = require('path')
var f4js = require('fuse4js')
var proc = require('child_process')
var mkdirp = require('mkdirp')
var base58 = require('base58-native')
var umount = require('./umount')

var ENOENT = -2
var EPERM = -1
var EINVAL = -22

module.exports = ipfsMount

// ipfsMount(ipfs, [ipfsPath='/'], osPath)
function ipfsMount(ipfs, ipfsPath, osPath) {
  if (!(this instanceof ipfsMount))
    return new ipfsMount(ipfs, ipfsPath, osPath)

  var self = this
  if (!ipfs || !ipfsPath)
    throw new Error('requires at least two arguments (ipfs, osPath)')

  // defaults
  if (!osPath) {
    osPath = ipfsPath || '/ipfs'
    ipfsPath = '/'
  }

  ipfsPath = path.normalize(ipfsPath) // todo shouldnt do this in windows
  osPath = path.normalize(osPath)

  this.ipfs = ipfs
  this.osPath = osPath
  this.ipfsPath = ipfsPath
  this.files = {}  // { path : { obj: object, fds: [] } }
  this.mount()
}

ipfsMount.prototype.mount = function(cb) {
  var osPath = this.osPath
  var handlers = this._handlers()
  console.log(osPath)
  umount(osPath, function() {
    mkdirp(osPath, function() {
      f4js.start(osPath, handlers, false, [])
    })
  })
}

ipfsMount.prototype.umount = function(cb) {
  umount(this.osPath, cb)
}

ipfsMount.prototype.terminate = function() {
  var args = [this.osPath, '' + process.pid]
  proc.fork(path.join(__dirname, 'destroy.js'), args)
}

ipfsMount.prototype._handlers = function() {
  var mount = this // for ref inside functions.
  var handlers = {}

  function resolvePath(path, cb) {
    mount.ipfs.resolver.resolve(path, function(err, obj) {
      if (err) {
        if (err != mount.ipfs.resolver.errors.NotFoundError)
          console.log('ipfs.resolver error: ' + err)

        console.log('ipfs.resolver not found: ' + path)
        return cb(ENOENT)
      }

      console.log('ipfs.resolver found: ' + path)
      cb(null, obj)
    })
  }

  function getPath(path, cb) {
    if (path == '/')
      return cb(ENOENT)

    console.log('ipfs.mount get ' + path)

    if (mount.files[path])
      return cb(0, mount.files[path].obj)

    try {
      resolvePath(path, cb)
    } catch(e) {
      console.log('exception thrown while resolving path.')
      console.log(e.stack)
      console.trace()
      cb(ENOENT)
    }
  }

  handlers.getattr = function(path, cb) {
    if (path == '/')
      return cb(0, { size: 4096, mode: 040111 })

    getPath(path, function(err, obj) {
      if (err === ENOENT) return cb(ENOENT)
      if (err) throw err
      if (!obj) throw new Error('expected object')

      var stat = {}

      // for now assume that if it has links, it's a dir.
      // will need to do something smarter for lists, etc.
      var links = obj.links()
      if (links.length > 0) {
        stat.size = 4096 // why 4096? ask mafintosh
        stat.mode = 040555 // +rx
      } else {
        stat.size = obj.data().length // todo add a .dataSize() to obj
        stat.mode = 0100444 // +r
      }
      cb(0, stat)
    })
  }

  handlers.open = function(path, flags, cb) {
    var files = mount.files
    getPath(path, function(err, obj) {
      if (err === ENOENT) return cb(ENOENT)
      if (err) throw err
      if (!obj) throw new Error('expected object')

      // only need to hang on to obj once :)
      var file = files[path] = files[path] || { obj: obj, fds: [] }
      var fd = file.fds.indexOf(null) // reuse fd
      if (fd === -1) fd = file.fds.length // alloc new fd

      // assign specific fd to this open call
      file.fds[fd] = true
      cb(0, fd)
    })
  }

  handlers.release = function(path, handle, cb) {
    var fds = (mount.files[path] || {}).fds
    if (!fds) return cb(ENOENT) // maybe cb(0)?

    var fd = fds[handle]
    if (!fds[handle]) return cb(ENOENT) // maybe cb(0)?
    fds[handle] = null

    // if no more fds actuve, release object altogether
    if (!any(fds))
      delete mount.files[path]

    cb(0)
  }

  handlers.readdir = function(path, cb) {
    // note: this is hideous. fix it.
    if (path ===  '/') { // root? then list local files.
      return cb(ENOENT)
    }

    // not even needed atm because getattr returns mode 0111 for now.
    //   mount.ipfs.storage.list('/', function(err, list) {
    //     var names = []
    //     list
    //       .on('data', function(key) {
    //         var name = base58.encode(key)
    //         console.log(name)
    //         names.push(name)
    //       })
    //       .on('error', function(err) {
    //         console.log('ipfs mount error: ' + err) // todo fix
    //         cb(ENOENT)
    //       })
    //       .on('end', function() {
    //         if (names.length > 0)
    //           cb(0, names)
    //         else
    //           cb(ENOENT)
    //       })
    //     // list.unpause()
    //   })
    //   return
    // }

    getPath(path, function(err, obj) {
      if (err === ENOENT) return cb(ENOENT)
      if (err) throw err
      if (!obj) throw new Error('expected object')

      var files = map(obj.links(), function(link) {
        return link.name || link.hash
      })

      if (!files.length) return cb(ENOENT)
      cb(0, files)
    })
  }

  handlers.read = function(path, offset, len, buf, handle, cb) {
    var file = mount.files[path]
    if (!file || !file.obj) return cb(ENOENT)
    if (!file.fds[handle]) return cb(ENOENT)
    // consider offset checks here

    // will need streaming logic here for lists, etc.
    // for now, just dump out the block data.
    var data = file.obj.data()
    if (len + offset > data.length)
      len = data.length - offset

    var slice = data.slice(offset, offset + len)
    slice.copy(buf)
    cb(slice.length)
  }

  handlers.write = function(path, offset, len, buf, handle, cb) {
    cb(EPERM)
  }

  handlers.unlink = function(path, cb) {
    cb(EPERM)
  }

  handlers.rename = function(src, dst, cb) {
    cb(EPERM)
  }

  handlers.mkdir = function(path, mode, cb) {
    cb(EPERM)
  }

  handlers.rmdir = function(path, cb) {
    cb(EPERM)
  }

  handlers.create = function(path, mode, cb) {
    cb(EPERM)
  }

  handlers.getxattr = function(path, cb) {
    cb(EPERM)
  }

  handlers.setxattr = function(path, name, value, size, a, b, cb) {
    cb(0)
  }

  handlers.statfs = function(cb) {
    cb(0, {
      bsize: 1000000,
      frsize: 1000000,
      blocks: 1000000,
      bfree: 1000000,
      bavail: 1000000,
      files: 1000000,
      ffree: 1000000,
      favail: 1000000,
      fsid: 1000000,
      flag: 1000000,
      namemax: 1000000
    })
  }

  handlers.destroy = function(cb) {
    cb()
  }

  return handlers
  // return logHandlers(handlers) // for debugging
}

function logHandlers(handlers) {
  function newh(n, oldh) {
    return function() {
      var args = Array.prototype.slice.call(arguments, 0)
      console.log('calling ' + n + ': ' + args)
      return oldh.apply(this, arguments)
    }
  }

  var newHandlers = {}
  for (var n in handlers) {
    newHandlers[n] = newh(n, handlers[n])
  }
  return newHandlers
}

// no lodash.any :(
function any(fds, filter) {
  filter = filter || function(e) {
    return !(e == null || e === undefined)
  }

  for (var fd in fds) {
    if (filter(fds[fd]))
      return true
  }
  return false
}
