'use strict'

const fs = require('fs')
const concat = require('it-concat')
const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'put [data]',

  describe: 'Stores input as a DAG object, outputs its key',

  builder: {
    'input-enc': {
      type: 'string',
      default: 'json'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  async handler (argv) {
    const { ipfs, print, getStdin } = argv.ctx
    let data

    if (argv.data) {
      data = fs.readFileSync(argv.data)
    } else {
      data = (await concat(getStdin())).slice()
    }

    const cid = await ipfs.object.put(data, { enc: argv.inputEnc })
    print(`added ${cidToString(cid, { base: argv.cidBase, upgrade: false })}`)
  }
}
