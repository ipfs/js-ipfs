'use strict'

const OrbitDB = require('orbit-db')
// const ipfsApi = require('ipfs-api')
const spawnNode = require('../util/spawn-node')
const waitForPeers = require('./wait-for-peers')
const listFiles = require('./list-files')
const readFileContents = require('./read-file-contents')
const nodeOptions = require('./node1.config.js')

function addFile (feed, fileToAdd) {
  spawnNode(nodeOptions, (err, node) => {
    // console.log('Connecting to ipfs daemon...')
    // const node = ipfsApi('localhost', 5001)

    console.log('Initialize OrbitDB')
    const orbitdb = new OrbitDB(node)
    const db = orbitdb.eventlog(feed, { cachePath: nodeOptions.orbitdbPath })

    db.events.on('ready', () => {
      console.log('Database ready')
      console.log()
      console.log('Searching for peers...')

      waitForPeers(node, feed, (err, peers) => {
        if (err) { throw err }
        // ?? Apparently this code is just sending the file to the first
        // peer it finds?
        // haad: no, it sends it to pubsub when it finds at least one peer
        add(fileToAdd)
          .then(() => console.log(`Added '${fileToAdd}' to '${feed}'`))
      })
    })

    function addToIpfs (name, content) {
      return node.files.add([{
        path: name,
        content: new Buffer(content)
      }])
    }

    function addToOrbitDB (file, type) {
      return db.add({
        ts: new Date().getTime(),
        mime: type,
        file: file
      })
    }

    function add (filePath) {
      let file
      try {
        file = readFileContents(filePath)
      } catch (e) { throw e }

      return addToIpfs(filePath, file.content)
        .then((res) => addToOrbitDB(res[0], file.mime))
        .then(() => listFiles(db))
    }

    function exit () {
      setTimeout(() => process.exit(0), 1000)
    }
  })
}

module.exports = addFile
