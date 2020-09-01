'use strict'

const addAll = require('./add-all')
const last = require('it-last')
const configure = require('./lib/configure')

module.exports = (options) => {
  const all = addAll(options)

  return configure(() => {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @type {import('../../ipfs/src/core/components/add').Add<import('.').HttpOptions>}
     */
    async function add (input, options = {}) { // eslint-disable-line require-await
      // @ts-ignore
      return last(all(input, options))
    }
    return add
  })(options)
}
