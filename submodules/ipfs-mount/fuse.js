var fs = require('fs')
var map = require('lodash.map')
var path = require('path')
var f4js = require('fuse4js')
var proc = require('child_process')
var mkdirp = require('mkdirp')
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
    osPath = ipfsPath || '/'
    ipfsPath = '/'
  }

  ipfsPath = path.normalize(ipfsPath) // todo shouldnt do this in windows
  osPath = path.normalize(osPath)

  this.ipfs = ipfs
  this.osPath = osPath
  this.ipfsPath = ipfsPath
  this._files = {}

  umount(osPath, function() {
    mkdirp(osPath, function() {
      f4js.start(osPath, self, false, [])
    })
  })
}

ipfsMount.prototype._getPath = function(path, cb) {
  this.ipfs.resolver.resolve(path, function(err, obj) {
    if (err) {
      if (err != ipfs.resolver.errors.NotFoundError)
        console.log('ipfs.resolver error: ' + err)

      console.log('ipfs.resolver not found: ' + path)
      return cb(ENOENT)
    }

    console.log('ipfs.resolver found: ' + path)
    cb(null, obj)
  })
}

ipfsMount.prototype._umount = function(cb) {
  umount(this.osPath, cb)
}

ipfsMount.prototype._terminate = function() {
  var args = [this.osPath, '' + process.pid]
  proc.fork(path.join(__dirname, 'destroy.js'), args)
}

ipfsMount.prototype.getattr = function(path, cb) {
  this._getPath(path, function(err, obj) {
    if (err === ENOENT) return cb(ENOENT)
    if (err) throw err

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
    console.log(stat)
    cb(0, stat)
  })
}

var files = {}

ipfsMount.prototype.open = function(path, flags, cb) {
  var files = this._files
  this._getPath(path, function(err, obj) {
    if (err === ENOENT) return cb(ENOENT)
    if (err) throw err

    var fds = files[path] = files[path] || []
    var fd = fds.indexOf(null) // reuse fd
    if (fd === -1) fd = fds.length // alloc new fd

    fds[fd] = {offset:0}
    cb(0, fd)
  })
}

ipfsMount.prototype.release = function(path, handle, cb) {
  var fds = this._files[path] || []
  var fd = fds[handle]
  // if (fd && fd.obj) delete fd.obj
  fds[handle] = null
  cb(0)
}

ipfsMount.prototype.readdir = function(path, cb) {
  if (path ===  '/') { // root? then list local files.
    this.ipfs.storage.list('/', function(err, list) {
      var names = []
      list
        .on('data', function(name) {
          names.push(name)
        })
        .on('error', function(err) {
          console.log('ipfs mount error: ' + err) // todo fix
          cb(ENOENT)
        })
        .on('end', function() {
          if (names.length > 0)
            cb(0, names)
          else
            cb(ENOENT)
        })
      // list.unpause()
    })
    return
  }

  this._getPath(path, function(err, obj) {
    if (err === ENOENT) return cb(ENOENT)
    if (err) throw err

    var files = map(obj.links(), function(link) {
      return link.name || link.hash
    })

    if (!files.length) return cb(ENOENT)
    cb(0, files)
  })
}

ipfsMount.prototype.read = function(path, offset, len, buf, handle, cb) {
  var files = this._files
  this._getPath(path, function(err, obj) {
    if (err === ENOENT) return cb(ENOENT)
    if (err) throw err

    var fds = files[path] || []
    var fd = fds[handle]

    if (!fd) return cb(ENOENT)

    // will need streaming logic here for lists, etc.
    // for now, just dump out the block data.

    var data = obj.data()
    if (len + offset > data.length)
      len = data.length - offset

    var slice = data.slice(offset, len)
    slice.copy(buf)
    cb(result)
  })
};

ipfsMount.prototype.write = function(path, offset, len, buf, handle, cb) {
  cb(EPERM)
}

ipfsMount.prototype.unlink = function(path, cb) {
  cb(EPERM)
}

ipfsMount.prototype.rename = function(src, dst, cb) {
  cb(EPERM)
}

ipfsMount.prototype.mkdir = function(path, mode, cb) {
  cb(EPERM)
}

ipfsMount.prototype.rmdir = function(path, cb) {
  cb(EPERM)
}

ipfsMount.prototype.create = function(path, mode, cb) {
  cb(EPERM)
}

ipfsMount.prototype.getxattr = function(path, cb) {
  cb(EPERM)
}

ipfsMount.prototype.setxattr = function(path, name, value, size, a, b, cb) {
  cb(0)
}

ipfsMount.prototype.statfs = function(cb) {
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

ipfsMount.prototype.destroy = function(cb) {
  cb()
}
