'use strict'

const uint8ArrayFromString = require('uint8arrays/from-string')
const { default: parseDuration } = require('parse-duration')
const multibase = require('multibase')

module.exports = {
  command: 'refs-local',

  describe: 'List all local references.',

  epilog: 'CIDs are reconstructed therefore they might differ from those under which the blocks were originally stored.',

  builder: {
    timeout: {
      type: 'string',
      coerce: parseDuration
    },
    multihash: {
      type: 'boolean',
      default: false,
      desc: 'Shows base32 encoded multihashes instead of reconstructed CIDs'
    }
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {boolean} argv.multihash
   * @param {number} argv.timeout
   */
  async handler ({ ctx: { ipfs, print }, timeout, multihash }) {
    for await (const { ref, err } of ipfs.refs.local({
      timeout
    })) {
      if (err) {
        print(err.toString(), true, true)
      } else {
        if (multihash) {
          print(multibase.encoding('base32upper').encode(uint8ArrayFromString(ref)))
        } else {
          print(ref)
        }
      }
    }
  }
}
