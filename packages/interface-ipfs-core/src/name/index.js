import { createSuite } from '../utils/suite.js'
import { testPublish } from './publish.js'
import { testResolve } from './resolve'

const tests = {
  publish: testPublish,
  resolve: testResolve
}

export default createSuite(tests)
