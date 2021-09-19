import { createSuite } from '../utils/suite.js'
import { testGet } from './get.js'
import { testPut } from './put.js'
import { testRm } from './rm.js'
import { testStat } from './stat.js'

const tests = {
  get: testGet,
  put: testPut,
  rm: testRm,
  stat: testStat
}

export default createSuite(tests)
