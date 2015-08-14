var multiaddr = require('multiaddr')
var config = require('./config')
var requestAPI = require('./request-api')

module.exports = function (host_or_multiaddr, port) {
  var host
  try {
    var maddr = multiaddr(host_or_multiaddr).nodeAddress()
    host = maddr.address
    port = maddr.port
  } catch (e) {
    host = host_or_multiaddr
  }

  if (!host) host = 'localhost'
  if (!port) port = 5001

  config.host = host
  config.port = port

  function command (name) {
    return function (cb) {
      return requestAPI(name, null, null, null, cb)
    }
  }

  function argCommand (name) {
    return function (arg, cb) {
      return requestAPI(name, arg, null, null, cb)
    }
  }

  return {
    send: requestAPI,

    add: function (files, opts, cb) {
      if (typeof (opts) === 'function' && cb === undefined) {
        cb = opts
        opts = {}
      }

      return requestAPI('add', null, opts, files, cb)
    },
    cat: argCommand('cat'),
    ls: argCommand('ls'),

    config: {
      get: argCommand('config'),
      set: function (key, value, cb) {
        return requestAPI('config', [key, value], null, null, cb)
      },
      show: function (cb) {
        return requestAPI('config/show', null, null, null, true, cb)
      },
      replace: function (file, cb) {
        return requestAPI('config/replace', null, null, file, cb)
      }
    },

    update: {
      apply: command('update'),
      check: command('update/check'),
      log: command('update/log')
    },
    version: command('version'),
    commands: command('commands'),

    mount: function (ipfs, ipns, cb) {
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
    },

    diag: {
      net: command('diag/net')
    },

    block: {
      get: argCommand('block/get'),
      put: function (file, cb) {
        if (Array.isArray(file)) {
          return cb(null, new Error('block.put() only accepts 1 file'))
        }
        return requestAPI('block/put', null, null, file, cb)
      }
    },

    object: {
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
    },

    swarm: {
      peers: command('swarm/peers'),
      connect: argCommand('swarm/peers')
    },
    ping: function (id, cb) {
      return requestAPI('ping', id, { n: 1 }, null, function (err, res) {
        if (err) return cb(err, null)
        cb(null, res[1])
      })
    },

    id: function (id, cb) {
      if (typeof id === 'function') {
        cb = id
        id = null
      }
      return requestAPI('id', id, null, null, cb)
    },
    pin: {
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
    },

    gateway: {
      enable: command('gateway/enable'),
      disable: command('gateway/disable')
    },

    log: {
      tail: function (cb) {
        return requestAPI('log/tail', null, {enc: 'text'}, null, true, cb)
      }
    },

    name: {
      resolve: argCommand('name/resolve')
    },

    dht: {
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
}
