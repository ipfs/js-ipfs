import pubsubLs from './ls.js'
import pubsubPeers from './peers.js'
import pubsubPub from './pub.js'
import pubsubSub from './sub.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  pubsubLs,
  pubsubPeers,
  pubsubPub,
  pubsubSub
]
