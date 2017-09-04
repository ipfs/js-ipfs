'use strict'

const io = require('socket.io-client')
const ipfsAPI = require('../../src')

module.exports = Factory

function Factory () {
  if (!(this instanceof Factory)) {
    return new Factory()
  }
  const sioOptions = {
    transports: ['websocket'],
    'force new connection': true
  }
  const sioUrl = 'http://localhost:55155'
  let sioConnected = false
  let ioC

  this.spawnNode = (repoPath, config, callback) => {
    if (typeof repoPath === 'function') {
      callback = repoPath
      repoPath = undefined
    }
    if (typeof config === 'function') {
      callback = config
      config = undefined
    }

    if (sioConnected) {
      spawnNode()
    } else {
      ioC = io.connect(sioUrl, sioOptions)
      ioC.once('connect_error', callback)
      ioC.once('connect', () => {
        sioConnected = true
        spawnNode()
      })
    }

    function spawnNode () {
      ioC.once('fc-node', (apiAddr) => {
        const ipfs = ipfsAPI(apiAddr)
        ipfs.apiAddr = apiAddr
        callback(null, ipfs)
      })
      ioC.emit('fs-spawn-node', repoPath, config)
    }
  }

  this.dismantle = function (callback) {
    ioC.once('fc-nodes-shutdown', (err) => {
      ioC.disconnect()
      sioConnected = false
      callback(err)
    })
    ioC.emit('fs-dismantle')
  }
}
