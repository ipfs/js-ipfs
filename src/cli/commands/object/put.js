'use strict'

const bl = require('bl')
const fs = require('fs')
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

  handler (argv) {
    argv.resolve((async () => {
      let data

      if (argv.data) {
        data = fs.readFileSync(argv.data)
      } else {
        data = await new Promise((resolve, reject) => {
          process.stdin.pipe(bl((err, input) => {
            if (err) return reject(err)
            resolve(input)
          }))
        })
      }

      const ipfs = await argv.getIpfs()
      const cid = await ipfs.object.put(data, { enc: argv.inputEnc })
      argv.print(`added ${cidToString(cid, { base: argv.cidBase, upgrade: false })}`)
    })())
  }
}
