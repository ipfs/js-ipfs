'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const spawnNode = require('../util/spawn-node')
const OrbitDB = require('orbit-db')
const mime = require('mime')

function readFileContents (filePath) {
  let content

  try {
    content = fs.readFileSync(filePath)
  } catch (err) { throw err }

  return {
    content: content,
    mime: mime.lookup(filePath)
  }
}

const feed = process.argv[2] || 'hello-world'
const fileToAdd = process.argv[3]

if (!fileToAdd) {
  console.error('Filename required!')
  console.error('Usage: ipfe-add <feed-name> <filename>')
  process.exit(1)
}

const nodeOptions = {
  path: path.join(os.tmpDir() + new Date().toString()),
  signalAddr: '/dns4/star-signal.cloud.ipfs.team'
}

spawnNode(nodeOptions, (err, node) => {
  if (err) { throw err }

  const orbitdb = new OrbitDB(node)
  const db = orbitdb.eventlog(feed)

  let peerList = []

  db.events.on('ready', () => {
    const timer = setInterval(checkForPeers, 1000)

    function checkForPeers () {
      node.pubsub.peers(feed, (err, peers) => {
        if (err) {
          return console.error(err)
        }

        if (peers.length > peerList.length) {
          clearInterval(timer)
          peerList = peers

          console.log(`New peers for '${feed}':`)
          peers.forEach((peer) => console.log(peer))

          // ?? Apparently this code is just sending the file to the first
          // peer it finds?
          return add(fileToAdd)
        }
      })
    }
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
    const file = readFileContents(filePath)
    return addToIpfs(filePath, file.content)
      .then((res) => addToOrbitDB(res[0], file.mime))
      .then(() => query())
  }

  const query = () => {
    const latest = db.iterator({ limit: -1 }).collect()

    const files = latest.reverse().map((e) => {
      return e.payload.value.file.path + ' | ' +
        e.payload.value.file.hash + ' | ' +
        e.payload.value.file.size + ' | ' +
        e.payload.value.mime
    })

    let output = ``
    output += `------------------------------\n`
    output += `File | Hash | Size | Mime Type\n`
    output += `------------------------------\n`
    output += files.join('\n') + '\n'
    output += `------------------------------\n`
    console.log(output)
  }
})
