'use strict'

const configure = require('../lib/configure')
const multicodec = require('multicodec')
const loadFormat = require('../lib/ipld-formats')

module.exports = configure((api, opts) => {
  const getBlock = require('../block/get')(opts)
  const dagResolve = require('./resolve')(opts)
  const load = loadFormat(opts.ipld)

  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/dag/get')>}
   */
  const get = async (cid, options = {}) => {
    const resolved = await dagResolve(cid, options)
    const block = await getBlock(resolved.cid, options)

    const codecName = multicodec.getName(resolved.cid.code)
    const format = await load(codecName)

    if (resolved.cid.code === multicodec.RAW && !resolved.remainderPath) {
      resolved.remainderPath = '/'
    }

    return format.resolver.resolve(block.data, resolved.remainderPath)
  }

  return get
})
