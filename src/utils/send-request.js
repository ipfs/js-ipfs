'use strict'

const Qs = require('qs')
const qsDefaultEncoder = require('qs/lib/utils').encode
const isNode = require('detect-node')
const ndjson = require('ndjson')
const pump = require('pump')
const once = require('once')
const streamToValue = require('./stream-to-value')
const streamToJsonValue = require('./stream-to-json-value')
const request = require('./request')

// -- Internal

function parseError (res, cb) {
  const error = new Error(`Server responded with ${res.statusCode}`)

  streamToJsonValue(res, (err, payload) => {
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

function onRes (buffer, cb) {
  return (res) => {
    const stream = Boolean(res.headers['x-stream-output'])
    const chunkedObjects = Boolean(res.headers['x-chunked-output'])
    const isJson = res.headers['content-type'] &&
                   res.headers['content-type'].indexOf('application/json') === 0

    if (res.statusCode >= 400 || !res.statusCode) {
      return parseError(res, cb)
    }

    // Return the response stream directly
    if (stream && !buffer) {
      return cb(null, res)
    }

    // Return a stream of JSON objects
    if (chunkedObjects && isJson) {
      const outputStream = ndjson.parse()
      pump(res, outputStream)
      res.on('end', () => {
        let err = res.trailers['x-stream-error']
        if (err) {
          // Not all errors are JSON
          try {
            err = JSON.parse(err)
          } catch (e) {
            err = { Message: err }
          }
          outputStream.emit('error', new Error(err.Message))
        }
      })
      return cb(null, outputStream)
    }

    // Return a JSON object
    if (isJson) {
      return streamToJsonValue(res, cb)
    }

    // Return a value
    return streamToValue(res, cb)
  }
}

function requestAPI (config, options, callback) {
  callback = once(callback)
  options.qs = options.qs || {}

  if (Array.isArray(options.path)) {
    options.path = options.path.join('/')
  }
  if (options.args && !Array.isArray(options.args)) {
    options.args = [options.args]
  }
  if (options.args) {
    options.qs.arg = options.args
  }
  if (options.progress) {
    options.qs.progress = true
  }

  if (options.qs.r) {
    options.qs.recursive = options.qs.r
    // From IPFS 0.4.0, it throws an error when both r and recursive are passed
    delete options.qs.r
  }

  options.qs['stream-channels'] = true

  if (options.stream) {
    options.buffer = false
  }

  // this option is only used internally, not passed to daemon
  delete options.qs.followSymlinks

  const method = 'POST'
  const headers = {}

  if (isNode) {
    // Browsers do not allow you to modify the user agent
    headers['User-Agent'] = config['user-agent']
  }

  if (options.multipart) {
    if (!options.multipartBoundary) {
      return callback(new Error('No multipartBoundary'))
    }

    headers['Content-Type'] = `multipart/form-data; boundary=${options.multipartBoundary}`
  }

  const qs = Qs.stringify(options.qs, {
    arrayFormat: 'repeat',
    encoder: data => {
      // TODO: future releases of qs will provide the default
      // encoder as a 2nd argument to this function; it will
      // no longer be necessary to import qsDefaultEncoder
      if (Buffer.isBuffer(data)) {
        let uriEncoded = ''
        for (const byte of data) {
          // https://tools.ietf.org/html/rfc3986#page-14
          // ALPHA (%41-%5A and %61-%7A), DIGIT (%30-%39), hyphen (%2D), period (%2E), underscore (%5F), or tilde (%7E)
          if (
            (byte >= 0x41 && byte <= 0x5A) ||
            (byte >= 0x61 && byte <= 0x7A) ||
            (byte >= 0x30 && byte <= 0x39) ||
            (byte === 0x2D) ||
            (byte === 0x2E) ||
            (byte === 0x5F) ||
            (byte === 0x7E)
          ) {
            uriEncoded += String.fromCharCode(byte)
          } else {
            const hex = byte.toString(16)
            // String.prototype.padStart() not widely supported yet
            const padded = hex.length === 1 ? `0${hex}` : hex
            uriEncoded += `%${padded}`
          }
        }
        return uriEncoded
      }
      return qsDefaultEncoder(data)
    }
  })
  const reqOptions = {
    hostname: config.host,
    path: `${config['api-path']}${options.path}?${qs}`,
    port: config.port,
    method: method,
    headers: headers,
    protocol: `${config.protocol}:`
  }
  const req = request(config.protocol)(reqOptions, onRes(options.buffer, callback))

  req.on('error', (err) => {
    callback(err)
  })

  if (!options.stream) {
    req.end()
  }

  return req
}

//
// -- Module Interface

exports = module.exports = (config) => {
  /*
   * options: {
   *   path:   // API path (like /add or /config) - type: string
   *   args:   // Arguments to the command - type: object
   *   qs:     // Opts as query string opts to the command --something - type: object
   *   files:  // files to be sent - type: string, buffer or array of strings or buffers
   *   buffer: // buffer the request before sending it - type: bool
   * }
   */
  const send = (options, callback) => {
    if (typeof options !== 'object') {
      return callback(new Error('no options were passed'))
    }

    return requestAPI(config, options, callback)
  }

  // Send a HTTP request and pass via a transform function
  // to convert the response data to wanted format before
  // returning it to the callback.
  // Eg. send.andTransform({}, (e) => JSON.parse(e), (err, res) => ...)
  send.andTransform = (options, transform, callback) => {
    return send(options, (err, res) => {
      if (err) {
        return callback(err)
      }
      transform(res, callback)
    })
  }

  return send
}
