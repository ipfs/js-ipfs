/* eslint-env mocha */
'use strict'

const each = require('async/each')
const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src')

function createFactory (options) {
  options = options || {}

  options.factoryOptions = options.factoryOptions || {
    type: 'proc',
    exec: IPFS,
    initOptions: {
      privateKey: require('./keys/1.js')
    }
  }

  options.spawnOptions = options.spawnOptions || { initOptions: {
    privateKey: require('./keys/1.js')
  }}

  const ipfsFactory = IPFSFactory.create(options.factoryOptions)
  // Start at two as we use key 1 as default
  let keyID = 2

  return function createCommon () {
    const nodes = []
    let setup, teardown

    if (options.createSetup) {
      setup = options.createSetup({ ipfsFactory, nodes }, options)
    } else {
      setup = (callback) => {
        callback(null, {
          spawnNode (cb) {
            options.spawnOptions.initOptions.privateKey = require(`./keys/${keyID}`)
            keyID = keyID + 1
            ipfsFactory.spawn(options.spawnOptions, (err, _ipfsd) => {
              if (err) {
                return cb(err)
              }

              nodes.push(_ipfsd)
              cb(null, _ipfsd.api)
            })
          }
        })
      }
    }

    if (options.createTeardown) {
      teardown = options.createTeardown({ ipfsFactory, nodes }, options)
    } else {
      teardown = callback => each(nodes, (node, cb) => node.stop(cb), callback)
    }

    return { setup, teardown }
  }
}

exports.create = createFactory
