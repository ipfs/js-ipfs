'use strict'

const multibase = require('multibase')
const { cidToString } = require('../../../utils/cid')
const parseDuration = require('parse-duration').default
const uint8ArrayToString = require('uint8arrays/to-string')

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

    if (dataEncoding === 'base64') {
      dataEncoding = 'base64pad'
    }

    if (dataEncoding === 'text') {
      dataEncoding = 'ascii'
    }

    if (dataEncoding === 'hex') {
      dataEncoding = 'base16'
    }

    if (data instanceof Uint8Array) {
      data = uint8ArrayToString(node.Data, dataEncoding || undefined)
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
