'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, root, link, cidBase, timeout }) {
    const cid = await ipfs.object.patch.rmLink(root, {
      name: link
    }, {
      enc: 'base58',
      timeout
    })

    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
