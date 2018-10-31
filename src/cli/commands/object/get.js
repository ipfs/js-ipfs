'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {
    'data-encoding': {
      type: 'string',
      default: 'base64'
    }
  },

  handler (argv) {
    argv.ipfs.object.get(argv.key, { enc: 'base58' }, (err, node) => {
      if (err) {
        throw err
      }
      const nodeJSON = node.toJSON()

      if (Buffer.isBuffer(node.data)) {
        nodeJSON.data = node.data.toString(argv['data-encoding'] || undefined)
      }

      const answer = {
        Data: nodeJSON.data,
        Hash: nodeJSON.multihash,
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: l.multihash
          }
        })
      }

      print(JSON.stringify(answer))
    })
  }
}
