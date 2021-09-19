
import { createSuite } from '../utils/suite.js'
import { testGen } from './gen.js'
import { testList } from './list.js'
import { testRename } from './rename.js'
import { testRm } from './rm.js'
import { testImport } from './import.js'

const tests = {
  gen: testGen,
  list: testList,
  rename: testRename,
  rm: testRm,
  import: testImport
}

export default createSuite(tests)
