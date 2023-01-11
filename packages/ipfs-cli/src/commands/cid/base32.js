import split from 'it-split'
import { CID } from 'multiformats/cid'
import { base32 } from 'multiformats/bases/base32'
import { toString as uint8arrayToString } from 'uint8arrays/to-string'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string[]} [Argv.cids]
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'base32 [cids...]',

  describe: 'Convert CIDs to base 32 CID version 1',

  async handler ({ ctx: { print, getStdin }, cids }) {
    let input

    if (cids && cids.length) {
      input = cids
    } else {
      input = split(getStdin())
    }

    for await (const data of input) {
      const input = (data instanceof Uint8Array ? uint8arrayToString(data) : data).trim()

      if (!input) {
        continue
      }

      print(CID.parse(input).toV1().toString(base32.encoder))
    }
  }
}

export default command
