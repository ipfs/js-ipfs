'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

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
      choices: multibase.names
    }
  },

  async handler ({ ipfs, print, ipfsPath, recursive, cidBase }) {
    const results = await ipfs.api.pin.rm(ipfsPath, { recursive })
    results.forEach((res) => {
      print(`unpinned ${cidToString(res.cid, { base: cidBase })}`)
    })
  }
}
