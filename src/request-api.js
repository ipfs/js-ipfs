var http = require('http')
var qs = require('querystring')
var getFilesStream = require('./get-files-stream')
var config = require('./config')

exports = module.exports = requestAPI

function requestAPI (path, args, opts, files, buffer, cb) {
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
    host: config.host,
    port: config.port,
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
    var stream = !!res.headers && !!res.headers['x-stream-output']
    var chunkedObjects = !!res.headers && !!res.headers['x-chunked-output']

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

  req.on('error', function (err) {
    return cb(err, null)
  })

  if (stream) {
    stream.pipe(req)
  } else {
    req.end()
  }

  return req
}
