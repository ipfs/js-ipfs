'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'config <key> [value]',

  description: 'Get and set IPFS config values.',

  builder: (yargs) => {
    return yargs
      .commandDir('config')
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
        } catch (err) {
          throw new Error('invalid JSON provided')
        }
      }

      await ipfs.config.set(key, value, {
        timeout
      })
    }
  }
}
