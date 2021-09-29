import { createSuite } from '../../utils/suite.js'
import { testAddLink } from './add-link.js'
import { testRmLink } from './rm-link.js'
import { testAppendData } from './append-data.js'
import { testSetData } from './set-data.js'

const tests = {
  addLink: testAddLink,
  rmLink: testRmLink,
  appendData: testAppendData,
  setData: testSetData
}

export default createSuite(tests, 'patch')
