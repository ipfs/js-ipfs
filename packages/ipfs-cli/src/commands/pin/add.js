import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {string[]} Argv.ipfsPath
 * @property {boolean} Argv.recursive
 * @property {string} Argv.cidBase
 * @property {number} Argv.timeout
 * @property {Record<string, any>} Argv.metadata
 * @property {Record<string, any>} Argv.metadataJson
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'add <ipfsPath...>',

  describe: 'Pins object to local storage, preventing it from being garbage collected',

  builder: {
    recursive: {
      boolean: true,
      alias: 'r',
      default: true,
      describe: 'Recursively pin the object linked to by the specified object(s).'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in',
      string: true,
      default: 'base58btc'
    },
    timeout: {
      string: true,
      coerce: parseDuration
    },
    metadata: {
      describe: 'Metadata to add to the pin',
      string: true,
      alias: 'm',
      coerce: (val) => {
        if (!val) {
          return
        }

        /** @type {Record<string, any>} */
        const output = {}

        val.split(',').forEach((/** @type {string} */ line) => {
          const parts = line.split('=')
          output[parts[0]] = parts[1]
        })

        return output
      }
    },
    'metadata-json': {
      describe: 'Metadata to add to the pin in JSON format',
      string: true,
      coerce: JSON.parse
    }
  },

  async handler ({ ctx, ipfsPath, recursive, cidBase, timeout, metadata, metadataJson }) {
    const { ipfs, print } = ctx
    const type = recursive ? 'recursive' : 'direct'
    const base = await ipfs.bases.getBase(cidBase)

    if (metadataJson) {
      metadata = metadataJson
    }

    for await (const res of ipfs.pin.addAll(ipfsPath.map(path => ({ path, recursive, metadata })), { timeout })) {
      print(`pinned ${res.toString(base.encoder)} ${type}ly`)
    }
  }
}

export default command
