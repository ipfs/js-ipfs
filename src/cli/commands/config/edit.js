'use strict'

const spawn = require('child_process').spawn
const fs = require('fs')
const temp = require('temp')
const promisify = require('promisify-es6')
const utils = require('../../utils')

module.exports = {
  command: 'edit',

  describe: 'Opens the config file for editing in $EDITOR',

  builder: {},

  handler (argv) {
    argv.resolve((async () => {
      if (argv._handled) return
      argv._handled = true

      const editor = process.env.EDITOR

      if (!editor) {
        throw new Error('ENV variable $EDITOR not set')
      }

      const ipfs = await argv.getIpfs()

      async function getConfig () {
        try {
          await ipfs.config.get()
        } catch (err) {
          throw new Error('failed to get the config')
        }
      }

      async function saveTempConfig (config) {
        const path = temp.path({ prefix: 'ipfs-config' })

        try {
          await promisify(fs.writeFile)(JSON.stringify(config, null, 2))
        } catch (err) {
          throw new Error('failed to write the config to a temporary file')
        }

        return path
      }

      function openEditor (path) {
        return new Promise((resolve, reject) => {
          const child = spawn(editor, [path], { stdio: 'inherit' })

          child.on('exit', (err, code) => {
            if (err) return reject(new Error('error on the editor'))
            resolve(path)
          })
        })
      }

      async function readTempConfig (path) {
        let data

        try {
          data = await promisify(fs.readFile)(path, 'utf8')
        } catch (err) {
          throw new Error('failed to get the updated config')
        }

        try {
          return JSON.parse(data)
        } catch (err) {
          throw new Error(`failed to parse the updated config "${err.message}"`)
        }
      }

      async function saveConfig (config) {
        config = utils.isDaemonOn()
          ? Buffer.from(JSON.stringify(config)) : config

        try {
          await ipfs.config.replace(config)
        } catch (err) {
          throw new Error('failed to save the config')
        }
      }

      const config = await getConfig()
      const tmpPath = saveTempConfig(config)
      await openEditor(tmpPath)
      const updatedConfig = await readTempConfig(tmpPath)
      await saveConfig(updatedConfig)
    })())
  }
}
