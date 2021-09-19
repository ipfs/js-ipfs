
import { createSuite } from '../utils/suite.js'
import { testVersion } from './version.js'
import { testStat } from './stat.js'
import { testGc } from './gc.js'

const tests = {
  version: require('./version'),
  stat: require('./stat'),
  gc: require('./gc')
}

export default createSuite(tests)
