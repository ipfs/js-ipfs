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

      const wstarMultiaddr = `/libp2p-webrtc-star/dns4/${options.signalAddr}/wss/ipfs/${config.Identity.PeerID}`

      config.Addresses.Swarm = config.Addresses.Swarm.concat([ wstarMultiaddr ])

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
