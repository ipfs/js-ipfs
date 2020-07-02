'use strict'

const fs = require('fs')
const concat = require('it-concat')
const multibase = require('multibase')
const { cidToString } = require('../../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'set-data <root> [data]',

  describe: 'Set data field of an ipfs object',

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

  async handler ({ ctx: { ipfs, print, getStdin }, root, data, cidBase, timeout }) {
    if (data) {
      data = fs.readFileSync(data)
    } else {
      data = (await concat(getStdin())).slice()
    }

    const cid = await ipfs.object.patch.setData(root, data, {
      enc: 'base58',
      timeout
    })

    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
