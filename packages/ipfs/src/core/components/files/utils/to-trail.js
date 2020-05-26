'use strict'

const exporter = require('ipfs-unixfs-exporter')
const log = require('debug')('ipfs:mfs:utils:to-trail')

/**
 * @typedef {import('ipfs-interface').IPLDService} IPLD
 * @typedef {import('cids')} CID
 */
/**
 * @typedef {Object} Context
 * @property {IPLD} ipld
 *
 * @typedef {Object} TrailEntry
 * @property {string} name
 * @property {CID} cid
 * @property {number|void} [size]
 * @property {string|void} [type]
 *
 * @typedef {TrailEntry[]} Trail
 *
 * @param {Context} context
 * @param {string} path
 * @returns {Promise<Trail>}
 */
const toTrail = async (context, path) => {
  log(`Creating trail for path ${path}`)

  const output = []

  for await (const fsEntry of exporter.path(path, context.ipld)) {
    output.push({
      name: fsEntry.name,
      cid: fsEntry.cid,
      // @ts-ignore - No guarantee that node has size field.
      size: fsEntry.node.size,
      type: fsEntry.unixfs ? fsEntry.unixfs.type : undefined
    })
  }

  return output
}

module.exports = toTrail
