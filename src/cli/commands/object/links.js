'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'links <key>',

  describe: 'Outputs the links pointed to by the specified object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  async handler ({ ipfs, print, key, cidBase }) {
    const links = await ipfs.api.object.links(key, { enc: 'base58' })

    links.forEach((link) => {
      const cidStr = cidToString(link.Hash, { base: cidBase, upgrade: false })
      print(`${cidStr} ${link.Tsize} ${link.Name}`)
    })
  }
}
