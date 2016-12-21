'use strict'

const Qs = require('qs')
const isNode = require('detect-node')
const ndjson = require('ndjson')
const pump = require('pump')
const once = require('once')
const getFilesStream = require('./get-files-stream')
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
      const outputStream = pump(res, ndjson.parse())
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
  options.qs = options.qs || {}
  callback = once(callback)

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

  const method = 'POST'
  const headers = {}

  if (isNode) {
    // Browsers do not allow you to modify the user agent
    headers['User-Agent'] = config['user-agent']
  }

  if (options.files) {
    if (!stream.boundary) {
      return callback(new Error('No boundary in multipart stream'))
    }

    headers['Content-Type'] = `multipart/form-data; boundary=${stream.boundary}`
  }

  const qs = Qs.stringify(options.qs, {arrayFormat: 'repeat'})
  const req = request(config.protocol)({
    hostname: config.host,
    path: `${config['api-path']}${options.path}?${qs}`,
    port: config.port,
    method: method,
    headers: headers
  }, onRes(options.buffer, callback))

  req.on('error', (err) => {
    callback(err)
  })

  if (options.files) {
    stream.pipe(req)
  } else {
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
