var multiaddr = require('multiaddr')
var config = require('./config')
var requestAPI = require('./request-api')

exports = module.exports = IpfsAPI

function IpfsAPI (host_or_multiaddr, port) {
  var self = this

  if (!(self instanceof IpfsAPI)) {
    return new IpfsAPI(host_or_multiaddr, port)
  }

  try {
    var maddr = multiaddr(host_or_multiaddr).nodeAddress()
    config.host = maddr.address
    config.port = maddr.port
  } catch (e) {
    config.host = host_or_multiaddr
    config.port = port || config.port
  }

  // autoconfigure in browser
  if (!config.host &&
    window && window.location) {
    var split = window.location.host.split(':')
    config.host = split[0]
    config.port = split[1]
  }

  // -- Internal

  function command (name) {
    return function (opts, cb) {
      if (typeof (opts) === 'function') {
        cb = opts
        opts = {}
      }
      return requestAPI(name, null, opts, null, cb)
    }
  }

  function argCommand (name) {
    return function (arg, opts, cb) {
      if (typeof (opts) === 'function') {
        cb = opts
        opts = {}
      }
      return requestAPI(name, arg, opts, null, cb)
    }
  }

  // -- Interface

  self.send = requestAPI

  self.add = function (files, opts, cb) {
    if (typeof (opts) === 'function' && cb === undefined) {
      cb = opts
      opts = {}
    }

    return requestAPI('add', null, opts, files, cb)
  }

  self.cat = argCommand('cat')
  self.ls = argCommand('ls')

  self.config = {
    get: argCommand('config'),
    set: function (key, value, opts, cb) {
      if (typeof (opts) === 'function') {
        cb = opts
        opts = {}
      }
      return requestAPI('config', [key, value], opts, null, cb)
    },
    show: function (cb) {
      return requestAPI('config/show', null, null, null, true, cb)
    },
    replace: function (file, cb) {
      return requestAPI('config/replace', null, null, file, cb)
    }
  }

  self.update = {
    apply: command('update'),
    check: command('update/check'),
    log: command('update/log')
  }

  self.version = command('version')
  self.commands = command('commands')

  self.mount = function (ipfs, ipns, cb) {
    if (typeof ipfs === 'function') {
      cb = ipfs
      ipfs = null
    } else if (typeof ipns === 'function') {
      cb = ipns
      ipns = null
    }
    var opts = {}
    if (ipfs) opts.f = ipfs
    if (ipns) opts.n = ipns
    return requestAPI('mount', null, opts, null, cb)
  }

  self.diag = {
    net: command('diag/net')
  }

  self.block = {
    get: argCommand('block/get'),
    put: function (file, cb) {
      if (Array.isArray(file)) {
        return cb(null, new Error('block.put() only accepts 1 file'))
      }
      return requestAPI('block/put', null, null, file, cb)
    }
  }

  self.object = {
    get: argCommand('object/get'),
    put: function (file, encoding, cb) {
      if (typeof encoding === 'function') {
        return cb(null, new Error("Must specify an object encoding ('json' or 'protobuf')"))
      }
      return requestAPI('object/put', encoding, null, file, cb)
    },
    data: argCommand('object/data'),
    stat: argCommand('object/stat'),
    links: argCommand('object/links')
  }

  self.swarm = {
    peers: command('swarm/peers'),
    connect: argCommand('swarm/peers')
  }

  self.ping = function (id, cb) {
    return requestAPI('ping', id, { n: 1 }, null, function (err, res) {
      if (err) return cb(err, null)
      cb(null, res[1])
    })
  }

  self.id = function (id, cb) {
    if (typeof id === 'function') {
      cb = id
      id = null
    }
    return requestAPI('id', id, null, null, cb)
  }

  self.pin = {
    add: function (hash, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = null
      }

      requestAPI('pin/add', hash, opts, null, cb)
    },
    remove: function (hash, opts, cb) {
      if (typeof opts === 'function') {
        cb = opts
        opts = null
      }

      requestAPI('pin/rm', hash, opts, null, cb)
    },
    list: function (type, cb) {
      if (typeof type === 'function') {
        cb = type
        type = null
      }
      var opts = null
      if (type) opts = { type: type }
      return requestAPI('pin/ls', null, opts, null, cb)
    }
  }

  self.gateway = {
    enable: command('gateway/enable'),
    disable: command('gateway/disable')
  }

  self.log = {
    tail: function (cb) {
      return requestAPI('log/tail', null, {enc: 'text'}, null, true, cb)
    }
  }

  self.name = {
    publish: argCommand('name/publish'),
    resolve: argCommand('name/resolve')
  }

  self.Buffer = Buffer

  self.refs = argCommand('refs')
  self.refs.local = command('refs/local')

  self.dht = {
    findprovs: argCommand('dht/findprovs'),

    get: function (key, opts, cb) {
      if (typeof (opts) === 'function' && !cb) {
        cb = opts
        opts = null
      }

      return requestAPI('dht/get', key, opts, null, function (err, res) {
        if (err) return cb(err)
        if (!res) return cb(new Error('empty response'))
        if (res.length === 0) return cb(new Error('no value returned for key'))

        if (res[0].Type === 5) {
          cb(null, res[0].Extra)
        } else {
          cb(res)
        }
      })
    },

    put: function (key, value, opts, cb) {
      if (typeof (opts) === 'function' && !cb) {
        cb = opts
        opts = null
      }

      return requestAPI('dht/put', [key, value], opts, null, cb)
    }
  }
}
