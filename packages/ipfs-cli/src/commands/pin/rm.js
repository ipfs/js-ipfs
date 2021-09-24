import parseDuration from 'parse-duration'

export default {
  command: 'rm <ipfsPath...>',

  describe: 'Unpins the corresponding block making it available for garbage collection',

  builder: {
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively unpin the objects linked to by the specified object(s).'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
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
   * @param {string[]} argv.ipfsPath
   * @param {boolean} argv.recursive
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   */
  async handler ({ ctx, ipfsPath, timeout, recursive, cidBase }) {
    const { ipfs, print } = ctx
    const base = await ipfs.bases.getBase(cidBase)

    for await (const res of ipfs.pin.rmAll(ipfsPath.map(path => ({ path, recursive })), { timeout })) {
      print(`unpinned ${res.toString(base.encoder)}`)
    }
  }
}
