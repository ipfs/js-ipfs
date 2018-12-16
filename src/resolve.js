'use strict'

const promisify = require('promisify-es6')
const multibase = require('multibase')
const CID = require('cids')

module.exports = (send) => {
  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    opts = opts || {}

    if (opts.cidBase) {
      opts['cid-base'] = opts.cidBase
      delete opts.cidBase
    }

    const transform = (res, callback) => {
      if (!opts['cid-base']) {
        return callback(null, res.Path)
      }

      // FIXME: remove when go-ipfs supports ?cid-base for /api/v0/resolve
      // https://github.com/ipfs/go-ipfs/pull/5777#issuecomment-439838555
      const parts = res.Path.split('/') // ['', 'ipfs', 'QmHash', ...]

      if (multibase.isEncoded(parts[2]) !== opts['cid-base']) {
        try {
          let cid = new CID(parts[2])

          if (cid.version === 0 && opts['cid-base'] !== 'base58btc') {
            cid = cid.toV1()
          }

          parts[2] = cid.toBaseEncodedString(opts['cid-base'])
          res.Path = parts.join('/')
        } catch (err) {
          return callback(err)
        }
      }

      callback(null, res.Path)
    }

    send.andTransform({
      path: 'resolve',
      args: args,
      qs: opts
    }, transform, callback)
  })
}
