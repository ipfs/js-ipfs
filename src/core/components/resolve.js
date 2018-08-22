'use strict'

const promisify = require('promisify-es6')
const isIpfs = require('is-ipfs')
const setImmediate = require('async/setImmediate')
const doUntil = require('async/doUntil')
const CID = require('cids')

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
      return setImmediate(() => cb(null, name))
    }

    const path = split.slice(3).join('/')

    resolve(cid, path, (err, cid) => {
      if (err) return cb(err)
      if (!cid) return cb(new Error('found non-link at given path'))
      cb(null, `/ipfs/${cid.toBaseEncodedString(opts.cidBase)}`)
    })
  })

  // Resolve the given CID + path to a CID.
  function resolve (cid, path, callback) {
    let value

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
            path = result.remainderPath
            cb()
          })
        })
      },
      () => {
        const endReached = !path || path === '/'

        if (endReached) {
          return true
        }

        if (value) {
          cid = new CID(value['/'])
        }

        return false
      },
      (err) => {
        if (err) return callback(err)
        if (value && value['/']) return callback(null, new CID(value['/']))
        callback()
      }
    )
  }
}
