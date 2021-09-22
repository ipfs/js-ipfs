import { createSuite } from '../utils/suite.js'
import { testAdd } from './add.js'
import { testClear } from './clear.js'
import { testList } from './list.js'
import { testReset } from './reset.js'
import { testRm } from './rm.js'

const tests = {
  add: testAdd,
  clear: testClear,
  list: testList,
  reset: testReset,
  rm: testRm
}

export default createSuite(tests)
