'use strict'

const concat = require('it-concat')
const dagPB = require('@ipld/dag-pb')
const { default: parseDuration } = require('parse-duration')
const uint8arrayToString = require('uint8arrays/to-string')
const uint8arrayFromString = require('uint8arrays/from-string')

module.exports = {
  command: 'put [data]',

  describe: 'Stores input as a DAG object, outputs its key',

  builder: {
    'input-enc': {
      type: 'string',
      choices: ['json', 'protobuf'],
      default: 'json'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      type: 'string',
      default: 'base58btc'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.data
   * @param {'json' | 'protobuf'} argv.inputEnc
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print, getStdin }, data, inputEnc, cidBase, timeout }) {
    let buf

    if (data) {
      buf = uint8arrayFromString(data)
    } else {
      buf = (await concat(getStdin(), { type: 'buffer' })).slice()
    }

    let node

    if (inputEnc === 'protobuf') {
      node = dagPB.decode(buf)
    } else {
      node = JSON.parse(uint8arrayToString(buf))
    }

    const base = await ipfs.bases.getBase(cidBase)

    const cid = await ipfs.object.put(node, { timeout })
    print(`added ${cid.toString(base.encoder)}`)
  }
}
