'use strict'

const peerId = require('peer-id')
const IpfsBlocks = require('ipfs-blocks').BlockService
const IpfsDagService = require('ipfs-merkle-dag').DAGService
const path = require('path')
const glob = require("glob")
const async = require('async')
const streamifier = require('streamifier')
const fs = require('fs')

module.exports = (repo, opts, callback) => {
  opts = opts || {}
  opts.emptyRepo = opts.emptyRepo || false
  opts.bits = opts.bits || 2048

  // Pre-set config values.
  var config = require('../init-files/default-config.json')

  // Verify repo does not yet exist.
  repo.exists((err, res) => {
    if (err) { return callback(err) }
    if (res === true) {
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

    const importer = require('ipfs-unixfs-engine').importer
    const blocks = new IpfsBlocks(repo)
    const dag = new IpfsDagService(blocks)

    const initDocsPath = path.join(__dirname, '../init-files/init-docs')

    const i = new importer(dag)
    i.on('data', (file) => {
    })

    glob(path.join(initDocsPath,'/**/*'), (err, res) => {
      const index = __dirname.lastIndexOf('/')
      async.eachLimit(res, 10, (element, callback) => {
        const addPath = element.substring(index + 1, element.length)
        if (fs.statSync(element).isDirectory()) {
          callback()
        } else {
          const buffered = fs.readFileSync(element)
          const r = streamifier.createReadStream(buffered)
          const filePair = {path: addPath, stream: r}
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
