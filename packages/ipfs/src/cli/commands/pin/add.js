'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'add <ipfsPath...>',

  describe: 'Pins object to local storage, preventing it from being garbage collected',

  builder: {
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively pin the object linked to by the specified object(s).'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    },
    metadata: {
      describe: 'Metadata to add to the pin',
      type: 'string',
      alias: 'm',
      coerce: (val) => {
        if (!val) {
          return
        }

        const output = {}

        val.split(',').forEach(line => {
          const parts = line.split('=')
          output[parts[0]] = parts[1]
        })

        return output
      }
    },
    'metadata-json': {
      describe: 'Metadata to add to the pin in JSON format',
      type: 'string',
      coerce: JSON.parse
    }
  },

  async handler ({ ctx, ipfsPath, recursive, cidBase, timeout, metadata, metadataJson }) {
    const { ipfs, print } = ctx
    const type = recursive ? 'recursive' : 'direct'

    if (metadataJson) {
      metadata = metadataJson
    }

    for await (const res of ipfs.pin.addAll(ipfsPath.map(path => ({ path, recursive, metadata })), { timeout })) {
      print(`pinned ${cidToString(res.cid, { base: cidBase })} ${type}ly`)
    }
  }
}
