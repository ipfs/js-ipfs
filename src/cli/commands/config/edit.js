'use strict'

const spawn = require('child_process').spawn
const fs = require('fs')
const temp = require('temp')
const waterfall = require('run-waterfall')
const debug = require('debug')
const log = debug('cli:config')
log.error = debug('cli:config:error')
const utils = require('../../utils')

module.exports = {
  command: 'edit',

  describe: 'Opens the config file for editing in $EDITOR',

  builder: {},

  handler (argv) {
    if (argv._handled) return
    argv._handled = true

    utils.getIPFS((err, ipfs) => {
      if (err) {
        throw err
      }
      const editor = process.env.EDITOR

      if (!editor) {
        throw new Error('ENV variable $EDITOR not set')
      }

      function getConfig (next) {
        ipfs.config.get((err, config) => {
          if (err) {
            log.error(err)
            next(new Error('failed to get the config'))
          }

          next(null, config)
        })
      }

      function saveTempConfig (config, next) {
        temp.open('ipfs-config', (err, info) => {
          if (err) {
            log.error(err)
            next(new Error('failed to open the config'))
          }

          fs.write(info.fd, JSON.stringify(config, null, 2))
          fs.close(info.fd, (err) => {
            if (err) {
              log.error(err)
              next(new Error('failed to open the config'))
            }
          })

          next(null, info.path)
        })
      }

      function openEditor (path, next) {
        const child = spawn(editor, [path], {
          stdio: 'inherit'
        })

        child.on('exit', (err, code) => {
          if (err) {
            throw new Error('error on the editor')
          }

          next(null, path)
        })
      }

      function readTempConfig (path, next) {
        fs.readFile(path, 'utf8', (err, data) => {
          if (err) {
            log.error(err)
            next(new Error('failed to get the updated config'))
          }

          try {
            next(null, JSON.parse(data))
          } catch (err) {
            log.error(err)
            next(new Error(`failed to parse the updated config "${err.message}"`))
          }
        })
      }

      function saveConfig (config, next) {
        config = utils.isDaemonOn()
          ? new Buffer(JSON.stringify(config)) : config

        ipfs.config.replace(config, (err) => {
          if (err) {
            log.error(err)
            next(new Error('failed to save the config'))
          }

          next()
        })
      }

      waterfall([
        getConfig,
        saveTempConfig,
        openEditor,
        readTempConfig,
        saveConfig
      ], (err) => {
        if (err) {
          throw err
        }
      })
    })
  }
}
