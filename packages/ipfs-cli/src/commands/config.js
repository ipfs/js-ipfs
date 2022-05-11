import { commands } from './config/index.js'
import parseDuration from 'parse-duration'

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {any} Argv.value
 * @property {boolean} Argv.bool
 * @property {boolean} Argv.json
 * @property {string} Argv.key
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'config <key> [value]',

  describe: 'Get and set IPFS config values',

  builder: (yargs) => {
    commands.forEach(command => {
      yargs.command(command)
    })

    yargs
      .option('bool', {
        boolean: true,
        describe: 'Set a boolean value',
        default: false
      })
      .option('json', {
        boolean: true,
        describe: 'Parse stringified JSON',
        default: false
      })
      .option('timeout', {
        string: true,
        coerce: parseDuration
      })

    return yargs
  },

  async handler ({ ctx: { ipfs, print }, value, bool, json, key, timeout }) {
    if (!value) {
      // Get the value of a given key
      value = await ipfs.config.get(key, {
        timeout
      })

      if (typeof value === 'object') {
        print(JSON.stringify(value, null, 2))
      } else {
        print(value)
      }
    } else {
      // Set the new value of a given key

      if (bool) {
        value = (value === 'true')
      } else if (json) {
        try {
          value = JSON.parse(value)
        } catch (/** @type {any} */ err) {
          throw new Error('invalid JSON provided')
        }
      }

      await ipfs.config.set(key, value, {
        timeout
      })
    }
  }
}

export default command
