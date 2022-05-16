import parseDuration from 'parse-duration'
import { coerceCID } from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.key
 * @property {number} Argv.numProviders
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'findprovs <key>',

  describe: 'Find peers that can provide a specific value, given a key',

  builder: {
    key: {
      string: true,
      coerce: coerceCID
    },
    'num-providers': {
      alias: 'n',
      describe: 'The number of providers to find. Default: 20',
      default: 20,
      number: true
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, key, numProviders, timeout }) {
    const providers = new Set()

    for await (const event of ipfs.dht.findProvs(key, {
      timeout
    })) {
      if (event.name === 'PROVIDER') {
        event.providers.forEach(peerData => {
          if (providers.has(peerData.id)) {
            return
          }

          providers.add(peerData.id)
          print(peerData.id.toString())
        })

        if (providers.size >= numProviders) {
          break
        }
      }
    }
  }
}

export default command
