/* eslint-env browser */
'use strict'

const http = require('http')
const toUri = require('multiaddr-to-uri')
const URL = require('url').URL || self.URL

const defaultPort = 1138
const defaultAddr = `/dnsaddr/localhost/tcp/${defaultPort}`

module.exports.defaultAddr = defaultAddr

// Create a mock preload IPFS node with a gateway that'll respond 200 to a
// request for /api/v0/refs?arg=*. It remembers the preload CIDs it has been
// called with, and you can ask it for them and also clear them by issuing a
// GET/DELETE request to /cids.
module.exports.createNode = () => {
  let cids = []

  const server = http.createServer((req, res) => {
    if (req.url.startsWith('/api/v0/refs')) {
      const arg = new URL(`https://ipfs.io${req.url}`).searchParams.get('arg')
      cids = cids.concat(arg)
    } else if (req.method === 'DELETE' && req.url === '/cids') {
      res.statusCode = 204
      cids = []
    } else if (req.method === 'GET' && req.url === '/cids') {
      res.setHeader('Content-Type', 'application/json')
      res.write(JSON.stringify(cids))
    } else {
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
  if (!(addr.endsWith('http') || addr.endsWith('https'))) {
    addr = addr + '/http'
  }
  return new URL(toUri(addr))
}

// Get the stored preload CIDs for the server at `addr`
const getPreloadCids = (addr, cb) => {
  if (typeof addr === 'function') {
    cb = addr
    addr = defaultAddr
  }

  addr = addr || defaultAddr

  const { protocol, hostname, port } = parseMultiaddr(addr)

  const req = http.get({ protocol, hostname, port, path: '/cids' }, (res) => {
    if (res.statusCode !== 200) {
      res.resume()
      return cb(new Error('failed to get preloaded CIDs from mock preload node'))
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

module.exports.getPreloadCids = getPreloadCids

// Clear the stored preload URLs for the server at `addr`
module.exports.clearPreloadCids = (addr, cb) => {
  if (typeof addr === 'function') {
    cb = addr
    addr = defaultAddr
  }

  addr = addr || defaultAddr

  const { protocol, hostname, port } = parseMultiaddr(addr)

  const req = http.request({
    method: 'DELETE',
    protocol,
    hostname,
    port,
    path: '/cids'
  }, (res) => {
    res.resume()

    if (res.statusCode !== 204) {
      return cb(new Error('failed to clear CIDs from mock preload node'))
    }

    cb()
  })

  req.on('error', cb)
  req.end()
}

// Wait for the passed CIDs to appear in the CID list from the preload node
module.exports.waitForCids = (cids, opts, cb) => {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  opts.timeout = opts.timeout || 1000

  cids = Array.isArray(cids) ? cids : [cids]

  const start = Date.now()

  const checkForCid = () => {
    getPreloadCids(opts.addr, (err, preloadCids) => {
      if (err) return cb(err)

      if (cids.every(cid => preloadCids.includes(cid))) {
        return cb()
      }

      if (Date.now() > start + opts.timeout) {
        return cb(new Error('Timed out waiting for CIDs to be preloaded'))
      }

      setTimeout(checkForCid, 10)
    })
  }

  checkForCid()
}
