'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../../utils/cid')

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  async handler ({ ipfs, print, root, link, cidBase }) {
    const cid = await ipfs.api.object.patch.rmLink(root, { name: link }, {
      enc: 'base58'
    })

    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
