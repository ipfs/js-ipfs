import { createSuite } from '../utils/suite.js'
import { testAdd } from './add.js'
import { testAddAll } from './add-all.js'
import { testLs } from './ls.js'
import { testRm } from './rm.js'
import { testRmAll } from './rm-all.js'
import testRemote from './remote/index.js'

const tests = {
  add: testAdd,
  addAll: testAddAll,
  ls: testLs,
  rm: testRm,
  rmAll: testRmAll,
  remote: testRemote
}

export default createSuite(tests)
