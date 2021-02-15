'use strict'

const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')
const {
  stripControlCharacters,
  coerceCID
} = require('../../utils')

module.exports = {
  command: 'links <key>',

  describe: 'Outputs the links pointed to by the specified object',

  builder: {
    key: {
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
   * @param {import('../../types').Context} argv.ctx
   * @param {import('cids')} argv.key
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, key, cidBase, timeout }) {
    const links = await ipfs.object.links(key, { timeout })

    links.forEach((link) => {
      const cidStr = cidToString(link.Hash, { base: cidBase, upgrade: false })
      print(`${cidStr} ${link.Tsize} ${stripControlCharacters(link.Name)}`)
    })
  }
}
