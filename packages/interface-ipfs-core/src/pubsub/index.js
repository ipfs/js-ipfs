import { createSuite } from '../utils/suite.js'
import { testPublish } from './publish.js'
import { testSubscribe } from './subscribe.js'
import { testUnsubscribe } from './unsubscribe.js'
import { testPeers } from './peers.js'
import { testLs } from './ls.js'

const tests = {
  publish: testPublish,
  subscribe: testSubscribe,
  unsubscribe: testUnsubscribe,
  peers: testPeers,
  ls: testLs
}

export default createSuite(tests)
