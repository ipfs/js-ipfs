'use strict'

const isIpfs = require('is-ipfs')
const { CID } = require('multiformats/cid')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const { resolve: res } = require('../utils')

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 * @param {import('ipfs-core-utils/src/multibases')} config.bases
 * @param {import('ipfs-core-types/src/name').API} config.name
 */
module.exports = ({ repo, codecs, bases, name }) => {
  /**
   * @type {import('ipfs-core-types/src/root').API["resolve"]}
   */
  async function resolve (path, opts = {}) {
    if (!isIpfs.path(path)) {
      throw new Error('invalid argument ' + path)
    }

    if (isIpfs.ipnsPath(path)) {
      for await (const resolvedPath of name.resolve(path, opts)) {
        path = resolvedPath
      }
    }

    const [, , hash, ...rest] = path.split('/') // ['', 'ipfs', 'hash', ...path]
    const cid = CID.parse(hash)
    const base = opts.cidBase ? await bases.getBase(opts.cidBase) : undefined

    // nothing to resolve return the input
    if (rest.length === 0) {
      return `/ipfs/${cid.toString(base && base.encoder)}`
    }

    path = rest.join('/')

    const results = res(cid, path, codecs, repo, opts)
    let value = cid
    let remainderPath = path

    for await (const result of results) {
      if (result.value instanceof CID) {
        value = result.value
        remainderPath = result.remainderPath
      }
    }

    return `/ipfs/${value.toString(base && base.encoder)}${remainderPath ? '/' + remainderPath : ''}`
  }

  return withTimeoutOption(resolve)
}
