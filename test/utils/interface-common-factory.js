/* eslint-env mocha */
'use strict'

const each = require('async/each')
const IPFSFactory = require('ipfsd-ctl')
const ipfsClient = require('ipfs-http-client')
const callbackify = require('callbackify')
const mergeOptions = require('merge-options')
const IPFS = require('../../src')

function createFactory (options) {
  options = options || {}

  options.factoryOptions = options.factoryOptions || { type: 'proc', exec: IPFS }
  options.spawnOptions = mergeOptions({
    initOptions: { bits: 512 },
    config: {
      Bootstrap: [],
      Discovery: {
        MDNS: {
          Enabled: false
        },
        webRTCStar: {
          Enabled: false
        }
      }
    },
    preload: { enabled: false }
  }, options.spawnOptions)

  if (options.factoryOptions.type !== 'proc') {
    options.factoryOptions.IpfsClient = options.factoryOptions.IpfsClient || ipfsClient
  }

  const ipfsFactory = IPFSFactory.create(options.factoryOptions)
  const callbackifiedSpawn = callbackify.variadic(
    ipfsFactory.spawn.bind(ipfsFactory))

  return function createCommon () {
    const nodes = []
    let setup, teardown

    if (options.createSetup) {
      setup = options.createSetup({ ipfsFactory, nodes }, options)
    } else {
      setup = (callback) => {
        callback(null, {
          spawnNode (cb) {
            callbackifiedSpawn(options.spawnOptions, (err, _ipfsd) => {
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
      teardown = callback => each(nodes, (node, cb) => callbackify.variadic(node.stop.bind(node))(cb), callback)
    }

    return { setup, teardown }
  }
}

exports.create = createFactory
