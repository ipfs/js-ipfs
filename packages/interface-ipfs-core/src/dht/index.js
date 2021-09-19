import { createSuite } from '../utils/suite.js'
import { testPut } from './put.js'
import { testGet } from './get.js'
import { testFindPeer } from './find-peer.js'
import { testProvide } from './provide.js'
import { testFindProvs } from './find-provs.js'
import { testQuery } from './query.js'
import { testDisabled } from './disabled.js'

const tests = {
  put: testPut,
  get: testGet,
  findPeer: testFindPeer,
  provide: testProvide,
  findProvs: testFindProvs,
  query: testQuery,
  disabled: testDisabled
}

export default createSuite(tests)
