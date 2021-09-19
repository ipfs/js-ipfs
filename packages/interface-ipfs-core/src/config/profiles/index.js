import { createSuite } from '../../utils/suite.js'
import { testApply } from './apply.js'
import { testList } from './list.js'

const tests = {
  apply: testApply,
  list: testList
}

export default createSuite(tests, 'config')
