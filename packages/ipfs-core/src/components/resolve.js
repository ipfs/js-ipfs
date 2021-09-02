'use strict'

const isIpfs = require('is-ipfs')
const { CID } = require('multiformats/cid')
const PeerID = require('peer-id')
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

    const [, schema, hash, ...rest] = path.split('/') // ['', 'ipfs', 'hash', ...path]
    const base = opts.cidBase ? await bases.getBase(opts.cidBase) : undefined
    const bytes = parseBytes(hash)

    // nothing to resolve return the input
    if (rest.length === 0) {
      const str = base ? base.encoder.encode(bytes) : hash

      return `/${schema}/${str}`
    }

    const cid = CID.decode(bytes)

    path = rest.join('/')

    const results = res(cid, path, codecs, repo, opts)
    let value = cid
    let remainderPath = path

    for await (const result of results) {
      if (CID.asCID(result.value)) {
        value = result.value
        remainderPath = result.remainderPath
      }
    }

    return `/ipfs/${value.toString(base && base.encoder)}${remainderPath ? '/' + remainderPath : ''}`
  }

  return withTimeoutOption(resolve)
}

/**
 * Parse the input as a PeerID or a CID or throw an error
 *
 * @param {string} str
 */
function parseBytes (str) {
  try {
    return PeerID.parse(str).toBytes()
  } catch {
    return CID.parse(str).bytes
  }
}
