'use strict'

const dagPb = require('@ipld/dag-pb')
const dagCbor = require('@ipld/dag-cbor')
const raw = require('multiformats/codecs/raw')
const { CID } = require('multiformats/cid')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('@ipld/dag-pb').PBLink} DAGLink
 */

/**
 * @param {any} node
 * @param {DAGLink[]} [links]
 * @returns {DAGLink[]}
 */
function findLinks (node, links = []) {
  for (const key in node) {
    const val = node[key]

    if (key === '/' && Object.keys(node).length === 1) {
      try {
        links.push({
          Name: '',
          Tsize: 0,
          Hash: CID.parse(val)
        })
        continue
      } catch (_) {
        // not a CID
      }
    }

    const cid = CID.asCID(val)

    if (cid) {
      links.push({
        Name: '',
        Tsize: 0,
        Hash: cid
      })
      continue
    }

    if (Array.isArray(val)) {
      findLinks(val, links)
    }

    if (val && typeof val === 'object') {
      findLinks(val, links)
    }
  }

  return links
}

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 */
module.exports = ({ repo, codecs }) => {
  /**
   * @type {import('ipfs-core-types/src/object').API["links"]}
   */
  async function links (cid, options = {}) {
    const codec = await codecs.getCodec(cid.code)
    const block = await repo.blocks.get(cid, options)
    const node = codec.decode(block)

    if (cid.code === raw.code) {
      return []
    }

    if (cid.code === dagPb.code) {
      return node.Links
    }

    if (cid.code === dagCbor.code) {
      return findLinks(node)
    }

    throw new Error(`Cannot resolve links from codec ${cid.code}`)
  }

  return withTimeoutOption(links)
}
