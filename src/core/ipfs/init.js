'use strict'

const peerId = require('peer-id')
const BlockService = require('ipfs-block-service')
const DagService = require('ipfs-merkle-dag').DAGService
const path = require('path')
const glob = require('glob')
const fs = require('fs')
const importer = require('ipfs-unixfs-engine').importer
const pull = require('pull-stream')
const file = require('pull-file')

module.exports = function init (self) {
  return (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    opts.emptyRepo = opts.emptyRepo || false
    opts.bits = opts.bits || 2048

    let config
    // Pre-set config values.
    try {
      config = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '../../init-files/default-config.json')
        ).toString()
      )
    } catch (err) {
      return callback(err)
    }

    // Verify repo does not yet exist.
    self._repo.exists((err, exists) => {
      if (err) {
        return callback(err)
      }

      if (exists === true) {
        return callback(new Error('repo already exists'))
      }

      generateAndSetKeypair()
    })

    // Generate peer identity keypair + transform to desired format + add to config.
    function generateAndSetKeypair () {
      var keys = peerId.create({
        bits: opts.bits
      })
      config.Identity = {
        PeerID: keys.toB58String(),
        PrivKey: keys.privKey.bytes.toString('base64')
      }

      writeVersion()
    }

    function writeVersion () {
      const version = '3'

      self._repo.version.set(version, (err) => {
        if (err) return callback(err)

        writeConfig()
      })
    }

    // Write the config to the repo.
    function writeConfig () {
      self._repo.config.set(config, (err) => {
        if (err) return callback(err)

        addDefaultAssets()
      })
    }

    // Add the default assets to the repo.
    function addDefaultAssets () {
      // Skip this step on the browser, or if emptyRepo was supplied.
      const isNode = require('detect-node')
      if (!isNode || opts.emptyRepo) {
        return callback(null, true)
      }

      const blocks = new BlockService(self._repo)
      const dag = new DagService(blocks)

      const initDocsPath = path.join(__dirname, '../../init-files/init-docs')
      const index = __dirname.lastIndexOf('/')

      pull(
        pull.values([initDocsPath]),
        pull.asyncMap((val, cb) => {
          glob(path.join(val, '/**/*'), cb)
        }),
        pull.flatten(),
        pull.map((element) => {
          const addPath = element.substring(index + 1, element.length)
          if (fs.statSync(element).isDirectory()) return

          return {
            path: addPath,
            content: file(element)
          }
        }),
        pull.filter(Boolean),
        importer(dag),
        pull.onEnd((err) => {
          if (err) return callback(err)

          callback(null, true)
        })
      )
    }
  }
}
