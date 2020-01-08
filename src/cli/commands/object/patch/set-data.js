'use strict'

const fs = require('fs')
const concat = require('it-concat')
const multibase = require('multibase')
const { cidToString } = require('../../../../utils/cid')

module.exports = {
  command: 'set-data <root> [data]',

  describe: 'Set data field of an ipfs object',

  builder: {
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  async handler (argv) {
    let data

    if (argv.data) {
      data = fs.readFileSync(argv.data)
    } else {
      data = await concat(process.stdin)
    }

    const cid = await argv.ipfs.api.object.patch.setData(argv.root, data, {
      enc: 'base58'
    })

    argv.print(cidToString(cid, { base: argv.cidBase, upgrade: false }))
  }
}
