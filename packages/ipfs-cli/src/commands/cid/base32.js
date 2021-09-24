import split from 'it-split'
import { CID } from 'multiformats/cid'
import { base32 } from 'multiformats/bases/base32'

export default {
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
