'use strict'

const { walkPath } = require('ipfs-unixfs-exporter')
const log = require('debug')('ipfs:mfs:utils:to-trail')

/**
 * @typedef {import('../').MfsContext} MfsContext
 * @typedef {object} MfsTrail
 * @property {string} name
 * @property {import('cids')} cid
 * @property {number} [size]
 * @property {string} [type]
 *
 * TODO: export supported types from unixfs-exporter and use for `type` above
 */

/**
 * @param {MfsContext} context
 * @param {string} path
 * @returns {Promise<MfsTrail[]>}
 */
const toTrail = async (context, path) => {
  log(`Creating trail for path ${path}`)

  const output = []

  for await (const fsEntry of walkPath(path, context.ipld)) {
    let size

    // TODO: include `.size` property in unixfs-exporter output
    if (fsEntry.node instanceof Uint8Array) {
      size = fsEntry.node.length
    } else {
      size = fsEntry.node.size
    }

    output.push({
      name: fsEntry.name,
      cid: fsEntry.cid,
      size,
      type: fsEntry.type
    })
  }

  return output
}

module.exports = toTrail
