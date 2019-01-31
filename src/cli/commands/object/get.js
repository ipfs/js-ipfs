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
      describe: 'Number base to display CIDs in. Note: specifying a CID base for v0 CIDs will have no effect.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler ({ getIpfs, key, dataEncoding, cidBase, resolve }) {
    resolve((async () => {
      const ipfs = await getIpfs()
      const node = await ipfs.object.get(key, { enc: 'base58' })
      let data = node.data

      if (Buffer.isBuffer(data)) {
        data = node.data.toString(dataEncoding || undefined)
      }

      const answer = {
        Data: data,
        Hash: cidToString(key, { base: cidBase, upgrade: false }),
        Size: node.size,
        Links: node.links.map((l) => {
          return {
            Name: l.name,
            Size: l.size,
            Hash: cidToString(l.cid, { base: cidBase, upgrade: false })
          }
        })
      }

      print(JSON.stringify(answer))
    })())
  }
}
