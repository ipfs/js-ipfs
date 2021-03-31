'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const { cidToString } = require('ipfs-core-utils/src/cid')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('ipfs-core-types/src/name').API} config.name - An IPFS core interface name API
 */
module.exports = ({ ipld, name }) => {
  /**
   * @type {import('ipfs-core-types/src/root').API["resolve"]}
   */
  async function resolve (path, opts = {}) {
    if (!isIpfs.path(path)) {
      throw new Error('invalid argument ' + path)
    }

    if (isIpfs.ipnsPath(path)) {
      if (!name) {
        throw new Error('failed to resolve IPNS path: name API unavailable')
      }

      for await (const resolvedPath of name.resolve(path, opts)) {
        path = resolvedPath
      }
    }

    const [, , hash, ...rest] = path.split('/') // ['', 'ipfs', 'hash', ...path]
    const cid = new CID(hash)

    // nothing to resolve return the input
    if (rest.length === 0) {
      return `/ipfs/${cidToString(cid, { base: opts.cidBase })}`
    }

    path = rest.join('/')

    const results = ipld.resolve(cid, path)
    let value = cid
    let remainderPath = path

    for await (const result of results) {
      if (CID.isCID(result.value)) {
        value = result.value
        remainderPath = result.remainderPath
      }
    }

    return `/ipfs/${cidToString(value, { base: opts.cidBase })}${remainderPath ? '/' + remainderPath : ''}`
  }

  return withTimeoutOption(resolve)
}
