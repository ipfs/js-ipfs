'use strict'

const multibase = require('multibase')
const { print } = require('../../utils')
const { cidToString } = require('../../../utils/cid')

module.exports = {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {
    'data-encoding': {
      type: 'string',
      default: 'base64'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler ({ ipfs, key, dataEncoding, cidBase }) {
    ipfs.object.get(key, {enc: 'base58'}, (err, node) => {
      if (err) {
        throw err
      }
      const nodeJSON = node.toJSON()

      if (Buffer.isBuffer(node.data)) {
        nodeJSON.data = node.data.toString(dataEncoding)
      }

      const answer = {
        Data: nodeJSON.data,
        Hash: cidToString(node.multihash, cidBase),
        Size: nodeJSON.size,
        Links: nodeJSON.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.multihash, cidBase)
          }
        })
      }

      print(JSON.stringify(answer))
    })
  }
}
