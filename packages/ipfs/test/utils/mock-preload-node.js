/* eslint-env browser */
'use strict'

const http = require('http')
const toUri = require('multiaddr-to-uri')
const URL = require('url').URL || self.URL
const errCode = require('err-code')
const HTTP = require('ipfs-utils/src/http')
const waitFor = require('../utils/wait-for')

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
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Request-Method', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, DELETE')
    res.setHeader('Access-Control-Allow-Headers', '*')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

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

  server.start = (opts = {}) => new Promise(resolve => server.listen({ port: defaultPort, ...opts }, resolve))
  server.stop = () => new Promise(resolve => server.close(resolve))

  return server
}

// Get the stored preload CIDs for the server at `addr`
const getPreloadCids = async (addr) => {
  const res = await HTTP.get(`${toUri(addr || defaultAddr)}/cids`)
  return res.json()
}

module.exports.getPreloadCids = getPreloadCids

// Clear the stored preload URLs for the server at `addr`

module.exports.clearPreloadCids = addr => {
  return HTTP.delete(`${toUri(addr || defaultAddr)}/cids`)
}

// Wait for the passed CIDs to appear in the CID list from the preload node
module.exports.waitForCids = async (cids, opts) => {
  opts = opts || {}
  opts.timeout = opts.timeout || 1000

  cids = Array.isArray(cids) ? cids : [cids]
  cids = cids.map(cid => cid.toString()) // Allow passing CID instance

  await waitFor(async () => {
    const preloadCids = await getPreloadCids(opts.addr)

    // See if our cached preloadCids includes all the cids we're looking for.
    const { missing, duplicates } = cids.reduce((results, cid) => {
      const count = preloadCids.filter(preloadedCid => preloadedCid === cid).length
      if (count === 0) {
        results.missing.push(cid)
      } else if (count > 1) {
        results.duplicates.push(cid)
      }
      return results
    }, { missing: [], duplicates: [] })

    if (duplicates.length) {
      throw errCode(new Error(`Multiple occurances of ${duplicates} found`), 'ERR_DUPLICATE')
    }

    return missing.length === 0
  }, {
    name: 'CIDs to be preloaded',
    interval: 5,
    timeout: opts.timeout
  })
}
