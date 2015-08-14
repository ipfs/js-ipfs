var multiaddr = require('multiaddr')
var config = require('./config')
// var send = require('./request-api')
var qs = require('querystring')
var getFilesStream = require('./get-files-stream')
var http = require('http')

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

  // -

  function send (path, args, opts, files, buffer, cb) {
    var query, stream, contentType
    contentType = 'application/json'

    if (Array.isArray(path)) path = path.join('/')

    opts = opts || {}

    if (args && !Array.isArray(args)) args = [args]
    if (args) opts.arg = args

    opts['stream-channels'] = true
    query = qs.stringify(opts)

    if (files) {
      stream = getFilesStream(files, opts)
      if (!stream.boundary) {
        throw new Error('no boundary in multipart stream')
      }
      contentType = 'multipart/form-data; boundary=' + stream.boundary
    }

    if (typeof buffer === 'function') {
      cb = buffer
      buffer = false
    }

    var reqo = {
      method: files ? 'POST' : 'GET',
      host: host,
      port: port,
      path: config['api-path'] + path + '?' + query,
      headers: {
        'User-Agent': config['user-agent'],
        'Content-Type': contentType
      },
      withCredentials: false
    }

    var req = http.request(reqo, function (res) {
      var data = ''
      var objects = []
      var stream = !!res.headers['x-stream-output']
      var chunkedObjects = !!res.headers['x-chunked-output']

      if (stream && !buffer) return cb(null, res)
      if (chunkedObjects && buffer) return cb(null, res)

      res.on('data', function (chunk) {
        if (!chunkedObjects) {
          data += chunk
          return data
        }

        try {
          var obj = JSON.parse(chunk.toString())
          objects.push(obj)
        } catch(e) {
          chunkedObjects = false
          data += chunk
        }
      })
      res.on('end', function () {
        var parsed

        if (!chunkedObjects) {
          try {
            parsed = JSON.parse(data)
            data = parsed
          } catch (e) {}
        } else {
          data = objects
        }

        if (res.statusCode >= 400 || !res.statusCode) {
          if (!data) data = new Error()
          return cb(data, null)
        }
        return cb(null, data)
      })
      res.on('error', function (err) {
        return cb(err, null)
      })
    })

    if (stream) {
      stream.pipe(req)
    } else {
      req.end()
    }

    return req
  }

  // -

  function command (name) {
    return function (cb) {
      return send(name, null, null, null, cb)
    }
  }

  function argCommand (name) {
    return function (arg, cb) {
      return send(name, arg, null, null, cb)
    }
  }

  return {
    send: send,

    add: function (files, opts, cb) {
      if (typeof (opts) === 'function' && cb === undefined) {
        cb = opts
        opts = {}
      }

      return send('add', null, opts, files, cb)
    },
    cat: argCommand('cat'),
    ls: argCommand('ls'),

    config: {
      get: argCommand('config'),
      set: function (key, value, cb) {
        return send('config', [key, value], null, null, cb)
      },
      show: function (cb) {
        return send('config/show', null, null, null, true, cb)
      },
      replace: function (file, cb) {
        return send('config/replace', null, null, file, cb)
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
      return send('mount', null, opts, null, cb)
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
        return send('block/put', null, null, file, cb)
      }
    },

    object: {
      get: argCommand('object/get'),
      put: function (file, encoding, cb) {
        if (typeof encoding === 'function') {
          return cb(null, new Error("Must specify an object encoding ('json' or 'protobuf')"))
        }
        return send('object/put', encoding, null, file, cb)
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
      return send('ping', id, { n: 1 }, null, function (err, res) {
        if (err) return cb(err, null)
        cb(null, res[1])
      })
    },

    id: function (id, cb) {
      if (typeof id === 'function') {
        cb = id
        id = null
      }
      return send('id', id, null, null, cb)
    },
    pin: {
      add: function (hash, opts, cb) {
        if (typeof opts === 'function') {
          cb = opts
          opts = null
        }

        send('pin/add', hash, opts, null, cb)
      },
      remove: function (hash, opts, cb) {
        if (typeof opts === 'function') {
          cb = opts
          opts = null
        }

        send('pin/rm', hash, opts, null, cb)
      },
      list: function (type, cb) {
        if (typeof type === 'function') {
          cb = type
          type = null
        }
        var opts = null
        if (type) opts = { type: type }
        return send('pin/ls', null, opts, null, cb)
      }
    },

    gateway: {
      enable: command('gateway/enable'),
      disable: command('gateway/disable')
    },

    log: {
      tail: function (cb) {
        return send('log/tail', null, {enc: 'text'}, null, true, cb)
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

        return send('dht/get', key, opts, null, function (err, res) {
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

        return send('dht/put', [key, value], opts, null, cb)
      }
    }
  }
}
