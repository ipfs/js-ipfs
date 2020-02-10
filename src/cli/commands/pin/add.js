'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'add <ipfsPath...>',

  describe: 'Pins object to local storage.',

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
      choices: multibase.names
    }
  },

  async handler ({ ctx, ipfsPath, recursive, cidBase }) {
    const { ipfs, print } = ctx
    const type = recursive ? 'recursive' : 'direct'
    const results = await ipfs.pin.add(ipfsPath, { recursive })
    results.forEach((res) => {
      print(`pinned ${cidToString(res.cid, { base: cidBase })} ${type}ly`)
    })
  }
}
