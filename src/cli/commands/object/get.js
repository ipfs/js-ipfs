'use strict'

const print = require('../../utils').print
const dagPB = require('ipld-dag-pb')

module.exports = {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {
    'data-encoding': {
      type: 'string',
      default: 'base64'
    },
    'cid-base': {
      default: 'base58btc',
      describe: 'CID base to use.'
    }
  },

  handler (argv) {
    argv.ipfs.object.get(argv.key, { enc: 'base58' }, (err, node) => {
      if (err) {
        throw err
      }

      dagPB.util.cid(node, (err, result) => {
        if (err) {
          throw err
        }

        let data = node.data

        if (Buffer.isBuffer(data)) {
          data = node.data.toString(argv.dataEncoding || undefined)
        }

        const answer = {
          Data: data,
          Hash: result.toBaseEncodedString(argv.cidBase),
          Size: node.size,
          Links: node.links.map((l) => {
            return {
              Name: l.name,
              Size: l.size,
              Hash: l.cid.toBaseEncodedString(argv.cidBase)
            }
          })
        }

        print(JSON.stringify(answer))
      })
    })
  }
}
