import { logger } from '@libp2p/logger'
import { addLink } from './add-link.js'
import {
  decode
} from '@ipld/dag-pb'

const log = logger('ipfs:mfs:utils:update-tree')

const defaultOptions = {
  shardSplitThreshold: 1000
}

/**
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('multiformats/cid').Version} CIDVersion
 * @typedef {import('../').MfsContext} MfsContext
 * @typedef {import('./to-trail').MfsTrail} MfsTrail
 */

/**
 * Loop backwards through the trail, replacing links of all components to update CIDs
 *
 * @param {MfsContext} context
 * @param {MfsTrail[]} trail
 * @param {object} options
 * @param {number} options.shardSplitThreshold
 * @param {string} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 */
export async function updateTree (context, trail, options) {
  options = Object.assign({}, defaultOptions, options)

  log('Trail', trail)
  trail = trail.slice().reverse()

  let index = 0
  let child

  for await (const block of context.repo.blocks.getMany(trail.map(node => node.cid))) {
    const node = decode(block)
    const cid = trail[index].cid
    const name = trail[index].name
    index++

    if (!child) {
      child = {
        cid,
        name,
        size: block.length
      }

      continue
    }

    /** @type {{ cid: CID, size: number }} */
    const result = await addLink(context, {
      parent: node,
      name: child.name,
      cid: child.cid,
      // TODO vmx 2021-04-05: check what to do with the size
      size: child.size,
      flush: options.flush,
      shardSplitThreshold: options.shardSplitThreshold,
      hashAlg: options.hashAlg,
      cidVersion: options.cidVersion
    })

    // new child for next loop
    child = {
      cid: result.cid,
      name,
      // TODO vmx 2021-04-05: check what to do with the size
      size: result.size
    }
  }

  // @ts-expect-error - child is possibly undefined
  const { cid } = child
  log(`Final CID ${cid}`)

  return cid
}
