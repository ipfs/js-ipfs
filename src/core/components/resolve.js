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

    // TODO remove this and update subsequent code when IPNS is implemented
    if (!isIpfs.ipfsPath(name)) {
      return setImmediate(() => cb(new Error('resolve non-IPFS names is not implemented')))
    }

    const split = name.split('/') // ['', 'ipfs', 'hash', ...path]
    const cid = new CID(split[2])

    if (split.length === 3) {
      return setImmediate(() => cb(null, `/ipfs/${cidToString(cid, { base: opts.cidBase })}`))
    }

    const path = split.slice(3).join('/')

    resolve(cid, path, (err, res) => {
      if (err) return cb(err)
      const { cid, remainderPath } = res
      cb(null, `/ipfs/${cidToString(cid, { base: opts.cidBase })}${remainderPath ? '/' + remainderPath : ''}`)
    })
  })

  // Resolve the given CID + path to a CID.
  function resolve (cid, path, callback) {
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
        callback(null, { cid, remainderPath: path })
      }
    )
  }
}
