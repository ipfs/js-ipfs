'use strict'

const fs = require('fs')
const IPFS = require('./src/ipfs')
const OrbitDB = require('orbit-db')
const mime = require('mime')

const conf = {
  IpfsDataDir: '/tmp/addfile-example-add',
  SignalServer: '127.0.0.1:9090'
}

console.log('Starting...')

const feed = process.argv[2] || 'hello-world'
const filename = process.argv[3]

if (!filename) {
  console.error('Filename required!')
  console.error('Usage: ipfe-add <feed-name> <filename>')
  process.exit(1)
}

IPFS.create(conf, (err, node) => {
  if (err) {
    console.log(err)
  }
  const ipfs = node
  const orbitdb = new OrbitDB(ipfs)
  const db = orbitdb.eventlog(feed)

  let peerList = []
  let fileList = []

  const readFileContents = (filePath) => {
    let content

    try {
      content = fs.readFileSync(filePath)
    } catch (e) {
      console.error(e)
      process.exit(1)
    }

    return {
      content: content,
      mime: mime.lookup(filePath)
    }
  }

  const addToIpfs = (name, content) => {
    console.log('add to ipfs', name)
    return ipfs.files.add([{
      path: name,
      content: new Buffer(content)
    }])
  }

  const addToOrbitDB = (file, type) => {
    console.log('add to orbit-db', file)
    return db.add({
      ts: new Date().getTime(),
      mime: type,
      file: file
    })
  }

  const add = (filePath) => {
    const file = readFileContents(filePath)
    return addToIpfs(filePath, file.content)
      .then((res) => addToOrbitDB(res[0], file.mime))
      .then(() => query())
  }

  const query = () => {
    const latest = db.iterator({ limit: -1 }).collect()
    const files = latest.reverse().map((e) => {
      return e.payload.value.file.path + ' | '
           + e.payload.value.file.hash + ' | '
           + e.payload.value.file.size + ' | '
           + e.payload.value.mime
    })

    let output = ``
    output += `------------------------------\n`
    output += `File | Hash | Size | Mime Type\n`
    output += `------------------------------\n`
    output += files.join('\n') + '\n'
    output += `------------------------------\n`
    console.log(output)
  }

  db.events.on('ready', () => {
    const timer = setInterval(() => {
      ipfs.pubsub.peers(feed)
        .then((peers) => {
          if (peers.length > peerList.length) {
            clearInterval(timer)
            peerList = peers
            console.log(`New peers for '${feed}':`)
            peers.forEach((e) => console.log(e))
            return add(filename)
          }
        })
        .catch((e) => console.error(e))
    }, 1000)
  })
})
