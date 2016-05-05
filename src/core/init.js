'use strict'

const peerId = require('peer-id')
const BlockService = require('ipfs-block-service')
const DagService = require('ipfs-merkle-dag').DAGService
const path = require('path')
const glob = require('glob')
const async = require('async')
const Readable = require('stream').Readable
const fs = require('fs')

module.exports = (repo, opts, callback) => {
  opts = opts || {}
  opts.emptyRepo = opts.emptyRepo || false
  opts.bits = opts.bits || 2048

  // Pre-set config values.
  var config = require('../init-files/default-config.json')

  // Verify repo does not yet exist.
  repo.exists((err, exists) => {
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

    repo.version.set(version, (err) => {
      if (err) { return callback(err) }

      writeConfig()
    })
  }

  // Write the config to the repo.
  function writeConfig () {
    repo.config.set(config, (err) => {
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

    const Importer = require('ipfs-unixfs-engine').importer
    const blocks = new BlockService(repo)
    const dag = new DagService(blocks)

    const initDocsPath = path.join(__dirname, '../init-files/init-docs')

    const i = new Importer(dag)
    i.on('data', (file) => {
    })

    glob(path.join(initDocsPath, '/**/*'), (err, res) => {
      if (err) {
        throw err
      }
      const index = __dirname.lastIndexOf('/')
      async.eachLimit(res, 10, (element, callback) => {
        const addPath = element.substring(index + 1, element.length)
        if (fs.statSync(element).isDirectory()) {
          callback()
        } else {
          const buffered = fs.readFileSync(element)
          var rs = new Readable()
          rs.push(buffered)
          rs.push(null)
          const filePair = {path: addPath, stream: rs}
          i.write(filePair)
          callback()
        }
      }, (err) => {
        if (err) {
          throw err
        }
        i.end()
        return
      })
    })

    i.on('end', () => {
      doneImport(null)
    })

    function doneImport (err) {
      if (err) { return callback(err) }

      // All finished!
      callback(null, true)
    }
  }
}
