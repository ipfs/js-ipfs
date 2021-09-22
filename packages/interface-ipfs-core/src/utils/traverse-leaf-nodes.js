/**
 * @typedef {import('@ipld/dag-pb').PBNode} PBNode
 * @typedef {import('multiformats/cid').CID} CID
 */

/**
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {CID} cid
 */
export async function * traverseLeafNodes (ipfs, cid) {
  /**
   * @param {import('multiformats/cid').CID} cid
   * @returns {AsyncIterable<{ node: PBNode, cid: CID }>}
   */
  async function * traverse (cid) {
    const { value: node } = await ipfs.dag.get(cid)

    if (node instanceof Uint8Array || !node.Links.length) {
      yield {
        node,
        cid
      }

      return
    }

    for (const link of node.Links) {
      yield * traverse(link.Hash)
    }
  }

  yield * traverse(cid)
}
