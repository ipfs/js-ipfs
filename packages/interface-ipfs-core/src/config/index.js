import { createSuite } from '../utils/suite.js'
import { testGet } from './get.js'
import { testSet } from './set.js'
import { testReplace } from './replace.js'
import profiles from './profiles/index.js'

const tests = {
  get: testGet,
  set: testSet,
  replace: testReplace,
  profiles
}

export default createSuite(tests)
