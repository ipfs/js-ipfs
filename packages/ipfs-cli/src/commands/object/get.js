'use strict'

const multibase = require('multibase')
const { cidToString } = require('ipfs-core-utils/src/cid')
const { default: parseDuration } = require('parse-duration')
const uint8ArrayToString = require('uint8arrays/to-string')
const {
  stripControlCharacters,
  coerceCID
} = require('../../utils')

module.exports = {
  command: 'get <key>',

  describe: 'Get and serialize the DAG node named by <key>',

  builder: {
    key: {
      type: 'string',
      coerce: coerceCID
    },
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

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('cids')} argv.key
   * @param {'base64' | 'text' | 'hex'} argv.dataEncoding
   * @param {import('multibase').BaseName} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, key, dataEncoding, cidBase, timeout }) {
    const node = await ipfs.object.get(key, { timeout })

    /** @type {import('multibase').BaseName | 'utf8' | 'utf-8' | 'ascii' | undefined} */
    let encoding

    if (dataEncoding === 'base64') {
      encoding = 'base64pad'
    }

    if (dataEncoding === 'text') {
      encoding = 'ascii'
    }

    if (dataEncoding === 'hex') {
      encoding = 'base16'
    }

    const answer = {
      Data: uint8ArrayToString(node.Data, encoding),
      Hash: cidToString(key, { base: cidBase, upgrade: false }),
      Size: node.size,
      Links: node.Links.map((l) => {
        return {
          Name: stripControlCharacters(l.Name),
          Size: l.Tsize,
          Hash: cidToString(l.Hash, { base: cidBase, upgrade: false })
        }
      })
    }

    print(JSON.stringify(answer))
  }
}
