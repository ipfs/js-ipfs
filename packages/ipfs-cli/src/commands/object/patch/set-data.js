'use strict'

const fs = require('fs')
const concat = require('it-concat')
const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')
const { coerceCID } = require('../../../utils')

module.exports = {
  command: 'set-data <root> [data]',

  describe: 'Set data field of an ipfs object',

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
   * @param {string} argv.data
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print, getStdin }, root, data, cidBase, timeout }) {
    let buf

    if (data) {
      buf = fs.readFileSync(data)
    } else {
      buf = (await concat(getStdin(), { type: 'buffer' })).slice()
    }

    const cid = await ipfs.object.patch.setData(root, buf, {
      timeout
    })

    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
