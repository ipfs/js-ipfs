'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

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
      choices: multibase.names
    },
    comments: {
      describe: 'A comment to add to the pin',
      type: 'string',
      alias: 'c'
    }
  },

  async handler ({ ctx, ipfsPath, recursive, cidBase, comments }) {
    const { ipfs, print } = ctx
    const type = recursive ? 'recursive' : 'direct'

    for await (const res of ipfs.pin.add(ipfsPath.map(path => ({ path, recursive, comments })))) {
      print(`pinned ${cidToString(res.cid, { base: cidBase })} ${type}ly`)
    }
  }
}
