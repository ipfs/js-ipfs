import { createSuite } from '../utils/suite.js'
import { testVersion } from './version.js'
import { testStat } from './stat.js'
import { testGc } from './gc.js'

const tests = {
  version: testVersion,
  stat: testStat,
  gc: testGc
}

export default createSuite(tests)
