import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import parseDuration from 'parse-duration'
import { base32 } from 'multiformats/bases/base32'

export default {
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
          print(base32.encode(uint8ArrayFromString(ref)).toUpperCase())
        } else {
          print(ref)
        }
      }
    }
  }
}
