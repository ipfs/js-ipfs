'use strict'

const exporter = require('ipfs-unixfs-exporter')
const log = require('debug')('ipfs:mfs:utils:to-trail')

const toTrail = async (context, path) => {
  log(`Creating trail for path ${path}`)

  const output = []

  for await (const fsEntry of exporter.path(path, context.ipld)) {
    output.push({
      name: fsEntry.name,
      cid: fsEntry.cid,
      size: fsEntry.node.size,
      type: fsEntry.unixfs ? fsEntry.unixfs.type : undefined
    })
  }

  return output
}

module.exports = toTrail
