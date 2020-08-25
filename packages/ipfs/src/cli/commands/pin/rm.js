'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'rm <ipfsPath...>',

  describe: 'Unpins the corresponding block making it available for garbage collection',

  builder: {
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively unpin the objects linked to by the specified object(s).'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx, ipfsPath, timeout, recursive, cidBase }) {
    const { ipfs, print } = ctx

    for await (const res of ipfs.pin.rmAll(ipfsPath.map(path => ({ path, recursive })), { timeout })) {
      print(`unpinned ${cidToString(res.cid, { base: cidBase })}`)
    }
  }
}
