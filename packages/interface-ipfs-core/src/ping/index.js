import { createSuite } from '../utils/suite.js'
import { testPing } from './ping.js'

const tests = {
  ping: testPing
}

export default createSuite(tests)
