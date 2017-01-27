 // Need to include this to make webpack happy
import { Buffer } from 'buffer/' // eslint-disable-line no-unused-vars
import EventEmitter from 'events'
import spawnNode from '../util/spawn-node'
import OrbitDB from 'orbit-db'
import { readFileContents } from './read-file'

let instance

class DataStore extends EventEmitter {
  constructor (options) {
    super()
    spawnNode(options, (err, node) => {
      if (err) {
        console.log(err)
      }
      this.ipfs = node
      this.emit('ready')
    })
  }

  // Open an orbit-db database and hook up to the emitted events
  openFeed (name) {
    this.orbitdb = new OrbitDB(this.ipfs)
    this.feed = this.orbitdb.feed(name, { cachePath: '/ipfd/ipfd2.db' })
    this.feed.events.on('ready', () => this.emit('feed'))
    this.feed.events.on('history', () => this.emit('update'))
    this.feed.events.on('data', () => this.emit('update'))
    if (this.timer) clearInterval(this.timer)
    this.timer = setInterval(() => this._updatePeers(name), 1000)
  }

  getFile (hash) {
    return new Promise((resolve, reject) => {
      // Cat the contents of a multihash
      this.ipfs.files.cat(hash)
        .then((stream) => {
          // Buffer all contents of the file as text
          // and once buffered, create a blob for the picture
          let buffer = []
          let bytes = 0
          stream.on('error', (e) => console.error(e))
          stream.on('data', (d) => {
            bytes += d.length
            buffer.push(d)
            this.emit('load', hash, bytes)
          })
          stream.on('end', () => {
            this.emit('load', hash, bytes)
            resolve(buffer)
          })
        })
        .catch(reject)
    })
  }

  addFiles (file) {
    const addToIpfs = (name, content) => {
      return this.ipfs.files.add([{
        path: name,
        content: new Buffer(content)
      }])
    }

    const addToOrbitDB = (file, type) => {
      return this.feed.add({
        ts: new Date().getTime(),
        mime: type,
        file: file
      })
    }

    readFileContents(file)
      .then((content) => addToIpfs(file.name, content))
      .then((files) => {
        files.forEach((e) => addToOrbitDB(e, file.type))
      })
      .then(() => this.emit('file', file))
      .catch((e) => console.error(e))
  }

  connectToPeer (multiaddr) {
    console.log('Connect to:', multiaddr)
    this.ipfs.swarm.connect(multiaddr)
      .then((res) => console.log('Connected to', multiaddr))
      .catch((e) => console.error(e))
  }

  // Get peers from IPFS and emit 'peers' event after updated
  _updatePeers (feed) {
    this.ipfs.pubsub.peers(feed)
      .then((peers) => this.emit('peers', peers))
      .catch((e) => console.error(e))
  }
}

class DataStoreSingleton {
  static init (options) {
    instance = !instance ? new DataStore(options) : instance
    return instance
  }
}

export default DataStoreSingleton
