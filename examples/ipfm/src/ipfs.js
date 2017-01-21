// import { Buffer } from 'buffer' // eslint-disable-line no-unused-vars
const IPFS = require('ipfs')

function create (options, callback) {
  const repoPath = options.IpfsDataDir || '/ipfd/tmp/'

  const node = new IPFS(repoPath)

  node.init({ emptyRepo: true, bits: 2048 }, (err) => {
    if (err && err.message !== 'repo already exists') {
      return callback(err)
    }

    node.config.get((err, config) => {
      if (err) {
        return callback(err)
      }

      const host = options.SignalServer.split(':')[0] || '127.0.0.1'
      const port = options.SignalServer.split(':')[1] || 9090
      const signalServer = `/libp2p-webrtc-star/ip4/${host}/tcp/${port}/ws/ipfs/${config.Identity.PeerID}`
      
      config.Addresses = {
        Swarm: [
          signalServer
        ],
        API: '',
        Gateway: ''
      }

      config.Discovery.MDNS.Enabled = false

      node.config.replace(config, (err) => {
        if (err) { return callback(err) }

        node.load((err) => {
          if (err) { return callback(err) }
          node.goOnline((err) => {
            if (err) { return callback(err) }
            console.log('IPFS node is ready')
            callback(null, node)
          })
        })
      })
    })
  })
}

module.exports = {
  create: create
}
