
import { createSuite } from '../utils/suite.js'

const tests = {
  ping: require('./ping')
}

export default createSuite(tests)
