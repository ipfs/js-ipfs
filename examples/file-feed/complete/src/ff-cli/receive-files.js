'use strict'

const OrbitDB = require('orbit-db')
// const ipfsApi = require('ipfs-api')
const spawnNode = require('../util/spawn-node')
const waitForPeers = require('./wait-for-peers')
const listFiles = require('./list-files')
const nodeOptions = require('./node2.config')

function receiveFiles (feed) {
  spawnNode(nodeOptions, (err, node) => {
    if (err) { throw err }

    // const node = ipfsApi('localhost', 5001)
    const orbitdb = new OrbitDB(node)
    const db = orbitdb.eventlog(feed)

    orbitdb.events.on('synced', () => listFiles(db))

    db.events.on('ready', () => {
      console.log('Database ready.')
      listFiles(db)

      node.swarm.connect('/ip4/0.0.0.0/tcp/9999/ws/ipfs/QmZGH8GeASSkSZoNLPEBu1MqtzLTERNUEwh9yTHLEF5kcW', (err, res) => {
        if (err) { throw err }
        console.log('Waiting for peers...')
        waitForPeers(node, feed, (err, res) => {
          if (err) { throw err }
          console.log()
          console.log('Waiting for new files...')
        })
      })
    })
  })
}

module.exports = receiveFiles
