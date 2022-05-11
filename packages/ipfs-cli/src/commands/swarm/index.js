import swarmAddrs from './addrs.js'
import swarmConnect from './connect.js'
import swarmDisconnect from './disconnect.js'
import swarmPeers from './peers.js'

/** @type {import('yargs').CommandModule[]} */
export const commands = [
  swarmAddrs,
  swarmConnect,
  swarmDisconnect,
  swarmPeers
]
