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

  handler ({ getIpfs, print, ipfsPath, recursive, cidBase, resolve }) {
    resolve((async () => {
      const type = recursive ? 'recursive' : 'direct'
      const ipfs = await getIpfs()
      const results = await ipfs.pin.add(ipfsPath, { recursive })
      results.forEach((res) => {
        print(`pinned ${cidToString(res.hash, { base: cidBase })} ${type}ly`)
      })
    })())
  }
}
