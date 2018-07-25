/* eslint-env browser */
'use strict'

const http = require('http')
const toUri = require('multiaddr-to-uri')
const URL = require('url').URL || self.URL

const defaultPort = 1138
const defaultAddr = `/dnsaddr/localhost/tcp/${defaultPort}/http`

module.exports.defaultAddr = defaultAddr

// Create a mock preload IPFS node with a gateway that'll respond 204 to a HEAD
// request. It also remembers the preload URLs it has been called with, and you
// can ask it for them and also clear them by issuing a GET/DELETE request.
module.exports.createNode = () => {
  let urls = []

  const server = http.createServer((req, res) => {
    switch (req.method) {
      case 'HEAD':
        res.statusCode = 204
        urls = urls.concat(req.url)
        break
      case 'DELETE':
        res.statusCode = 204
        urls = []
        break
      case 'GET':
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.write(JSON.stringify(urls))
        break
      default:
        res.statusCode = 500
    }

    res.end()
  })

  server.start = (opts, cb) => {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }
    return server.listen(Object.assign({ port: defaultPort }, opts), cb)
  }

  server.stop = (cb) => server.close(cb)

  return server
}

function parseMultiaddr (addr) {
  let url = toUri(addr)
  url = url.startsWith('http://') ? url : `http://${url}`
  return new URL(url)
}

// Get the stored preload URLs for the server at `addr`
module.exports.getPreloadUrls = (addr, cb) => {
  if (typeof addr === 'function') {
    cb = addr
    addr = defaultAddr
  }

  const { protocol, hostname, port } = parseMultiaddr(addr)

  const req = http.get({ protocol, hostname, port }, (res) => {
    if (res.statusCode !== 200) {
      res.resume()
      return cb(new Error('failed to get preloaded URLs from mock preload node'))
    }

    let data = ''

    res.on('error', cb)
    res.on('data', chunk => { data += chunk })

    res.on('end', () => {
      let obj
      try {
        obj = JSON.parse(data)
      } catch (err) {
        return cb(err)
      }
      cb(null, obj)
    })
  })

  req.on('error', cb)
}

// Clear the stored preload URLs for the server at `addr`
module.exports.clearPreloadUrls = (addr, cb) => {
  if (typeof addr === 'function') {
    cb = addr
    addr = defaultAddr
  }

  const { protocol, hostname, port } = parseMultiaddr(addr)

  const req = http.request({
    method: 'DELETE',
    protocol,
    hostname,
    port
  }, (res) => {
    res.resume()

    if (res.statusCode !== 204) {
      return cb(new Error('failed to reset mock preload node'))
    }

    cb()
  })

  req.on('error', cb)
  req.end()
}
