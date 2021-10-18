
import { createSuite } from '../utils/suite.js'
import { testExport } from './export.js'
import { testGet } from './get.js'
import { testPut } from './put.js'
import { testImport } from './import.js'
import { testResolve } from './resolve.js'
import { testDagSharnessT0053 } from './sharness-t0053-dag.js'

const tests = {
  export: testExport,
  get: testGet,
  put: testPut,
  import: testImport,
  resolve: testResolve,
  dagSharnessT0053: testDagSharnessT0053
}

export default createSuite(tests)
