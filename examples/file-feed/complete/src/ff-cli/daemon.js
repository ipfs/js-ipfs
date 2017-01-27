'use strict'

const path = require('path')
const os = require('os')
const spawnNode = require('../util/spawn-node')
const OrbitDB = require('orbit-db')

const nodeOptions = {
  path: path.join(os.tmpDir() + new Date().toString()),
  signalAddr: '/dns4/star-signal.cloud.ipfs.team'
}

const feed = process.argv[2] || 'hello-world'

spawnNode(nodeOptions, (err, node) => {
  if (err) { throw err }

  const orbitdb = new OrbitDB(node)
  const db = orbitdb.eventlog(feed)

  let peerList = []
  let fileList = []

  db.events.on('ready', () => console.log('OrbitDB is ready!'))
  db.events.on('history', () => console.log('OrbitDB updated!'))
  db.events.on('data', () => console.log('OrbitDB updated locally!'))

  function checkForPeers () {
    node.pubsub.peers(feed, (err, peers) => {
      if (err) {
        return console.error(err)
      }
      if (peers.length > peerList.length) {
        peerList = peers
        console.log(`New peers for '${feed}':`)
        peers.forEach((e) => console.log(e))
      }
    })
  }

  function checkForFiles () {
    const latest = db.iterator({ limit: -1 }).collect()
    if (latest.length > fileList.length) {
      fileList = latest

      const files = latest.reverse().map((e) => {
        return e.payload.value.file.path + ' | ' +
          e.payload.value.file.hash + ' | ' +
          e.payload.value.file.size + ' | ' +
          e.payload.value.mime
      })

      if (latest.length > 0) {
        let output = ``
        output += `------------------------------\n`
        output += `File | Hash | Size | Mime Type\n`
        output += `------------------------------\n`
        output += files.join('\n') + '\n'
        output += `------------------------------\n`
        console.log(output)
      }
    }
  }

  setInterval(checkForPeers, 1000)
  setInterval(checkForFiles, 1000)
})
