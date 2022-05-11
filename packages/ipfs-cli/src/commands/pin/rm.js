import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string[]} Argv.ipfsPath
 * @property {boolean} Argv.recursive
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'rm <ipfsPath...>',

  describe: 'Unpins the corresponding block making it available for garbage collection',

  builder: {
    recursive: {
      boolean: true,
      alias: 'r',
      default: true,
      describe: 'Recursively unpin the objects linked to by the specified object(s).'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx, ipfsPath, timeout, recursive, cidBase }) {
    const { ipfs, print } = ctx
    const base = await ipfs.bases.getBase(cidBase)

    for await (const res of ipfs.pin.rmAll(ipfsPath.map(path => ({ path, recursive })), { timeout })) {
      print(`unpinned ${res.toString(base.encoder)}`)
    }
  }
}

export default command
