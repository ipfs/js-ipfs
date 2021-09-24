import parseDuration from 'parse-duration'

export default {
  command: 'add <ipfsPath...>',

  describe: 'Pins object to local storage, preventing it from being garbage collected',

  builder: {
    recursive: {
      type: 'boolean',
      alias: 'r',
      default: true,
      describe: 'Recursively pin the object linked to by the specified object(s).'
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      default: 'base58btc'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    },
    metadata: {
      describe: 'Metadata to add to the pin',
      type: 'string',
      alias: 'm',
      /**
       * @param {*} val
       * @returns {Record<string, any> | undefined}
       */
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
      type: 'string',
      coerce: JSON.parse
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {string[]} argv.ipfsPath
   * @param {boolean} argv.recursive
   * @param {string} argv.cidBase
   * @param {number} argv.timeout
   * @param {Record<string, any>} argv.metadata
   * @param {Record<string, any>} argv.metadataJson
   */
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
