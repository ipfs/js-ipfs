'use strict'

const moduleConfig = require('../utils/module-config')
const values = require('pull-stream/sources/values')
const deferred = require('pull-defer')
const IsIpfs = require('is-ipfs')
const cleanCID = require('../utils/clean-cid')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return (args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }

    try {
      args = cleanCID(args)
    } catch (err) {
      if (!IsIpfs.ipfsPath(args)) {
        return callback(err)
      }
    }

    const p = deferred.source()

    send({ path: 'ls', args: args, qs: opts }, (err, results) => {
      if (err) {
        return callback(err)
      }

      let result = results.Objects
      if (!result) {
        return callback(new Error('expected .Objects in results'))
      }

      result = result[0]
      if (!result) {
        return callback(new Error('expected one array in results.Objects'))
      }

      result = result.Links
      if (!Array.isArray(result)) {
        return callback(new Error('expected one array in results.Objects[0].Links'))
      }

      result = result.map((link) => ({
        depth: 1,
        name: link.Name,
        path: args + '/' + link.Name,
        size: link.Size,
        hash: link.Hash,
        type: typeOf(link)
      }))

      p.resolve(values(result))
    })

    return p
  }
}

function typeOf (link) {
  switch (link.Type) {
    case 1:
    case 5:
      return 'dir'
    case 2:
      return 'file'
    default:
      return 'unknown'
  }
}
