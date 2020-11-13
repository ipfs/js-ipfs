'use strict'

const addAll = require('./add-all')
const last = require('it-last')
const configure = require('./lib/configure')

/**
 * @param {import("./lib/core").ClientOptions} options
 */
module.exports = (options) => {
  const all = addAll(options)
  return configure(() => {
    /**
     * @type {import('.').Implements<typeof import('ipfs-core/src/components/add')>}
     */
    async function add (input, options = {}) {
      // @ts-ignore - last may return undefind if source is empty
      return await last(all(input, options))
    }
    return add
  })(options)
}
