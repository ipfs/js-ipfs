'use strict'

/*
 * Create an IPFS node helper
 */
window.createNode = (options, callback) => {
  const repoPath = options.path || '/tmp/ipfs' + Math.random()
  const node = new window.Ipfs(repoPath)

  node.init({ emptyRepo: true, bits: 2048 }, updateConfig)

  function updateConfig (err) {
    if (err) {
      return callback(err)
    }

    node.config.get((err, config) => {
      if (err) {
        return callback(err)
      }

      // TODO change to use wstar in DNS instead
      const host = options.signalAddr.split(':')[0] || '127.0.0.1'
      const port = options.signalAddr.split(':')[1] || 9090

      const wstarMultiaddr = `/libp2p-webrtc-star/ip4/${host}/tcp/${port}/ws/ipfs/${config.Identity.PeerID}`

      config.Addresses.Swarm = [ wstarMultiaddr ]

      node.config.replace(config, bootNode)
    })
  }

  function bootNode (err) {
    if (err) {
      return callback(err)
    }

    node.load((err) => {
      if (err) {
        return callback(err)
      }

      node.goOnline((err) => {
        if (err) {
          return callback(err)
        }

        // console.log('IPFS node is ready')
        callback(null, node)
      })
    })
  }
}
