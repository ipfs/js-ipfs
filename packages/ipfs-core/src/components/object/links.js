'use strict'

const {
  DAGLink
} = require('ipld-dag-pb')
const CID = require('cids')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

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
        links.push(new DAGLink('', 0, new CID(val)))
        continue
      } catch (_) {
        // not a CID
      }
    }

    if (CID.isCID(val)) {
      links.push(new DAGLink('', 0, val))
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
 * @param {import('ipld')} config.ipld
 */
module.exports = ({ ipld }) => {
  /**
   * @type {import('ipfs-core-types/src/object').API["links"]}
   */
  async function links (multihash, options = {}) {
    const cid = new CID(multihash)
    const result = await ipld.get(cid, options)

    if (cid.codec === 'raw') {
      return []
    }

    if (cid.codec === 'dag-pb') {
      return result.Links
    }

    if (cid.codec === 'dag-cbor') {
      return findLinks(result)
    }

    throw new Error(`Cannot resolve links from codec ${cid.codec}`)
  }

  return withTimeoutOption(links)
}
