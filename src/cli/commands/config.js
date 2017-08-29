'use strict'
const print = require('../utils').print

module.exports = {
  command: 'config <key> [value]',

  description: 'Get and set IPFS config values',

  builder (yargs) {
    return yargs
      .commandDir('config')
      .options({
        bool: {
          type: 'boolean',
          default: false,
          global: false
        },
        json: {
          type: 'boolean',
          default: false,
          global: false
        }
      })
  },

  handler (argv) {
    if (argv._handled) {
      return
    }
    argv._handled = true

    const bool = argv.bool
    const json = argv.json
    const key = argv.key
    let value = argv.value

    if (!value) {
      // Get the value of a given key
      argv.ipfs.config.get(key, (err, value) => {
        if (err) {
          throw new Error('failed to read the config')
        }

        if (typeof value === 'object') {
          print(JSON.stringify(value, null, 2))
        } else {
          print(value)
        }
      })
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

      argv.ipfs.config.set(key, value, (err) => {
        if (err) {
          throw new Error('failed to read the config')
        }
      })
    }
  }
}
