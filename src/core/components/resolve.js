'use strict'

const promisify = require('promisify-es6')
const isIpfs = require('is-ipfs')
const setImmediate = require('async/setImmediate')
const doUntil = require('async/doUntil')
const CID = require('cids')
const { cidToString } = require('../../utils/cid')

module.exports = (self) => {
  return promisify((name, opts, cb) => {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }

    opts = opts || {}

    if (!isIpfs.path(name)) {
      return setImmediate(() => cb(new Error('invalid argument')))
    }

    const split = name.split('/') // ['', 'ipfs', 'hash or domain', ...path]
    const hashOrDomain = split[2]
    const path = split.slice(3).join('/')

    if (isIpfs.cid(hashOrDomain)) {
      return resolveCID(hashOrDomain, path, opts, cb)
    }

    // if its not a cid then its probably a domain name to resolve
    return resolveDomain(hashOrDomain, path, opts, cb)
  })

  // Resolve the given CID + path to a CID (recursive).
  function resolveCID (hash, path, opts, callback) {
    let cid = new CID(hash)
    let value, remainderPath
    doUntil(
      (cb) => {
        self.block.get(cid, (err, block) => {
          if (err) return cb(err)

          const r = self._ipld.resolvers[cid.codec]

          if (!r) {
            return cb(new Error(`No resolver found for codec "${cid.codec}"`))
          }

          r.resolver.resolve(block.data, path, (err, result) => {
            if (err) return cb(err)
            value = result.value
            remainderPath = result.remainderPath
            cb()
          })
        })
      },
      () => {
        if (value && value['/']) {
          // If we've hit a CID, replace the current CID.
          cid = new CID(value['/'])
          path = remainderPath
        } else if (CID.isCID(value)) {
          // If we've hit a CID, replace the current CID.
          cid = value
          path = remainderPath
        } else {
          // We've hit a value. Return the current CID and the remaining path.
          return true
        }

        // Continue resolving unless the path is empty.
        return !path || path === '/'
      },
      (err) => {
        if (err) return callback(err)
        callback(null, `/ipfs/${cidToString(cid, { base: opts.cidBase })}${remainderPath ? '/' + remainderPath : ''}`)
      }
    )
  }

  function resolveDomain (domain, path, opts, callback) {
    const recursive = opts.recursive && opts.recursive.toString() === 'true'
    return self.dns(domain, (err, result) => {
      if (err) return callback(err)
      const hash = result.split('/')[2]
      const remainderPath = path
      if (recursive) {
        return resolveCID(hash, remainderPath, opts, callback)
      }
      callback(null, `/ipfs/${cidToString(hash, { base: opts.cidBase })}${remainderPath ? '/' + remainderPath : ''}`)
    })
  }
}
