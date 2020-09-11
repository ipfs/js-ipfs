'use strict'

const log = require('debug')('ipfs:mfs:utils:update-tree')
const addLink = require('./add-link')

const defaultOptions = {
  shardSplitThreshold: 1000
}

// loop backwards through the trail, replacing links of all components to update CIDs
const updateTree = async (context, trail, options) => {
  options = Object.assign({}, defaultOptions, options)

  log('Trail', trail)
  trail = trail.slice().reverse()

  let index = 0
  let child

  for await (const node of context.ipld.getMany(trail.map(node => node.cid))) {
    const cid = trail[index].cid
    const name = trail[index].name
    index++

    if (!child) {
      child = {
        cid,
        name,
        size: node.size
      }

      continue
    }

    const result = await addLink(context, {
      parent: node,
      name: child.name,
      cid: child.cid,
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
      size: result.size
    }
  }

  // @ts-ignore - child is possibly undefined
  const { cid } = child
  log(`Final CID ${cid}`)

  return cid
}

module.exports = updateTree
