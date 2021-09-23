import { createSuite } from '../utils/suite.js'
import { testNew } from './new.js'
import { testPut } from './put.js'
import { testGet } from './get.js'
import { testData } from './data.js'
import { testLinks } from './links.js'
import { testStat } from './stat.js'
import testPatch from './patch/index.js'

const tests = {
  new: testNew,
  put: testPut,
  get: testGet,
  data: testData,
  links: testLinks,
  stat: testStat,
  patch: testPatch
}

export default createSuite(tests)
