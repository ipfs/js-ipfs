'use strict'

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
    argv.resolve((async () => {
      if (argv._handled) {
        return
      }
      argv._handled = true

      const { bool, json, key, getIpfs } = argv
      const ipfs = await getIpfs()
      let value = argv.value

      if (!value) {
        // Get the value of a given key
        value = await ipfs.config.get(key)

        if (typeof value === 'object') {
          argv.print(JSON.stringify(value, null, 2))
        } else {
          argv.print(value)
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

        await ipfs.config.set(key, value)
      }
    })())
  }
}
