'use strict'

const concat = require('it-concat')
const fs = require('fs')
const multibase = require('multibase')
const { cidToString } = require('../../../../utils/cid')
const parseDuration = require('parse-duration').default

module.exports = {
  command: 'append-data <root> [data]',

  describe: 'Append data to the data segment of a dag node',

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

    const cid = await ipfs.object.patch.appendData(root, data, {
      enc: 'base58',
      timeout
    })

    print(cidToString(cid, { base: cidBase, upgrade: false }))
  }
}
