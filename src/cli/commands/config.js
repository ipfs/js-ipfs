'use strict'

const debug = require('debug')
const get = require('lodash.get')
const set = require('lodash.set')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const utils = require('../utils')

module.exports = {
  command: 'config <key> [value]',

  description: 'Get and set IPFS config values',

  builder (yargs) {
    return yargs
      .commandDir('config')
      .options({
        bool: {
          type: 'boolean',
          default: false
        },
        json: {
          type: 'boolean',
          default: false
        }
      })
  },

  handler (argv) {
    if (argv._handled) return
    argv._handled = true

    const bool = argv.bool
    const json = argv.json
    const key = argv.key
    let value = argv.value

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }

      if (!value) {
        // Get the value of a given key

        if (utils.isDaemonOn()) {
          return ipfs.config.get(key, (err, config) => {
            if (err) {
              log.error(err)
              throw new Error('failed to read the config')
            }

            console.log(config)
          })
        }

        ipfs.config.show((err, config) => {
          if (err) {
            log.error(err)
            throw new Error('failed to read the config')
          }

          const value = get(config, key)
          console.log(value)
        })
      } else {
        // Set the new value of a given key

        if (bool) {
          value = (value === 'true')
        } else if (json) {
          try {
            value = JSON.parse(value)
          } catch (err) {
            log.error(err)
            throw new Error('invalid JSON provided')
          }
        }

        if (utils.isDaemonOn()) {
          return ipfs.config.set(key, value, (err) => {
            if (err) {
              log.error(err)
              throw new Error('failed to save the config')
            }
          })
        }

        ipfs.config.show((err, originalConfig) => {
          if (err) {
            log.error(err)
            throw new Error('failed to read the config')
          }

          const updatedConfig = set(originalConfig, key, value)
          ipfs.config.replace(updatedConfig, (err) => {
            if (err) {
              log.error(err)
              throw new Error('failed to save the config')
            }
          })
        })
      }
    })
  }
}
