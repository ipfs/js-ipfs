'use strict'

const peerId = require('peer-id')
const BlockService = require('ipfs-block-service')
const DagService = require('ipfs-merkle-dag').DAGService
const path = require('path')

module.exports = function init (self) {
  return (opts, callback) => {
    opts = opts || {}
    opts.emptyRepo = opts.emptyRepo || false
    opts.bits = opts.bits || 2048

    // Pre-set config values.
    var config = require('../../init-files/default-config.json')

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
        PrivKey: keys.privKey.toString('base64')
      }

      writeVersion()
    }

    function writeVersion () {
      const version = '3'

      self._repo.version.set(version, (err) => {
        if (err) { return callback(err) }

        writeConfig()
      })
    }

    // Write the config to the repo.
    function writeConfig () {
      self._repo.config.set(config, (err) => {
        if (err) { return callback(err) }

        addDefaultAssets()
      })
    }

    // Add the default assets to the repo.
    function addDefaultAssets () {
      // Skip this step on the browser, or if emptyRepo was supplied.
      const isNode = !global.window
      if (!isNode || opts.emptyRepo) {
        return doneImport(null)
      }

      const importer = require('ipfs-data-importing')
      const blocks = new BlockService(self._repo)
      const dag = new DagService(blocks)

      const initDocsPath = path.join(__dirname, '../../init-files/init-docs')

      importer.import(initDocsPath, dag, {
        recursive: true
      }, doneImport)

      function doneImport (err, stat) {
        if (err) { return callback(err) }

        // All finished!
        callback(null, true)
      }
    }
  }
}
