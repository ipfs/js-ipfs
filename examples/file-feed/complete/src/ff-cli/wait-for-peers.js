'use strict'

function waitForPeers (node, feed, cb) {
  let peerList = []
  const timer = setInterval(poll, 1000)

  function poll () {
    node.pubsub.peers(feed, (err, peers) => {
      if (err) {
        return console.error(err)
      }

      if (peers.length > peerList.length) {
        clearInterval(timer)
        peerList = peers

        console.log(`\nFound peers for '${feed}':`)
        peers.forEach((peer) => console.log(peer))

        cb(null, peers)
      }
    })
  }
}

module.exports = waitForPeers
