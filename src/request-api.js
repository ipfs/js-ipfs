'use strict'

const Wreck = require('wreck')
const Qs = require('qs')
const getFilesStream = require('./get-files-stream')

const isNode = !global.window

// -- Internal

function onEnd (buffer, cb) {
  return (err, res) => {
    if (err) {
      return cb(err)
    }

    const stream = !!res.headers['x-stream-output']
    const chunkedObjects = !!res.headers['x-chunked-output']

    if (res.statusCode >= 400 || !res.statusCode) {
      var error = new Error(`Server responded with ${res.statusCode}`)

      Wreck.read(res, {json: true}, (err, payload) => {
        if (err) {
          error.code = payload.Code
          error.message = payload.Message
        }
        cb(error)
      })
    }

    if (stream && !buffer) return cb(null, res)

    if (chunkedObjects) {
      const parsed = []
      res.on('data', chunk => parsed.push(JSON.parse(chunk)))
      res.on('end', () => cb(null, parsed))
      return
    }

    Wreck.read(res, null, (err, payload) => {
      if (err) return cb(err)

      let parsed

      try {
        parsed = JSON.parse(payload.toString())
      } catch (err2) {
        parsed = payload.toString()
      }

      cb(null, parsed)
    })
  }
}

function requestAPI (config, path, args, qs, files, buffer, cb) {
  qs = qs || {}
  if (Array.isArray(path)) path = path.join('/')
  if (args && !Array.isArray(args)) args = [args]
  if (args) qs.arg = args
  if (files && !Array.isArray(files)) files = [files]

  if (typeof buffer === 'function') {
    cb = buffer
    buffer = false
  }

  if (qs.r) {
    qs.recursive = qs.r
    delete qs.r // From IPFS 0.4.0, it throw an error when both r and recursive are passed
  }

  if (!isNode && qs.recursive && path === 'add') {
    return cb(new Error('Recursive uploads are not supported in the browser'))
  }

  qs['stream-channels'] = true

  let stream
  if (files) {
    stream = getFilesStream(files, qs)
  }

  // this option is only used internally, not passed to daemon
  delete qs.followSymlinks

  const opts = {
    method: files ? 'POST' : 'GET',
    uri: `http://${config.host}:${config.port}${config['api-path']}${path}?${Qs.stringify(qs, {arrayFormat: 'repeat'})}`,
    headers: {}
  }

  if (isNode) {
    // Browsers do not allow you to modify the user agent
    opts.headers['User-Agent'] = config['user-agent']
  }

  if (files) {
    if (!stream.boundary) {
      return cb(new Error('No boundary in multipart stream'))
    }

    opts.headers['Content-Type'] = `multipart/form-data; boundary=${stream.boundary}`
    opts.downstreamRes = stream
    opts.payload = stream
  }

  Wreck.request(opts.method, opts.uri, opts, onEnd(buffer, cb))
}

// -- Interface

exports = module.exports = function getRequestAPI (config) {
  return requestAPI.bind(null, config)
}
