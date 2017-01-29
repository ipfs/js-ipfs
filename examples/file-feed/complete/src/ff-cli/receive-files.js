'use strict'

const path = require('path')
const OrbitDB = require('orbit-db')
const spawnNode = require('../util/spawn-node')
const waitForPeers = require('./wait-for-peers')
const listFiles = require('./list-files')
const nodeOptions = require('./node2.config')

function startDaemon (feed) {
  spawnNode(nodeOptions, (err, node) => {
    if (err) { throw err }

    const orbitdb = new OrbitDB(node)
    const db = orbitdb.eventlog(feed)

    orbitdb.events.on('synced', () => listFiles(db))

    db.events.on('ready', () => {
      console.log('Database ready.')
      listFiles(db)
      
      console.log('Waiting for peers...')
      waitForPeers(node, feed, (err, res) => {
        console.log()
        console.log('Waiting for new files...')        
      })
    })
  })
}

module.exports = startDaemon
