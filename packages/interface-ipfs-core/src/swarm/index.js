import { createSuite } from '../utils/suite.js'
import { testConnect } from './connect.js'
import { testPeers } from './peers.js'
import { testAddrs } from './addrs.js'
import { testLocalAddrs } from './local-addrs.js'
import { testDisconnect } from './disconnect.js'

const tests = {
  connect: testConnect,
  peers: testPeers,
  addrs: testAddrs,
  localAddrs: testLocalAddrs,
  disconnect: testDisconnect
}

export default createSuite(tests)
