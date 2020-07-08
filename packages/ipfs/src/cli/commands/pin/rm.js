'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'rm <ipfsPath...>',

  describe: 'Removes the pinned object from local storage.',

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

  async handler ({ ctx: { ipfs, print }, ipfsPath, recursive, cidBase, timeout }) {
    const results = await ipfs.pin.rm(ipfsPath, { recursive, timeout })
    results.forEach((res) => {
      print(`unpinned ${cidToString(res.cid, { base: cidBase })}`)
    })
  }
}
