'use strict'

const promisify = require('promisify-es6')
const isIpfs = require('is-ipfs')
const setImmediate = require('async/setImmediate')
const CID = require('cids')
const { cidToString } = require('../../utils/cid')

module.exports = (self) => {
  return promisify(async (name, opts, cb) => {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }

    opts = opts || {}

    if (!isIpfs.path(name)) {
      return setImmediate(() => cb(new Error('invalid argument ' + name)))
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

    const results = self._ipld.resolve(cid, path)
    let value = cid
    let remainderPath = path
    try {
      for await (const result of results) {
        if (result.remainderPath === '') {
          // Use values from previous iteration if the value isn't a CID
          if (CID.isCID(result.value)) {
            value = result.value
            remainderPath = ''
          }

          if (result.value && CID.isCID(result.value.Hash)) {
            value = result.value.Hash
            remainderPath = ''
          }

          break
        }

        value = result.value
        remainderPath = result.remainderPath
      }
    } catch (error) {
      return cb(error)
    }
    return cb(null, `/ipfs/${cidToString(value, { base: opts.cidBase })}${remainderPath ? '/' + remainderPath : ''}`)
  })
}
