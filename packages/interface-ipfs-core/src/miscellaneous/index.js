import { createSuite } from '../utils/suite.js'
import { testId } from './id.js'
import { testVersion } from './version.js'
import { testStop } from './stop.js'
import { testResolve } from './resolve.js'
import { testDns } from './dns.js'

const tests = {
  id: testId,
  version: testVersion,
  dns: testDns,
  stop: testStop,
  resolve: testResolve
}

export default createSuite(tests)
