'use strict'

const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')
const { coerceCID } = require('../../../utils')

module.exports = {
  command: 'rm-link <root> <link>',

  describe: 'Remove a link from an object',

  builder: {
    root: {
      type: 'string',
      coerce: coerceCID
    },
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

  /**
   * @param {object} argv
   * @param {import('../../../types').Context} argv.ctx
   * @param {import('cids')} argv.root
   * @param {string} argv.link
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, root, link, cidBase, timeout }) {
    const cid = await ipfs.object.patch.rmLink(root, link, {
      timeout
    })

    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
