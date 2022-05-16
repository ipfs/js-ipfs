import * as dagPB from '@ipld/dag-pb'
import * as dagCBOR from '@ipld/dag-cbor'
import * as dagJSON from '@ipld/dag-json'
import * as raw from 'multiformats/codecs/raw'
import { CID } from 'multiformats/cid'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

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
      } catch (/** @type {any} */ _) {
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
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
 */
export function createLinks ({ repo, codecs }) {
  /**
   * @type {import('ipfs-core-types/src/object').API<{}>["links"]}
   */
  async function links (cid, options = {}) {
    const codec = await codecs.getCodec(cid.code)
    const block = await repo.blocks.get(cid, options)
    const node = codec.decode(block)

    switch (cid.code) {
      case raw.code:
        return []
      case dagPB.code:
        return node.Links
      case dagCBOR.code:
      case dagJSON.code:
        return findLinks(node)
      default:
        throw new Error(`Cannot resolve links from codec ${cid.code}`)
    }
  }

  return withTimeoutOption(links)
}
