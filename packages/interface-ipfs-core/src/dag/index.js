
import { createSuite } from '../utils/suite.js'
import { testExport } from './export.js'
import { testGet } from './get.js'
import { testPut } from './put.js'
import { testImport } from './import.js'
import { testResolve } from './resolve.js'

const tests = {
  export: testExport,
  get: testGet,
  put: testPut,
  import: testImport,
  resolve: testResolve
}

export default createSuite(tests)
