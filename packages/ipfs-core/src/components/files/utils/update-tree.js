'use strict'

const log = require('debug')('ipfs:mfs:utils:update-tree')
const addLink = require('./add-link')
const {
  decode
// @ts-ignore - TODO vmx 2021-03-31
} = require('@ipld/dag-pb')

const defaultOptions = {
  shardSplitThreshold: 1000
}

/**
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('multiformats/cid').CID} CID
 * @typedef {import('cids').CIDVersion} CIDVersion
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
 * @param {HashName} options.hashAlg
 * @param {CIDVersion} options.cidVersion
 * @param {boolean} options.flush
 */
const updateTree = async (context, trail, options) => {
  options = Object.assign({}, defaultOptions, options)

  log('Trail', trail)
  trail = trail.slice().reverse()

  let index = 0
  let child

  for await (const block of context.blockStorage.getMany(trail.map(node => node.cid))) {
    const node = decode(block.bytes)
    const cid = trail[index].cid
    const name = trail[index].name
    index++

    if (!child) {
      child = {
        cid,
        name,
        // TODO vmx 2021-03-04: Check if the size should be 0 or the actual size
        size: block.bytes.length
        // size: 0
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

  // @ts-ignore - child is possibly undefined
  const { cid } = child
  log(`Final CID ${cid}`)

  return cid
}

module.exports = updateTree
