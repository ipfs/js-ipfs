var fs = require('fs');
var http = require('http');
var Multipart = require('multipart-stream');
var qs = require('querystring');

try {
  var package = JSON.parse(fs.readFileSync(__dirname + '/package.json'));
} catch(e) {
  var package = { name: 'ipfs-api-browserify', version: '?' };
}

var API_PATH = "/api/v0/";

module.exports = function(host, port) {
  if(!host) host = 'localhost';
  if(!port) port = 5001;

  function send(path, args, opts, files, buffer, cb) {
    if(Array.isArray(path)) path = path.join('/');

    opts = opts || {};
    if(args && !Array.isArray(args)) args = [args];
    if(args) opts.arg = args;
    opts['stream-channels'] = true;
    var query = qs.stringify(opts);

    var contentType = 'application/json';
    if(files) {
      var boundary = randomString();
      contentType = 'multipart/form-data; boundary=' + boundary;
    }

    if(typeof buffer === 'function') {
      cb = buffer;
      buffer = false;
    }

    var req = http.request({
      method: files ? 'POST' : 'GET',
      host: host,
      port: port,
      path: API_PATH + path + '?' + query,
      headers: {
        'User-Agent': '/node-'+package.name+'/'+package.version+'/',
        'Content-Type': contentType
      },
      withCredentials: false
    }, function(res) {
      var stream = !!res.headers['x-stream-output'];
      if(stream && !buffer) return cb(null, res);

      var chunkedObjects = !!res.headers['x-chunked-output'];
      if(chunkedObjects && buffer) return cb(null, res);

      var data = '';
      var objects = [];

      res.on('data', function(chunk) {
        if(!chunkedObjects) return data += chunk;

        try {
          var obj = JSON.parse(chunk.toString());
          objects.push(obj);
        } catch(e) {
          chunkedObjects = false;
          data += chunk;
        }
      });
      res.on('end', function() {
        if(!chunkedObjects) {
          try {
            var parsed = JSON.parse(data);
            data = parsed;
          } catch(e){}

        } else {
          data = objects;
        }

        if(res.statusCode >= 400 || !res.statusCode) {
          if(!data) data = new Error;
          return cb(data, null);
        }
        return cb(null, data);
      });
      res.on('error', function(err) {
        return cb(err, null);
      });
    });

    if(files) {
      var stream = getFileStream(files, boundary);
      stream.pipe(req);
    } else {
      req.end();
    }

    return req;
  }

  function getFileStream(files, boundary) {
    if(!files) return null;

    var mp = new Multipart(boundary);
    if(!Array.isArray(files)) files = [files];

    for(var i in files) {
      var file = files[i];

      if(typeof file === 'string') {
        // TODO: get actual content type
        mp.addPart({
          body: fs.createReadStream(file),
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'file; name="file"; filename="'+file+'"'
          }
        });

      } else if(Buffer.isBuffer(file)) {
        mp.addPart({
          body: file,
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': 'file; name="file"; filename=""'
          }
        });
      }
    }

    return mp;
  }

  function command(name) {
    return function(cb) {
      return send(name, null, null, null, cb);
    }
  }

  function argCommand(name) {
    return function(arg, cb) {
      return send(name, arg, null, null, cb);
    }
  }

  return {
    send: send,

    add: function(file, cb) {
      return send('add', null, null, file, cb);
    },
    cat: argCommand('cat'),
    ls: argCommand('ls'),

    config: {
      get: argCommand('config'),
      set: function(key, value, cb) {
        return send('config', [key, value], null, null, cb)
      },
      show: function(cb) {
        return send('config/show', null, null, null, true, cb);
      },
      replace: function(file, cb) {
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

    mount: function(ipfs, ipns, cb) {
      if(typeof ipfs === 'function') {
        cb = ipfs;
        ipfs = null;
      } else if(typeof ipns === 'function') {
        cb = ipns;
        ipns = null;
      }
      var opts = {};
      if(ipfs) opts.f = ipfs;
      if(ipns) opts.n = ipns;
      return send('mount', null, opts, null, cb);
    },

    diag: {
      net: command('diag/net')
    },

    block: {
      get: argCommand('block/get'),
      put: function(file, cb) {
        if(Array.isArray(file))
          return cb(null, new Error('block.put() only accepts 1 file'));
        return send('block/put', null, null, file, cb);
      },
    },

    object: {
      get: argCommand('object/get'),
      put: function(file, encoding, cb) {
        if(typeof encoding === 'function')
            return cb(null, new Error('Must specify an object encoding ("json" or "protobuf")'))
        return send('object/put', encoding, null, file, cb);
      },
      data: argCommand('object/data'),
      stat: argCommand('object/stat'),
      links: argCommand('object/links')
    },

    swarm: {
      peers: command('swarm/peers'),
      connect: argCommand('swarm/peers')
    },
    ping: function(id, cb) {
      return send('ping', id, { n: 1 }, null, function(err, res) {
        if(err) return cb(err, null);
        cb(null, res[1]);
      });
    },

    id: function(id, cb) {
      if(typeof id === 'function') {
        cb = id;
        id = null;
      }
      return send('id', id, null, null, cb);
    },
    pin: {
      add: function(hash, opts, cb) {
        if(typeof opts === 'function') {
          cb = opts;
          opts = null;
        }

        send('pin/add', hash, opts, null, cb);
      },
      remove: function(hash, opts, cb) {
        if(typeof opts === 'function') {
          cb = opts;
          opts = null;
        }

        send('pin/rm', hash, opts, null, cb);
      },
      list: function(type, cb) {
        if(typeof type === 'function') {
          cb = type;
          type = null;
        }
        var opts = null;
        if(type) opts = { type: type }
        return send('pin/ls', null, opts, null, cb);
      },
    },

    gateway: {
      enable: command('gateway/enable'),
      disable: command('gateway/disable')
    },

    log: {
      tail: function(cb) {
        return send('log/tail', null, {enc: 'text'}, null, true, cb);
      }
    }
  }
}

function randomString() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
