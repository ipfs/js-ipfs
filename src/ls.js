'use strict'

const promisify = require('promisify-es6')
const moduleConfig = require('./utils/module-config')

module.exports = (arg) => {
  const send = moduleConfig(arg)

  return promisify((args, opts, callback) => {
    if (typeof (opts) === 'function') {
      callback = opts
      opts = {}
    }
    send({
      path: 'ls',
      args: args,
      qs: opts
    }, (err, results) => {
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
        name: link.Name,
        path: args + '/' + link.Name,
        size: link.Size,
        hash: link.Hash,
        type: typeOf(link),
        depth: link.Depth || 1
      }))

      callback(null, result)
    })
  })
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
