import { commands } from './config/index.js'
import parseDuration from 'parse-duration'

export default {
  command: 'config <key> [value]',

  description: 'Get and set IPFS config values.',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder: (yargs) => {
    return yargs
      // @ts-expect-error types are wrong
      .command(commands)
      .option('bool', {
        type: 'boolean',
        describe: 'Set a boolean value.',
        default: false
      })
      .option('json', {
        type: 'boolean',
        describe: 'Parse stringified JSON.',
        default: false
      })
      .option('timeout', {
        type: 'string',
        coerce: parseDuration
      })
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {any} argv.value
   * @param {boolean} argv.bool
   * @param {boolean} argv.json
   * @param {string} argv.key
   * @param {number} argv.timeout
   */
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
