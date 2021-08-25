'use strict'

const split = require('it-split')
const { CID } = require('multiformats/cid')
const { base32 } = require('multiformats/bases/base32')

module.exports = {
  command: 'base32 [cids...]',

  describe: 'Convert CIDs to base 32 CID version 1.',

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string[]} [argv.cids]
   */
  async handler ({ ctx: { print, getStdin }, cids }) {
    let input

    if (cids && cids.length) {
      input = cids
    } else {
      input = split(getStdin())
    }

    for await (const data of input) {
      const input = data.toString().trim()

      if (!input) {
        continue
      }

      print(CID.parse(input).toV1().toString(base32.encoder))
    }
  }
}
