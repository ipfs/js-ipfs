'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {},

  handler (argv) {
    argv.ipfs.object.get(argv.key, {enc: 'base58'}, (err, node) => {
      if (err) {
        throw err
      }
      const nodeJSON = node.toJSON()

      nodeJSON.data = nodeJSON.data ? nodeJSON.data.toString() : ''

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
