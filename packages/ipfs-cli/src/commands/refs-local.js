import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import parseDuration from 'parse-duration'
import { base32 } from 'multiformats/bases/base32'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {boolean} Argv.multihash
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'refs-local',

  describe: 'List all local references. CIDs are reconstructed therefore they might differ from those under which the blocks were originally stored',

  builder: {
    timeout: {
      string: true,
      coerce: parseDuration
    },
    multihash: {
      boolean: true,
      default: false,
      desc: 'Shows base32 encoded multihashes instead of reconstructed CIDs'
    }
  },

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

export default command
