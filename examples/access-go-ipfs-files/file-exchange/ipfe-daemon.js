'use strict'

// const IpfsDaemon = require('ipfs-daemon/src/ipfs-browser-daemon')
const IPFS = require('./src/ipfs')
const OrbitDB = require('orbit-db')

const userId = Math.floor(Math.random() * 1000)

const conf = { 
  IpfsDataDir: '/tmp/addfile-example',
  SignalServer: '127.0.0.1:9090',
}

console.log("Starting...")

const feed = process.argv[2] || "hello-world"

IPFS.create(conf, (err, node) => {
  if (err) {
    console.log(err)
  }
  const ipfs = node
  const orbitdb = new OrbitDB(ipfs)
  const db = orbitdb.eventlog(feed)
  
  let peerList = []
  let fileList = []

  db.events.on('ready', () => console.log("DB ready!"))
  db.events.on('history', () => console.log("DB updated!"))
  db.events.on('data', () => console.log("DB updated locally!"))

  setInterval(() => {
    ipfs.pubsub.peers(feed)
      .then((peers) => {
        if (peers.length > peerList.length) {
          peerList = peers
          console.log(`New peers for '${feed}':`)
          peers.forEach((e) => console.log(e))
        }
      })
      .catch((e) => console.error(e))
  }, 1000)

  const query = () => {
    const latest = db.iterator({ limit: -1 }).collect()
    if (latest.length > fileList.length) {
      fileList = latest

      const files = latest.reverse().map((e) => {
        return e.payload.value.file.path + " | " 
             + e.payload.value.file.hash + " | "
             + e.payload.value.file.size + " | "
             + e.payload.value.mime
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

  setInterval(query, 1000)
})
