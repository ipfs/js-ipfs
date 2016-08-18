'use strict'

const Wreck = require('wreck')
const Qs = require('qs')
const ndjson = require('ndjson')
const getFilesStream = require('./get-files-stream')

const isNode = require('detect-node')

// -- Internal

function parseChunkedJson (res, cb) {
  const parsed = []
  res
    .pipe(ndjson.parse())
    .on('data', (obj) => {
      parsed.push(obj)
    })
    .on('end', () => {
      cb(null, parsed)
    })
}

function onRes (buffer, cb, uri) {
  return (err, res) => {
    if (err) {
      return cb(err)
    }

    const stream = Boolean(res.headers['x-stream-output'])
    const chunkedObjects = Boolean(res.headers['x-chunked-output'])
    const isJson = res.headers['content-type'] &&
                   res.headers['content-type'].indexOf('application/json') === 0

    if (res.statusCode >= 400 || !res.statusCode) {
      const error = new Error(`Server responded with ${res.statusCode}`)

      return Wreck.read(res, {json: true}, (err, payload) => {
        if (err) {
          return cb(err)
        }
        if (payload) {
          error.code = payload.Code
          error.message = payload.Message || payload.toString()
        }
        cb(error)
      })
    }

    if (stream && !buffer) {
      return cb(null, res)
    }

    if (chunkedObjects) {
      if (isJson) {
        return parseChunkedJson(res, cb)
      }

      return Wreck.read(res, null, cb)
    }

    Wreck.read(res, {json: isJson}, cb)
  }
}

function requestAPI (config, options, callback) {
  options.qs = options.qs || {}

  if (Array.isArray(options.files)) {
    options.qs.recursive = true
  }

  if (Array.isArray(options.path)) {
    options.path = options.path.join('/')
  }
  if (options.args && !Array.isArray(options.args)) {
    options.args = [options.args]
  }
  if (options.args) {
    options.qs.arg = options.args
  }
  if (options.files && !Array.isArray(options.files)) {
    options.files = [options.files]
  }

  if (options.qs.r) {
    options.qs.recursive = options.qs.r
    // From IPFS 0.4.0, it throws an error when both r and recursive are passed
    delete options.qs.r
  }

  options.qs['stream-channels'] = true

  let stream
  if (options.files) {
    stream = getFilesStream(options.files, options.qs)
  }

  // this option is only used internally, not passed to daemon
  delete options.qs.followSymlinks

  const port = config.port ? `:${config.port}` : ''

  const opts = {
    method: 'POST',
    uri: `${config.protocol}://${config.host}${port}${config['api-path']}${options.path}?${Qs.stringify(options.qs, {arrayFormat: 'repeat'})}`,
    headers: {}
  }

  if (isNode) {
    // Browsers do not allow you to modify the user agent
    opts.headers['User-Agent'] = config['user-agent']
  }

  if (options.files) {
    if (!stream.boundary) {
      return callback(new Error('No boundary in multipart stream'))
    }

    opts.headers['Content-Type'] = `multipart/form-data; boundary=${stream.boundary}`
    opts.payload = stream
  }

  return Wreck.request(opts.method, opts.uri, opts, onRes(options.buffer, callback, opts.uri))
}

//
// -- Module Interface

exports = module.exports = function getRequestAPI (config) {
  /*
   * options: {
   *   path:   // API path (like /add or /config) - type: string
   *   args:   // Arguments to the command - type: object
   *   qs:     // Opts as query string opts to the command --something - type: object
   *   files:  // files to be sent - type: string, buffer or array of strings or buffers
   *   buffer: // buffer the request before sending it - type: bool
   * }
   */
  const send = function (options, callback) {
    if (typeof options !== 'object') {
      return callback(new Error('no options were passed'))
    }

    return requestAPI(config, options, callback)
  }

  // Wraps the 'send' function such that an asynchronous
  // transform may be applied to its result before
  // passing it on to either its callback or promise.
  send.withTransform = function (transform) {
    return function (options, callback) {
      if (typeof options !== 'object') {
        return callback(new Error('no options were passed'))
      }

      send(options, wrap(callback))

      function wrap (func) {
        if (func) {
          return function (err, res) {
            transform(err, res, send, func)
          }
        }
      }
    }
  }

  return send
}
