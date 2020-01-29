'use strict'

const { parseArgs } = require('./utils')

module.exports = ({ ipld, preload }) => {
  return async function get (cid, path, options) {
    [cid, path, options] = parseArgs(cid, path, options)

    if (options.preload !== false) {
      preload(cid)
    }

    if (path == null || path === '/') {
      const value = await ipld.get(cid)

      return {
        value,
        remainderPath: ''
      }
    } else {
      let result

      for await (const entry of ipld.resolve(cid, path)) {
        if (options.localResolve) {
          return entry
        }

        result = entry
      }

      return result
    }
  }
}
