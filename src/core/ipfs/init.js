'use strict'

const peerId = require('peer-id')
const BlockService = require('ipfs-block-service')
const DagService = require('ipfs-merkle-dag').DAGService
const path = require('path')
const glob = require('glob')
const parallelLimit = require('run-parallel-limit')
const Readable = require('stream').Readable
const fs = require('fs')
const Importer = require('ipfs-unixfs-engine').importer

module.exports = function init (self) {
  return (opts, callback) => {
    opts = opts || {}
    opts.emptyRepo = opts.emptyRepo || false
    opts.bits = opts.bits || 2048

    // Pre-set config values.
    var config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../init-files/default-config.json')).toString())

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
      const isNode = require('detect-node')
      if (!isNode || opts.emptyRepo) {
        return doneImport(null)
      }

      const blocks = new BlockService(self._repo)
      const dag = new DagService(blocks)

      const initDocsPath = path.join(__dirname, '../../init-files/init-docs')

      const i = new Importer(dag)
      i.resume()

      glob(path.join(initDocsPath, '/**/*'), (err, res) => {
        if (err) {
          throw err
        }
        const index = __dirname.lastIndexOf('/')
        parallelLimit(res.map((element) => (callback) => {
          const addPath = element.substring(index + 1, element.length)
          if (!fs.statSync(element).isDirectory()) {
            const rs = new Readable()
            rs.push(fs.readFileSync(element))
            rs.push(null)
            const filePair = {path: addPath, content: rs}
            i.write(filePair)
          }
          callback()
        }), 10, (err) => {
          if (err) {
            throw err
          }
          i.end()
        })
      })

      i.once('end', () => {
        doneImport(null)
      })

      function doneImport (err, stat) {
        if (err) {
          return callback(err)
        }

        // All finished!
        callback(null, true)
      }
    }
  }
}
