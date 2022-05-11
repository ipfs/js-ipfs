import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string} Argv.ref
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'resolve <ref>',

  describe: 'fetches a dag node from ipfs, prints its address and remaining path',

  builder: {
    ref: {
      string: true
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, ref, timeout }) {
    const options = {
      timeout
    }

    try {
      let {
        cid: lastCid
      } = await ipfs.dag.resolve(ref, options)

      if (!lastCid) {
        if (ref.startsWith('/ipfs/')) {
          ref = ref.substring(6)
        }

        // @ts-expect-error we will toString this so it doesn't matter
        lastCid = ref.split('/').shift()
      }

      print(lastCid.toString())
    } catch (/** @type {any} */ err) {
      return print(`dag get resolve: ${err}`)
    }
  }
}

export default command
