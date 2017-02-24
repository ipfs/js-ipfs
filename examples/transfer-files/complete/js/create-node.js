'use strict'

window.createNode = (callback) => {
  // Create a new repository for IPFS in a random path always
  const repoPath = '/tmp/ipfs' + Math.random()
  const node = new window.Ipfs({repo: repoPath})

  // Initialize our repository with no extra files
  node.init({ emptyRepo: true }, updateConfig)

  function updateConfig (err) {
    if (err) return callback(err)

    // Retrieve the initialized default configuration
    // node.config.get((err, config) => {
    //   if (err) return callback(err)

    //   // Add our webrtc-star address so we can find other peers easily
    //   const signalDomain = 'star-signal.cloud.ipfs.team'
    //   const wstarMultiaddr = `/libp2p-webrtc-star/dns/${signalDomain}/wss/ipfs/${config.Identity.PeerID}`
    //   config.Addresses.Swarm = config.Addresses.Swarm.concat([ wstarMultiaddr ])

    //   // Set the new configuration
    //   node.config.replace(config, bootNode)
    // })
    bootNode()
  }

  function bootNode (err) {
    if (err) return callback(err)

    node.load((err) => {
      if (err) return callback(err)

      // Actually start all the services and start ipfs
      node.goOnline((err) => {
        if (err) return callback(err)
        callback(null, node)
      })
    })
  }
}
