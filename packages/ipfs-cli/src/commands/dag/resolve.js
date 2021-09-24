import parseDuration from 'parse-duration'

export default {
  command: 'resolve <ref>',

  describe: 'fetches a dag node from ipfs, prints its address and remaining path',

  builder: {
    ref: {
      type: 'string'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string} argv.ref
   * @param {number} argv.timeout
   */
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

        // @ts-ignore we will toString this so it doesn't matter
        lastCid = ref.split('/').shift()
      }

      print(lastCid.toString())
    } catch (/** @type {any} */ err) {
      return print(`dag get resolve: ${err}`)
    }
  }
}
