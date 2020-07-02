'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default
const { Buffer } = require('buffer')

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
      choices: Object.keys(multibase.names)
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, dataEncoding, cidBase, timeout }) {
    const node = await ipfs.object.get(key, { enc: 'base58', timeout })
    let data = node.Data || ''

    if (Buffer.isBuffer(data)) {
      data = node.Data.toString(dataEncoding || undefined)
    }

    const answer = {
      Data: data,
      Hash: cidToString(key, { base: cidBase, upgrade: false }),
      Size: node.Size,
      Links: node.Links.map((l) => {
        return {
          Name: l.Name,
          Size: l.Tsize,
          Hash: cidToString(l.Hash, { base: cidBase, upgrade: false })
        }
      })
    }

    print(JSON.stringify(answer))
  }
}
