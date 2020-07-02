'use strict'

const fs = require('fs')
const concat = require('it-concat')
const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default

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
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print, getStdin }, data, inputEnc, cidBase, timeout }) {
    if (data) {
      data = fs.readFileSync(data)
    } else {
      data = (await concat(getStdin())).slice()
    }

    const cid = await ipfs.object.put(data, { enc: inputEnc, timeout })
    print(`added ${cidToString(cid, { base: cidBase, upgrade: false })}`)
  }
}
